import json
import os
import re
from difflib import SequenceMatcher
from datetime import datetime, timezone as dt_timezone
from urllib.error import URLError, HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import requests
from dotenv import load_dotenv
# Load environment variables from .env file relative to this file
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

from .models import Asset, Holding, UserProfile
from .services.market_data import get_quote

GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.1-8b-instant')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

import sys
IS_TESTING = 'test' in sys.argv

# Auto-enable LLM in runtime if any API key is present, unless explicitly disabled
raw_use_llm = os.getenv('USE_LLM_MENTOR', '')
if IS_TESTING:
    USE_LLM_MENTOR = raw_use_llm.lower() in {'1', 'true', 'yes'}
else:
    if raw_use_llm.lower() in {'0', 'false', 'no'}:
        USE_LLM_MENTOR = False
    else:
        USE_LLM_MENTOR = bool(GROQ_API_KEY or GEMINI_API_KEY or OPENAI_API_KEY)



def _fetch_json(url: str, timeout: int = 4):
    request = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode('utf-8'))


def _normalize_text(value):
    return re.sub(r'\s+', ' ', str(value or '')).strip()


def _search_tokens(value):
    tokens = re.findall(r'[a-z0-9]+', _normalize_text(value).lower())
    stopwords = {
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'buy', 'can', 'did', 'do', 'does', 'for', 'from',
        'how', 'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'should', 'sell', 'the', 'to',
        'today', 'trading', 'was', 'what', 'when', 'where', 'which', 'with', 'would', 'you', 'your',
        'stock', 'stocks', 'share', 'shares', 'position', 'positions', 'invest', 'investment', 'portfolio',
    }
    return {token for token in tokens if len(token) >= 3 and token not in stopwords}


def _matches_asset_name(message, asset):
    normalized_message = _normalize_text(message).lower()
    symbol = asset.symbol.lower()
    name = _normalize_text(asset.name).lower()

    if re.search(r'(?<!\w)' + re.escape(symbol) + r'(?!\w)', normalized_message):
        return True

    if name and name in normalized_message:
        return True

    return bool(_search_tokens(normalized_message) & _search_tokens(asset.name))


def _asset_match_score(message, asset):
    normalized_message = _normalize_text(message).lower()
    if not normalized_message:
        return 0.0

    symbol = asset.symbol.lower()
    name = _normalize_text(asset.name).lower()
    message_tokens = _search_tokens(normalized_message)
    asset_tokens = _search_tokens(asset.name)

    score = 0.0
    if re.search(r'(?<!\w)' + re.escape(symbol) + r'(?!\w)', normalized_message):
        score += 1.0

    if name and name in normalized_message:
        score += 0.9

    overlap = len(message_tokens & asset_tokens)
    if overlap:
        score += min(0.6, overlap * 0.3)

    score += SequenceMatcher(None, normalized_message, name or symbol).ratio() * 0.5
    return score


def _get_stock_catalog_symbols(limit=6):
    return list(
        Asset.objects.live_stocks()
        .order_by('symbol')
        .values_list('symbol', flat=True)[:limit]
    )


def _fallback_assets(symbols):
    assets = list(Asset.objects.filter(symbol__in=symbols).exclude(symbol__icontains='TEST', name=''))
    if not assets:
        assets = list(
            Asset.objects.live_stocks().order_by('symbol')[:4]
        )

    return [
        {
            'symbol': asset.symbol,
            'name': asset.name,
            'price': asset.price,
            'change': asset.change,
            'source': 'local',
        }
        for asset in assets
    ]


