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

    for asset in assets:
        if _matches_asset_name(message, asset):
            symbols.append(asset.symbol.upper())

    normalized = message.lower()
    tokens = re.findall(r'[a-z0-9]+', normalized)
    ignored_words = {
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'buy', 'can', 'did', 'do', 'does', 'for', 'from',
        'how', 'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'should', 'sell', 'the', 'to',
        'today', 'trading', 'was', 'what', 'when', 'where', 'which', 'with', 'would', 'you', 'your',
        'stock', 'stocks', 'share', 'shares', 'position', 'positions', 'invest', 'investment', 'portfolio',
        'about', 'could', 'think', 'looks', 'strong', 'weak', 'today', 'price', 'setup', 'hold',
        'compare', 'conpare', 'versus', 'diff', 'difference', 'predict', 'prediction', 'future', 'forecast',
        'target', 'targets', 'outlook', 'want', 'wants', 'need', 'needs', 'like', 'likes', 'tell', 'tells',
        'give', 'gives', 'show', 'shows', 'check', 'checks', 'analyze', 'analysis', 'recommend', 'recommendation',
        'suggest', 'suggestion', 'opinion', 'view', 'views', 'info', 'information', 'detail', 'details'
    }
    search_tokens = [tok for tok in tokens if len(tok) >= 3 and tok not in ignored_words]

    known_lower = {s.lower() for s in symbols}
    unmatched_tokens = []
    for tok in search_tokens:
        if tok not in known_lower:
            if not any(tok == a.symbol.lower() or tok in a.name.lower() for a in assets):
                unmatched_tokens.append(tok)

    if unmatched_tokens:
        from .views import fetch_and_create_asset
        for tok in unmatched_tokens[:3]:
            try:
                new_asset = fetch_and_create_asset(tok)
                if new_asset:
                    symbols.append(new_asset.symbol.upper())
            except Exception:
                pass

    if not symbols:
        ranked = sorted(assets, key=lambda asset: _asset_match_score(message, asset), reverse=True)
        if ranked and _asset_match_score(message, ranked[0]) >= 0.55:
            symbols.append(ranked[0].symbol.upper())

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
    system_instruction = (
        'You are MarketMind, an expert stock trading mentor and analyst. Always refer to stocks by their full company name '
        'with ticker in parentheses (e.g. Apple Inc. (AAPL)). Only use the prices given in the context — never invent prices. '
        'If asked to compare stocks, perform a clear side-by-side technical and fundamental comparison with a concluding pick. '
        'If asked for future predictions or price targets, provide multi-scenario technical price projections (Bullish, Base, Bearish) '
        'with catalysts and risk guidance. Frame suggestions as educational guidance only.'
    )

    # Try Gemini first if key is present
    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={GEMINI_API_KEY}"
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
                    "maxOutputTokens": 1024
                }
            }
            response = requests.post(
                url,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=45
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


def analyze_asset(asset):
    from django.core.cache import cache
    
    symbol = asset.symbol
    price = asset.price
    change = asset.change
    
    # Get candles for technical analysis
    try:
        from .services.market_data import get_candles
        candles = get_candles(symbol, days=30)
    except Exception:
        candles = []
        
    closes = [c['c'] for c in candles if isinstance(c, dict) and 'c' in c]
    if len(closes) >= 7:
        ma7 = sum(closes[-7:]) / 7.0
    else:
        ma7 = price * (1.0 - (change / 200.0))
        
    if len(closes) >= 15:
        ma30 = sum(closes) / len(closes)
    else:
        ma30 = price * (1.0 - (change / 100.0))
        
    # Determine Trend (comparison of price to moving averages)
    if price > ma7 and ma7 > ma30:
        trend = "Bullish"
        trend_score = 35
    elif price < ma7 and ma7 < ma30:
        trend = "Bearish"
        trend_score = -35
    else:
        trend = "Neutral"
        trend_score = 0
        
    # Determine Momentum based on daily percent change
    if change > 1.5:
        momentum = "Strong Positive"
        momentum_score = 25
    elif change > 0:
        momentum = "Positive"
        momentum_score = 15
    elif change < -1.5:
        momentum = "Strong Negative"
        momentum_score = -25
    elif change < 0:
        momentum = "Negative"
        momentum_score = -15
    else:
        momentum = "Flat"
        momentum_score = 0
        
    # Determine Volatility based on price spread
    if closes:
        high = max(closes)
        low = min(closes)
        spread = ((high - low) / price * 100.0) if price > 0 else 0
    else:
        spread = abs(change) * 2.0
        
    if spread > 15:
        volatility = "High"
    elif spread > 5:
        volatility = "Medium"
    else:
        volatility = "Low"
        
    # Calculate Score (-100 to 100)
    score = trend_score + momentum_score
    if volatility == "High":
        score = int(score * 0.85)  # Dampen score for highly volatile assets
        
    if score >= 20:
        decision = "BUY"
    elif score <= -20:
        decision = "SELL"
    else:
        decision = "HOLD"
        
    confidence = 50 + int(min(45, abs(score) * 0.75))
    
    # Generate written technical analysis paragraph
    name_label = f"{asset.name} ({symbol})" if asset.name else symbol
    if decision == "BUY":
        reasons = [
            f"{name_label} displays a strong upward trend, trading above its key moving averages.",
            f"Momentum is currently {momentum.lower()} with today's gain of {change:+.2f}%.",
            f"Under {volatility.lower()} volatility, the chart structure supports bullish continuation.",
            f"Accumulation is favored, targeting short-term breakout points with a tight stop below MA support."
        ]
    elif decision == "SELL":
        reasons = [
            f"{name_label} is experiencing heavy sell pressure, closing today at {price:.2f} ({change:+.2f}%).",
            f"The asset has slipped into a {trend.lower()} pattern, trading below both the 7-day and 30-day moving averages.",
            f"With {volatility.lower()} volatility, risk remains elevated.",
            f"We advise reducing exposure or looking to exit until a stable consolidation zone is established."
        ]
    else:
        reasons = [
            f"{name_label} is consolidating in a neutral pattern, currently priced at {price:.2f} ({change:+.2f}%).",
            f"Both the short-term and long-term moving averages are running flat, indicating a range-bound state.",
            f"With {volatility.lower()} volatility, there is no decisive directional bias.",
            f"A hold strategy is appropriate here, waiting for a volume-backed breakout to confirm the next leg."
        ]
        
    analysis = " ".join(reasons)
    
    return {
        "symbol": symbol,
        "name": asset.name,
        "category": asset.category,
        "sector": asset.sector,
        "price": price,
        "change": change,
        "decision": decision,
        "confidence": confidence,
        "trend": trend,
        "momentum": momentum,
        "volatility": volatility,
        "analysis": analysis
    }


def analyze_all_assets():
    from django.core.cache import cache
    cache_key = "local_ai_analyzer_all_v1"
    cached_results = cache.get(cache_key)
    if cached_results:
        return cached_results
        
    assets = list(Asset.objects.live_assets())
    results = []
    for asset in assets:
        try:
            results.append(analyze_asset(asset))
        except Exception:
            continue
            
    # Cache the full analysis for 5 minutes (300 seconds)
    cache.set(cache_key, results, 300)
    return results


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


def find_fuzzy_matches_all(message, quotes=None):
    normalized = (message or '').strip().lower()
    tokens = re.findall(r'[a-z0-9]+', normalized)
    
    ignored_words = {
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'buy', 'can', 'did', 'do', 'does', 'for', 'from',
        'how', 'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'should', 'sell', 'the', 'to',
        'today', 'trading', 'was', 'what', 'when', 'where', 'which', 'with', 'would', 'you', 'your',
        'stock', 'stocks', 'share', 'shares', 'position', 'positions', 'invest', 'investment', 'portfolio',
        'about', 'could', 'think', 'looks', 'strong', 'weak', 'today', 'price', 'setup', 'hold',
        'compare', 'conpare', 'versus', 'diff', 'difference', 'predict', 'prediction', 'future', 'forecast',
        'target', 'targets', 'outlook', 'want', 'wants', 'need', 'needs', 'like', 'likes', 'tell', 'tells',
        'give', 'gives', 'show', 'shows', 'check', 'checks', 'analyze', 'analysis', 'recommend', 'recommendation',
        'suggest', 'suggestion', 'opinion', 'view', 'views', 'info', 'information', 'detail', 'details'
    }
    
    search_tokens = [tok for tok in tokens if len(tok) >= 3 and tok not in ignored_words]

    matched = []
    seen_symbols = set()

    def get_sym(item, is_db):
        return item.symbol.upper() if is_db else (item.get('symbol') or '').upper()

    def add_match(item, is_db):
        sym = get_sym(item, is_db)
        if sym and sym not in seen_symbols:
            seen_symbols.add(sym)
            matched.append((item, is_db))

    # 1. Search database assets
    from .models import Asset
    assets = list(Asset.objects.live_assets())
    for asset in assets:
        symbol = asset.symbol.lower()
        name_tokens = _search_tokens(asset.name)
        
        if re.search(r'(?<!\w)' + re.escape(symbol) + r'(?!\w)', normalized):
            add_match(asset, True)
            continue

        for tok in search_tokens:
            if tok == symbol:
                add_match(asset, True)
                break
            r = SequenceMatcher(None, tok, symbol).ratio()
            if r >= 0.82:
                add_match(asset, True)
                break
        else:
            for tok in search_tokens:
                for n_tok in name_tokens:
                    if tok == n_tok:
                        add_match(asset, True)
                        break
                    r = SequenceMatcher(None, tok, n_tok).ratio()
                    if r >= 0.82:
                        add_match(asset, True)
                        break
                if asset.symbol.upper() in seen_symbols:
                    break

    # 2. Search passed quotes (dict objects)
    if quotes:
        for q in quotes:
            symbol = (q.get('symbol') or '').lower()
            name = (q.get('name') or '').lower()
            name_tokens = _search_tokens(name)
            sym_upper = symbol.upper()
            if sym_upper in seen_symbols:
                continue

            if re.search(r'(?<!\w)' + re.escape(symbol) + r'(?!\w)', normalized):
                add_match(q, False)
                continue

            for tok in search_tokens:
                if tok == symbol:
                    add_match(q, False)
                    break
                r = SequenceMatcher(None, tok, symbol).ratio()
                if r >= 0.82:
                    add_match(q, False)
                    break
            else:
                for tok in search_tokens:
                    for n_tok in name_tokens:
                        if tok == n_tok:
                            add_match(q, False)
                            break
                        r = SequenceMatcher(None, tok, n_tok).ratio()
                        if r >= 0.82:
                            add_match(q, False)
                            break
                    if sym_upper in seen_symbols:
                        break

    return matched


def find_fuzzy_match(message, quotes=None):
    matches = find_fuzzy_matches_all(message, quotes=quotes)
    if matches:
        return matches[0]
    return None, False


def generate_comparison_reply(matches, message, quotes):
    items_to_compare = list(matches)
    
    if len(items_to_compare) < 2 and quotes:
        seen = {item.symbol.upper() if is_db else item.get('symbol', '').upper() for item, is_db in items_to_compare}
        for q in quotes:
            sym = (q.get('symbol') or '').upper()
            if sym and sym not in seen:
                items_to_compare.append((q, False))
                seen.add(sym)
                if len(items_to_compare) >= 2:
                    break

    if not items_to_compare:
        return None

    items_analysis = []
    for item, is_model in items_to_compare[:3]:
        if is_model:
            data = analyze_asset(item)
        else:
            sym_str = item.get('symbol')
            name_str = item.get('name') or sym_str
            price = float(item.get('price') or 0)
            change = float(item.get('change') or 0)
            
            if change > 0.5:
                decision = "BUY"
                trend = "Bullish"
                momentum = "Strong Positive"
                volatility = "Low"
                analysis = f"Displays technical strength, trading higher at ${price:.2f} ({change:+.2f}%). Momentum suggests buyers are active."
            elif change < -0.5:
                decision = "SELL"
                trend = "Bearish"
                momentum = "Negative"
                volatility = "Medium"
                analysis = f"Shows technical weakness, trading down at ${price:.2f} ({change:+.2f}%). Distribution pressure is elevated."
            else:
                decision = "HOLD"
                trend = "Neutral"
                momentum = "Flat"
                volatility = "Low"
                analysis = f"Consolidating around ${price:.2f} ({change:+.2f}%). Structure is currently range-bound."

            data = {
                "symbol": sym_str,
                "name": name_str,
                "price": price,
                "change": change,
                "decision": decision,
                "confidence": 75 if decision == "BUY" else (65 if decision == "SELL" else 55),
                "trend": trend,
                "momentum": momentum,
                "volatility": volatility,
                "analysis": analysis
            }
        items_analysis.append(data)

    lines = ["According to the MarketMind AI Buddy, here is the comparative analysis:\n"]
    for d in items_analysis:
        name_label = f"**{d['name']} ({d['symbol']})**" if d['name'] and d['name'] != d['symbol'] else f"**{d['symbol']}**"
        lines.append(
            f"📊 {name_label}\n"
            f"- **Price**: ${d['price']:.2f} ({d['change']:+.2f}%)\n"
            f"- **Rating**: **{d['decision']}** (Confidence: {d['confidence']}%)\n"
            f"- **Technical Setup**: Trend is **{d['trend']}**, Momentum is **{d['momentum']}**, Volatility is **{d['volatility']}**.\n"
            f"- {d['analysis']}\n"
        )

    buys = [d for d in items_analysis if d['decision'] == 'BUY']
    if buys:
        top = max(buys, key=lambda x: x['confidence'])
        verdict = f"Comparing the options, **{top['name']} ({top['symbol']})** shows the strongest technical momentum and clearest bullish setup."
    else:
        top = max(items_analysis, key=lambda x: x['change'])
        verdict = f"Comparing the options, **{top['name']} ({top['symbol']})** currently leads in relative performance with today's gain of {top['change']:+.2f}%."

    lines.append(f"💡 **Comparative Verdict**: {verdict}\n")
    lines.append("*Please remember that this is for educational purposes and not financial advice.*")

    return "\n".join(lines)


def generate_prediction_reply(matches, message, quotes):
    targets = list(matches)
    if not targets and quotes:
        targets = [(quotes[0], False)]

    if not targets:
        return None

    lines = ["According to the MarketMind AI Buddy, here are the technical price predictions & forecasts:\n"]

    for item, is_model in targets[:2]:
        if is_model:
            d = analyze_asset(item)
        else:
            sym_str = item.get('symbol')
            name_str = item.get('name') or sym_str
            price = float(item.get('price') or 0)
            change = float(item.get('change') or 0)
            decision = "BUY" if change > 0.5 else ("SELL" if change < -0.5 else "HOLD")
            d = {
                "symbol": sym_str,
                "name": name_str,
                "price": price,
                "change": change,
                "decision": decision,
                "confidence": 70,
                "trend": "Bullish" if change > 0 else "Neutral",
                "momentum": "Strong Positive" if change > 1.0 else ("Positive" if change > 0 else "Flat"),
                "volatility": "Low",
                "analysis": f"Currently priced at ${price:.2f} ({change:+.2f}%)."
            }

        price = d['price']
        change = d['change']
        trend = d['trend']
        name_label = f"**{d['name']} ({d['symbol']})**" if d['name'] and d['name'] != d['symbol'] else f"**{d['symbol']}**"

        if trend == "Bullish":
            bullish_pct = 12.5 + min(10.0, abs(change) * 2)
            base_pct = 5.0 + min(5.0, abs(change))
            bearish_pct = -6.0
        elif trend == "Bearish":
            bullish_pct = 4.0
            base_pct = -3.0
            bearish_pct = -14.0
        else:
            bullish_pct = 8.0
            base_pct = 2.5
            bearish_pct = -7.5

        bullish_target = price * (1.0 + bullish_pct / 100.0)
        base_target = price * (1.0 + base_pct / 100.0)
        bearish_target = price * (1.0 + bearish_pct / 100.0)

        lines.append(f"📈 {name_label} Price Projection")
        lines.append(f"- **Current Level**: ${price:.2f} ({change:+.2f}%) | **Rating**: **{d['decision']}** (Confidence: {d['confidence']}%)\n")
        lines.append("🎯 **Projected Price Scenarios (3 to 12 Month Horizon)**:")
        lines.append(f"- 🟢 **Bullish Target**: **${bullish_target:.2f}** ({bullish_pct:+.1f}%) — Driven by breakout above resistance and sustained buying volume.")
        lines.append(f"- 🔵 **Base Case Target**: **${base_target:.2f}** ({base_pct:+.1f}%) — Expected steady continuation under current moving average momentum.")
        lines.append(f"- 🔴 **Bearish Support Level**: **${bearish_target:.2f}** ({bearish_pct:+.1f}%) — Key downside support zone if market sentiment weakens.\n")
        lines.append(f"⚡ **Forecast Outlook**: Technical structure indicates a **{d['trend']}** trend with **{d['momentum']}** momentum under **{d['volatility']}** volatility. Price structure supports testing breakout zones near ${bullish_target:.2f}.\n")

    lines.append("*Please remember that future predictions are technical scenario projections for educational purposes and not financial advice.*")
    return "\n".join(lines)


def generate_reply(message, quotes, holdings, cash, history=None):
    normalized = (message or '').strip().lower()
    
    # Fuzzy match assets from either DB or quotes parameter
    matched_assets = find_fuzzy_matches_all(normalized, quotes=quotes)

    comp_keywords = ['compare', 'conpare', ' vs ', ' vs.', ' versus ', 'difference', 'better', 'prefer', 'comparison', 'against']
    is_comparison = any(kw in normalized for kw in comp_keywords) or (len(matched_assets) >= 2 and not any(kw in normalized for kw in ['buy', 'sell', 'portfolio', 'news']))

    pred_keywords = ['predict', 'prediction', 'future', 'forecast', 'target', 'price target', 'outlook', 'where will', '2025', '2026', '2027', '2030', 'long term', 'next year', 'coming months', 'projection', 'project', 'expected']
    is_prediction = any(kw in normalized for kw in pred_keywords)

    # 1. Comparison tasks
    if is_comparison and (matched_assets or quotes):
        if USE_LLM_MENTOR:
            llm_reply = call_llm(message, quotes, holdings, cash, history=history)
            if llm_reply:
                return llm_reply
        comp_reply = generate_comparison_reply(matched_assets, message, quotes)
        if comp_reply:
            return comp_reply

    # 2. Future prediction tasks
    if is_prediction and (matched_assets or quotes):
        if USE_LLM_MENTOR:
            llm_reply = call_llm(message, quotes, holdings, cash, history=history)
            if llm_reply:
                return llm_reply
        pred_reply = generate_prediction_reply(matched_assets, message, quotes)
        if pred_reply:
            return pred_reply

    # 3. Single Asset Query - Exact Original Functionality
    if matched_assets and not is_comparison and not is_prediction:
        matched_asset, is_model = matched_assets[0]
        if is_model:
            analysis_data = analyze_asset(matched_asset)
            name_str = matched_asset.name
            sym_str = matched_asset.symbol
        else:
            sym_str = matched_asset.get('symbol')
            name_str = matched_asset.get('name') or sym_str
            price = float(matched_asset.get('price') or 0)
            change = float(matched_asset.get('change') or 0)
            
            if change > 0.5:
                decision = "BUY"
                analysis = f"{name_str} ({sym_str}) displays technical strength, trading higher at {price:.2f} ({change:+.2f}%). Momentum suggests buyers are active."
            elif change < -0.5:
                decision = "SELL"
                analysis = f"{name_str} ({sym_str}) is showing technical weakness, trading down at {price:.2f} ({change:+.2f}%). Distribution pressure is elevated."
            else:
                decision = "HOLD"
                analysis = f"{name_str} ({sym_str}) is currently consolidating around {price:.2f} ({change:+.2f}%). Volatility is low."
                
            analysis_data = {
                "decision": decision,
                "confidence": 75,
                "analysis": analysis
            }
            
        decision = analysis_data["decision"]
        confidence = analysis_data["confidence"]
        text_analysis = analysis_data["analysis"]
        return (
            f"According to the MarketMind AI Buddy, **{name_str} ({sym_str})** is currently rated as a **{decision}** (Confidence: {confidence}%).\n\n"
            f"{text_analysis}\n\n"
            f"*Please remember that this is for educational purposes and not financial advice.*"
        )

    # 4. LLM for General Conversational Queries
    if USE_LLM_MENTOR:
        llm_reply = call_llm(message, quotes, holdings, cash, history=history)
        if llm_reply:
            return llm_reply

    if not normalized:
        if not holdings:
            return 'Welcome! Start by opening Markets and placing a small Buy order. Once you trade, head to Profile to complete the starter tasks and track your progress.'
        return 'Ask me about a stock, trade idea, or risk check and I will break it down using the latest prices and market headlines.'

    strongest = max(quotes, key=lambda item: item.get('change', 0)) if quotes else None
    weakest = min(quotes, key=lambda item: item.get('change', 0)) if quotes else None
    portfolio_value = cash + sum(float(item.get('value', 0) or 0) for item in holdings)

    if any(word in normalized for word in ['buy', 'enter', 'invest', 'what should i buy', 'buy today']):
        analyzed = analyze_all_assets()
        if quotes:
            quote_symbols = {q['symbol'].upper() for q in quotes}
            analyzed = [a for a in analyzed if a['symbol'].upper() in quote_symbols]
        buys = [a for a in analyzed if a['decision'] == 'BUY']
        if buys:
            buys = sorted(buys, key=lambda x: x['confidence'], reverse=True)
            suggestions = ", ".join([f"**{b['name']} ({b['symbol']})** (Confidence: {b['confidence']}%)" for b in buys[:2]])
            return (
                f"The AI Buddy has identified strong buy setups for: {suggestions}. "
                f"These show positive technical momentum and bullish moving average trends. Size carefully and wait for confirmation."
            )
        if strongest:
            return (
                f"If you want a buy setup, {_label(strongest)} has the cleanest momentum right now at {strongest['price']:.2f} "
                f"({strongest['change']:+.2f}%). I would size it carefully and wait for confirmation instead of chasing a full position."
            )
        if not holdings:
            return 'Welcome to your first trade. Open Markets, pick a stock, choose Buy, and start small. After that, visit Profile to complete the starter tasks and keep checking your portfolio.'
        return 'I would wait for a stronger trend or a better pullback before entering a new position.'

    if any(word in normalized for word in ['sell', 'exit', 'cut', 'trim']):
        analyzed = analyze_all_assets()
        if quotes:
            quote_symbols = {q['symbol'].upper() for q in quotes}
            analyzed = [a for a in analyzed if a['symbol'].upper() in quote_symbols]
        sells = [a for a in analyzed if a['decision'] == 'SELL']
        if sells:
            sells = sorted(sells, key=lambda x: x['confidence'], reverse=True)
            suggestions = ", ".join([f"**{s['name']} ({s['symbol']})** (Confidence: {s['confidence']}%)" for s in sells[:2]])
            return (
                f"The AI Buddy notes elevated risk and sell-side pressure on: {suggestions}. "
                f"It may be wise to review these positions, trim, or set tight invalidation levels."
            )
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