def fetch_quotes(symbols):
    symbols = [symbol.upper() for symbol in symbols if symbol]
    if not symbols:
        return []

    quotes = []
    for symbol in symbols:
        try:
            quote_data = get_quote(symbol)
            if not quote_data:
                continue
            asset = Asset.objects.filter(symbol__iexact=symbol).first()
            quotes.append(
                {
                    'symbol': symbol,
                    'name': asset.name if asset else symbol,
                    'price': float(quote_data.get('price', 0) or 0),
                    'change': float(quote_data.get('change', 0) or 0),
                    'currency': 'USD',
                    'source': 'finnhub',
                }
            )
        except Exception:
            continue

    if quotes:
        return quotes

    try:
        query = urlencode({'symbols': ','.join(symbols)})
        data = _fetch_json(f'https://query1.finance.yahoo.com/v7/finance/quote?{query}')
        results = data.get('quoteResponse', {}).get('result', [])
        quotes = []
        for item in results:
            price = item.get('regularMarketPrice')
            change = item.get('regularMarketChangePercent')
            if price is None:
                continue
            quotes.append(
                {
                    'symbol': item.get('symbol'),
                    'name': item.get('shortName') or item.get('longName') or item.get('symbol'),
                    'price': float(price),
                    'change': float(change or 0),
                    'currency': item.get('currency') or 'USD',
                    'source': 'yahoo',
                }
            )
        return quotes
    except (URLError, HTTPError, TimeoutError, ValueError, KeyError, TypeError):
        return _fallback_assets(symbols)


def fetch_news(symbols):
    items = []
    seen_links = set()

    for symbol in symbols:
        try:
            query = urlencode({'q': symbol, 'newsCount': 3, 'quotesCount': 0})
            data = _fetch_json(f'https://query1.finance.yahoo.com/v1/finance/search?{query}')
            for article in data.get('news', [])[:3]:
                link = article.get('link') or ''
                if link and link in seen_links:
                    continue
                if link:
                    seen_links.add(link)
                items.append(
                    {
                        'title': _normalize_text(article.get('title')),
                        'publisher': _normalize_text(article.get('publisher')),
                        'link': link,
                        'published_at': datetime.fromtimestamp(article.get('providerPublishTime', 0), tz=dt_timezone.utc).isoformat() if article.get('providerPublishTime') else None,
                        'source': 'yahoo',
                    }
                )
        except (URLError, HTTPError, TimeoutError, ValueError, KeyError, TypeError, OSError):
            continue

    if items:
        return items[:6]

    fallback_items = []
    for asset in Asset.objects.filter(symbol__in=symbols).exclude(symbol__icontains='TEST', name='')[:3]:
        direction = 'up' if asset.change >= 0 else 'down'
        fallback_items.append(
            {
                'title': f'{asset.symbol} is trading {direction} {abs(asset.change):.2f}% in the latest session',
                'publisher': 'MarketMind',
                'link': '',
                'published_at': None,
                'source': 'local',
            }
        )

    return fallback_items


def extract_symbols(message, default_symbols=None):
    message = (message or '').upper()
    default_symbols = default_symbols or []
    assets = list(Asset.objects.live_stocks().order_by('symbol'))
    symbols = []

    ranked = sorted(assets, key=lambda asset: _asset_match_score(message, asset), reverse=True)
    if ranked and _asset_match_score(message, ranked[0]) >= 0.55:
        symbols.append(ranked[0].symbol.upper())

    for asset in assets:
        if _matches_asset_name(message, asset):
            symbols.append(asset.symbol.upper())

    if not symbols:
        symbols = [symbol.upper() for symbol in default_symbols if symbol]

    if not symbols:
        symbols = [symbol.upper() for symbol in _get_stock_catalog_symbols(limit=6)]

    return list(dict.fromkeys(symbols))[:6]


def build_portfolio_context(user):
    profile = UserProfile.objects.get_or_create(user=user)[0]
    holdings = Holding.objects.filter(user=user).select_related('asset')
    holdings_payload = []
    symbols = []

    for holding in holdings:
        assets_symbol = holding.asset.symbol
        symbols.append(assets_symbol)
        holdings_payload.append(
            {
                'symbol': assets_symbol,
                'name': holding.asset.name,
                'shares': holding.shares,
                'avg_price': holding.avg_price,
                'value': holding.shares * holding.asset.price,
                'return_pct': ((holding.asset.price - holding.avg_price) / holding.avg_price * 100) if holding.avg_price else 0,
            }
        )

    if not symbols:
        symbols = [symbol.upper() for symbol in _get_stock_catalog_symbols(limit=4)]

    return profile, holdings_payload, symbols


def _label(item):
    name = item.get('name', '')
    symbol = item.get('symbol', '')
    if name and name != symbol:
        return f"{name} ({symbol})"
    return symbol


def build_llm_prompt(message, quotes, holdings, cash, history=None):
    history = history or []
    quote_lines = []
    for item in quotes[:5]:
        quote_lines.append(
            f"- {_label(item)} @ {item.get('price', 0):.2f} ({item.get('change', 0):+.2f}%)"
        )

    holding_lines = []
    for item in holdings[:5]:
        holding_lines.append(
            f"- {_label(item)} shares={item.get('shares', 0)} return_pct={item.get('return_pct', 0):.2f}"
        )

    safe_quote_lines = quote_lines if quote_lines else ['- No quote data available']
    safe_holding_lines = holding_lines if holding_lines else ['- No holdings available']
    conversation_lines = []
    for item in history[-6:]:
        role = _normalize_text(item.get('role', '')).lower()
        content = _normalize_text(item.get('content', ''))
        if content:
            speaker = 'Assistant' if role == 'assistant' else 'User'
            conversation_lines.append(f'- {speaker}: {content}')

    context = [
        'You are MarketMind, a concise trading assistant for a stock simulation app.',
        'Always refer to stocks by their full company name followed by ticker in parentheses, e.g. Apple Inc. (AAPL).',
        'Only use the prices provided in the market context below — never invent or guess prices.',
        'Use the user message plus the market context below to answer in 2-4 short sentences.',
        f"User message: {message or ''}",
        'Recent conversation:',
        *(conversation_lines if conversation_lines else ['- No prior conversation available']),
        'Market context:',
        *safe_quote_lines,
        'Portfolio context:',
        *safe_holding_lines,
        f'Cash: {cash:,.2f}',
        'Avoid giving guaranteed financial advice. Frame suggestions as educational guidance only.',
    ]
    return '\n'.join(context)


def call_llm(message, quotes, holdings, cash, history=None):
    prompt = build_llm_prompt(message, quotes, holdings, cash, history=history)
    system_instruction = 'You are a helpful stock-trading mentor who answers briefly and clearly. Always refer to stocks by their full company name with ticker in parentheses (e.g. Apple Inc. (AAPL)). Only use the prices given in the context — never invent prices.'

    # Try Gemini first if key is present
    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"System Instruction: {system_instruction}\n\nUser Context and Question:\n{prompt}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 220
                }
            }
            response = requests.post(
                url,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=20
            )
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception:
            pass

    # Try Groq next
    if GROQ_API_KEY:
        try:
            payload = {
                'model': GROQ_MODEL,
                'messages': [
                    {'role': 'system', 'content': system_instruction},
                    {'role': 'user', 'content': prompt},
                ],
                'temperature': 0.3,
                'max_tokens': 220,
            }
            response = requests.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {GROQ_API_KEY}',
                    'Content-Type': 'application/json',
                },
                json=payload,
                timeout=20,
            )
            response.raise_for_status()
            data = response.json()
            return data['choices'][0]['message']['content'].strip()
        except Exception:
            pass

    # Try OpenAI last
    if OPENAI_API_KEY:
        try:
            payload = {
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': system_instruction},
                    {'role': 'user', 'content': prompt},
                ],
                'temperature': 0.3,
                'max_tokens': 220,
            }
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {OPENAI_API_KEY}',
                    'Content-Type': 'application/json',
                },
                json=payload,
                timeout=20,
            )
            response.raise_for_status()
            data = response.json()
            return data['choices'][0]['message']['content'].strip()
        except Exception:
            pass

    return None


def summarize_market(quotes, holdings, cash):
    if not quotes:
        return 'I could not load fresh market quotes, so I am using the local market board as a fallback.'

    strongest = max(quotes, key=lambda item: item.get('change', 0))
    weakest = min(quotes, key=lambda item: item.get('change', 0))
    lines = [
        f"{_label(strongest)} is leading today at {strongest['price']:.2f} ({strongest['change']:+.2f}%).",
        f"{_label(weakest)} is the weakest name in the current basket at {weakest['price']:.2f} ({weakest['change']:+.2f}%).",
    ]

    if holdings:
        best_holding = max(holdings, key=lambda item: item.get('return_pct', 0))
        worst_holding = min(holdings, key=lambda item: item.get('return_pct', 0))
        lines.append(
            f"Your best holding is {_label(best_holding)} and your most pressured holding is {_label(worst_holding)}."
        )

    if cash is not None:
        lines.append(f'You have {cash:.2f} in cash, which gives you room to wait for better entries.')

    return ' '.join(lines)


def generate_reply(message, quotes, holdings, cash, history=None):
    if USE_LLM_MENTOR:
        llm_reply = call_llm(message, quotes, holdings, cash, history=history)
        if llm_reply:
            return llm_reply

    normalized = (message or '').strip().lower()
    if not normalized:
        if not holdings:
            return 'Welcome! Start by opening Markets and placing a small Buy order. Once you trade, head to Profile to complete the starter tasks and track your progress.'
        return 'Ask me about a stock, trade idea, or risk check and I will break it down using the latest prices and market headlines.'

    strongest = max(quotes, key=lambda item: item.get('change', 0)) if quotes else None
    weakest = min(quotes, key=lambda item: item.get('change', 0)) if quotes else None
    portfolio_value = cash + sum(float(item.get('value', 0) or 0) for item in holdings)

    if any(word in normalized for word in ['buy', 'enter', 'invest', 'what should i buy', 'buy today']):
        if strongest:
            return (
                f"If you want a buy setup, {_label(strongest)} has the cleanest momentum right now at {strongest['price']:.2f} "
                f"({strongest['change']:+.2f}%). I would size it carefully and wait for confirmation instead of chasing a full position."
            )
        if not holdings:
            return 'Welcome to your first trade. Open Markets, pick a stock, choose Buy, and start small. After that, visit Profile to complete the starter tasks and keep checking your portfolio.'
        return 'I would wait for a stronger trend or a better pullback before entering a new position.'

    if any(word in normalized for word in ['sell', 'exit', 'cut', 'trim']):
        if weakest:
            return (
                f"For an exit review, {_label(weakest)} is the weakest name I am seeing at {weakest['price']:.2f} "
                f"({weakest['change']:+.2f}%). Trim first if the thesis has broken."
            )
        if not holdings:
            return 'You do not own any holdings yet, so start with a small Buy order in Markets. Once you have a position, use Sell from Portfolio to lock in gains or reduce risk.'
        return 'If the thesis is broken or your sizing is too large, reducing risk is the right move.'

    if any(word in normalized for word in ['portfolio', 'balance', 'account', 'value', 'holdings', 'performance']):
        if holdings:
            best_holding = max(holdings, key=lambda item: item.get('return_pct', 0))
            return (
                f"Your portfolio is currently worth {portfolio_value:,.2f} with {cash:,.2f} in cash. "
                f"{_label(best_holding)} is your strongest position so far, so keep monitoring that thesis closely."
            )
        return f'Your portfolio is currently worth {portfolio_value:,.2f} with {cash:,.2f} in cash. Start with a small buy order to build your first position.'

    if any(word in normalized for word in ['news', 'headline', 'latest']):
        if quotes:
            lead = ', '.join(f"{_label(item)} {item['change']:+.2f}%" for item in quotes[:3])
            return f'The current market tone is mixed to bullish on {lead}. The headlines are moving around those names right now.'
        return 'I am tracking live headlines, but I could not load them just now.'

    if any(word in normalized for word in ['risk', 'safe', 'volatile']):
        if holdings:
            worst_holding = min(holdings, key=lambda item: item.get('return_pct', 0))
            return (
                f"Your biggest risk is concentration around {_label(worst_holding)}. Keep position size smaller there and wait for confirmation."
            )
        return 'Your risk control starts with smaller sizing and a clear invalidation level on every trade.'

    if any(word in normalized for word in ['task', 'challenge', 'complete', 'goal']):
        return 'Head to Profile and review your active tasks. Completing your first trade, building a few profitable positions, and growing the portfolio will mark those challenges complete.'

    if strongest and weakest:
        return (
            f"{_label(strongest)} is the momentum leader and {_label(weakest)} is lagging. "
            f"That usually means buy strength carefully and avoid averaging down into the weakest tape."
        )

    return 'I can help you compare momentum, news, and risk. Ask about a ticker or tell me if you want a buy, sell, or watchlist view.'
