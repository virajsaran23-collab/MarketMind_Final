from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
import requests

from .models import Asset, UserProfile, Holding, Trade, CaseStudy, LeaderboardEntry, GameChallenge, UserChallenge, PortfolioSnapshot
from .mentor import _normalize_text, build_portfolio_context, extract_symbols, fetch_news, fetch_quotes, generate_reply, summarize_market
from .serializers import (
    AssetSerializer, UserProfileSerializer, HoldingSerializer,
    TradeSerializer, CaseStudySerializer, LeaderboardEntrySerializer,
    UserChallengeSerializer, RegisterSerializer, UserSerializer,
    PortfolioSnapshotSerializer,
)
from .services.market_data import get_quote


def calculate_portfolio_value(user):
    profile = UserProfile.objects.get_or_create(user=user)[0]
    holdings = Holding.objects.filter(user=user).select_related('asset')
    total_value = sum(h.shares * h.asset.price for h in holdings)
    portfolio_value = total_value + profile.cash
    if profile.portfolio_value != portfolio_value:
        profile.portfolio_value = portfolio_value
        profile.save(update_fields=['portfolio_value'])
    return portfolio_value


def record_portfolio_snapshot(user):
    profile = UserProfile.objects.get_or_create(user=user)[0]
    value = calculate_portfolio_value(user)
    PortfolioSnapshot.objects.create(user=user, value=value, cash=profile.cash)


def update_user_badge(profile):
    score = profile.learning_score
    sims = profile.simulations_completed

    if score >= 1000 or sims >= 10:
        new_badge = 'Market Legend'
    elif score >= 600 or sims >= 5:
        new_badge = 'Event Strategist'
    elif score >= 300 or sims >= 3:
        new_badge = 'Trend Hunter'
    elif score >= 100 or sims >= 1:
        new_badge = 'Value Investor'
    else:
        new_badge = 'Market Rookie'

    if profile.badge != new_badge:
        profile.badge = new_badge
        profile.save(update_fields=['badge'])


def calculate_token_count(portfolio_value, bonus_tokens=0):
    portfolio_tokens = max(0, int((portfolio_value - 100000) // 1000))
    return portfolio_tokens + max(0, bonus_tokens)


CURATED_ASSETS = [
    # Stocks
    {
        'id': 'aapl',
        'symbol': 'AAPL',
        'name': 'Apple Inc.',
        'exchange': 'NASDAQ',
        'category': 'Stocks',
        'sector': 'Technology',
    },
    {
        'id': 'msft',
        'symbol': 'MSFT',
        'name': 'Microsoft Corporation',
        'exchange': 'NASDAQ',
        'category': 'Stocks',
        'sector': 'Technology',
    },
    {
        'id': 'googl',
        'symbol': 'GOOGL',
        'name': 'Alphabet Inc.',
        'exchange': 'NASDAQ',
        'category': 'Stocks',
        'sector': 'Technology',
    },
    {
        'id': 'amzn',
        'symbol': 'AMZN',
        'name': 'Amazon.com Inc.',
        'exchange': 'NASDAQ',
        'category': 'Stocks',
        'sector': 'Consumer Cyclical',
    },
    {
        'id': 'nvda',
        'symbol': 'NVDA',
        'name': 'NVIDIA Corporation',
        'exchange': 'NASDAQ',
        'category': 'Stocks',
        'sector': 'Technology',
    },
    {
        'id': 'tsla',
        'symbol': 'TSLA',
        'name': 'Tesla Inc.',
        'exchange': 'NASDAQ',
        'category': 'Stocks',
        'sector': 'Consumer Cyclical',
    },
    {
        'id': 'meta',
        'symbol': 'META',
        'name': 'Meta Platforms Inc.',
        'exchange': 'NASDAQ',
        'category': 'Stocks',
        'sector': 'Technology',
    },
    {
        'id': 'nflx',
        'symbol': 'NFLX',
        'name': 'Netflix Inc.',
        'exchange': 'NASDAQ',
        'category': 'Stocks',
        'sector': 'Communication Services',
    },
    {
        'id': 'jpm',
        'symbol': 'JPM',
        'name': 'JPMorgan Chase & Co.',
        'exchange': 'NYSE',
        'category': 'Stocks',
        'sector': 'Financial Services',
    },
    {
        'id': 'v',
        'symbol': 'V',
        'name': 'Visa Inc.',
        'exchange': 'NYSE',
        'category': 'Stocks',
        'sector': 'Financial Services',
    },
    {
        'id': 'dis',
        'symbol': 'DIS',
        'name': 'The Walt Disney Company',
        'exchange': 'NYSE',
        'category': 'Stocks',
        'sector': 'Communication Services',
    },
    {
        'id': 'nke',
        'symbol': 'NKE',
        'name': 'Nike Inc.',
        'exchange': 'NYSE',
        'category': 'Stocks',
        'sector': 'Consumer Cyclical',
    },
    {
        'id': 'sbux',
        'symbol': 'SBUX',
        'name': 'Starbucks Corporation',
        'exchange': 'NASDAQ',
        'category': 'Stocks',
        'sector': 'Consumer Cyclical',
    },
    {
        'id': 'ko',
        'symbol': 'KO',
        'name': 'The Coca-Cola Company',
        'exchange': 'NYSE',
        'category': 'Stocks',
        'sector': 'Consumer Defensive',
    },
    {
        'id': 'pep',
        'symbol': 'PEP',
        'name': 'PepsiCo Inc.',
        'exchange': 'NASDAQ',
        'category': 'Stocks',
        'sector': 'Consumer Defensive',
    },
    {
        'id': 'wmt',
        'symbol': 'WMT',
        'name': 'Walmart Inc.',
        'exchange': 'NYSE',
        'category': 'Stocks',
        'sector': 'Consumer Defensive',
    },
    {
        'id': 'amd',
        'symbol': 'AMD',
        'name': 'Advanced Micro Devices Inc.',
        'exchange': 'NASDAQ',
        'category': 'Stocks',
        'sector': 'Technology',
    },
    {
        'id': 'cost',
        'symbol': 'COST',
        'name': 'Costco Wholesale Corporation',
        'exchange': 'NASDAQ',
        'category': 'Stocks',
        'sector': 'Consumer Defensive',
    },
    {
        'id': 'lmt',
        'symbol': 'LMT',
        'name': 'Lockheed Martin Corporation',
        'exchange': 'NYSE',
        'category': 'Stocks',
        'sector': 'Industrials',
    },
    {
        'id': 'cat',
        'symbol': 'CAT',
        'name': 'Caterpillar Inc.',
        'exchange': 'NYSE',
        'category': 'Stocks',
        'sector': 'Industrials',
    },
    # Industries
    {
        'id': 'tech',
        'symbol': 'TECH',
        'name': 'Tech Sector Tracker',
        'exchange': 'US',
        'category': 'Industries',
        'sector': 'Technology',
    },
    {
        'id': 'bank',
        'symbol': 'BANK',
        'name': 'Banking Sector Tracker',
        'exchange': 'US',
        'category': 'Industries',
        'sector': 'Financial Services',
    },
    {
        'id': 'hlth',
        'symbol': 'HLTH',
        'name': 'Healthcare Tracker',
        'exchange': 'US',
        'category': 'Industries',
        'sector': 'Healthcare',
    },
    {
        'id': 'enrg',
        'symbol': 'ENRG',
        'name': 'Energy Sector Tracker',
        'exchange': 'US',
        'category': 'Industries',
        'sector': 'Energy',
    },
    # Commodities
    {
        'id': 'xau',
        'symbol': 'XAU',
        'name': 'Gold Spot',
        'exchange': 'CMDY',
        'category': 'Commodities',
        'sector': 'Metal',
    },
    {
        'id': 'wti',
        'symbol': 'WTI',
        'name': 'Crude Oil WTI',
        'exchange': 'CMDY',
        'category': 'Commodities',
        'sector': 'Energy',
    },
    {
        'id': 'ng',
        'symbol': 'NG',
        'name': 'Natural Gas',
        'exchange': 'CMDY',
        'category': 'Commodities',
        'sector': 'Energy',
    },
    {
        'id': 'xag',
        'symbol': 'XAG',
        'name': 'Silver Spot',
        'exchange': 'CMDY',
        'category': 'Commodities',
        'sector': 'Metal',
    },
]


COMMODITY_SEARCH_MAP = {
    "GOLD": "XAU",
    "XAU": "XAU",
    "OIL": "WTI",
    "WTI": "WTI",
    "GAS": "NG",
    "NG": "NG",
    "SILVER": "XAG",
    "XAG": "XAG",
}

TRENDING_SYMBOLS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA",
    "TSLA", "META", "NFLX", "JPM", "V",
    "DIS", "NKE", "SBUX", "KO", "PEP",
    "WMT", "AMD", "COST", "LMT", "CAT"
]

FOUNDATION_SYMBOLS = TRENDING_SYMBOLS + ["TECH", "BANK", "HLTH", "ENRG", "XAU", "WTI", "NG", "XAG"]


def ensure_foundation_assets():
    for data in CURATED_ASSETS:
        if data['symbol'] in FOUNDATION_SYMBOLS:
            Asset.objects.get_or_create(
                id=data['id'],
                defaults={
                    'symbol': data['symbol'],
                    'name': data['name'],
                    'exchange': data['exchange'],
                    'category': data['category'],
                    'sector': data['sector'],
                }
            )


def fetch_and_create_asset(symbol):
    raw_symbol = (symbol or '').strip()
    if not raw_symbol:
        return None

    query_symbol = raw_symbol.upper()
    if len(query_symbol) > 7 and ' ' not in raw_symbol:
        return None

    alias = COMMODITY_SEARCH_MAP.get(query_symbol)
    if alias:
        query_symbol = alias

    headers = {"User-Agent": "Mozilla/5.0"}
    resolved_symbol = query_symbol
    resolved_name = query_symbol
    category = "Stocks"
    sector = ""
    exchange = "US"

    try:
        search_url = "https://query1.finance.yahoo.com/v1/finance/search"
        search_response = requests.get(search_url, headers=headers, timeout=5, params={"q": raw_symbol, "quotesCount": 5, "newsCount": 0})
        if search_response.status_code == 200:
            search_data = search_response.json()
            quotes = search_data.get("quotes", []) or []
            if quotes:
                first_quote = quotes[0]
                candidate_symbol = (first_quote.get("symbol") or "").strip().upper()
                if candidate_symbol:
                    resolved_symbol = candidate_symbol
                resolved_name = (
                    first_quote.get("longname")
                    or first_quote.get("shortname")
                    or first_quote.get("quoteType")
                    or resolved_name
                )
    except Exception:
        pass

    if resolved_symbol in ["GC=F", "CL=F", "NG=F", "SI=F", "XAU", "WTI", "NG", "XAG"]:
        category = "Commodities"
        exchange = "CMDY"
        sector = "Metal" if resolved_symbol in ["GC=F", "SI=F", "XAU", "XAG"] else "Energy"

    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{resolved_symbol}"
        r = requests.get(url, headers=headers, timeout=5, params={"interval": "1d", "range": "5d"})
        if r.status_code != 200:
            return None

        data = r.json()
        meta = data.get("chart", {}).get("result", [{}])[0].get("meta", {})
        if not meta:
            return None
    except Exception:
        return None

    for item in CURATED_ASSETS:
        if item['symbol'] == resolved_symbol:
            category = item['category']
            sector = item['sector']
            exchange = item['exchange']
            break

    asset, _created = Asset.objects.get_or_create(
        id=resolved_symbol.lower(),
        defaults={
            "symbol": resolved_symbol,
            "name": resolved_name or resolved_symbol,
            "exchange": exchange,
            "category": category,
            "sector": sector,
        }
    )
    return asset



def calculate_accuracy(user):
    trades = Trade.objects.filter(user=user).select_related('asset')
    buy_trades = list(trades.filter(mode='buy'))
    sell_trades = list(trades.filter(mode='sell'))

    total_closed = len(sell_trades)
    if total_closed == 0:
        portfolio_value = calculate_portfolio_value(user)
        profit_percent = ((portfolio_value - 100000.0) / 100000.0) * 100
        return int(round(max(0, min(100, profit_percent))))

    profitable_sells = 0
    for sell in sell_trades:
        prior_buys = [t for t in buy_trades if t.asset_id == sell.asset_id and t.created_at <= sell.created_at]
        if prior_buys:
            avg_buy_price = sum(t.price * t.shares for t in prior_buys) / sum(t.shares for t in prior_buys)
            if sell.price > avg_buy_price:
                profitable_sells += 1

    return int(round(min(100, (profitable_sells / total_closed) * 100)))


def calculate_risk_score(user):
    trades = Trade.objects.filter(user=user).select_related('asset')
    holdings = Holding.objects.filter(user=user).select_related('asset')
    profile = UserProfile.objects.get_or_create(user=user)[0]
    portfolio_value = calculate_portfolio_value(user)

    if not trades.exists():
        return 30

    risk = 30

    if portfolio_value > 0 and holdings.exists():
        max_holding_value = max(h.shares * h.asset.price for h in holdings) if holdings else 0
        concentration_pct = (max_holding_value / portfolio_value) * 100
        if concentration_pct > 70:
            risk += 30
        elif concentration_pct > 50:
            risk += 20
        elif concentration_pct > 30:
            risk += 10
        elif concentration_pct > 15:
            risk += 5

    distinct_assets = holdings.values('asset').distinct().count()
    if distinct_assets == 0:
        risk += 10
    elif distinct_assets == 1:
        risk += 8
    elif distinct_assets <= 3:
        risk += 3

    from datetime import timedelta
    week_ago = timezone.now() - timedelta(days=7)
    recent_trades = trades.filter(created_at__gte=week_ago).count()
    if recent_trades > 20:
        risk += 20
    elif recent_trades > 10:
        risk += 10
    elif recent_trades > 5:
        risk += 5

    if portfolio_value > 0:
        cash_ratio = profile.cash / portfolio_value
        if cash_ratio < 0.05:
            risk += 15
        elif cash_ratio < 0.15:
            risk += 8
        elif cash_ratio < 0.25:
            risk += 3

    return min(100, max(0, risk))


def ensure_default_challenges():
    defaults = [
        {
            'slug': 'first_trade',
            'name': 'First Trade',
            'description': 'Execute your first trade to unlock this achievement.',
            'category': 'achievement',
            'token_reward': 10,
            'target_value': 1,
            'active': True,
            'sort_order': 1,
        },
        {
            'slug': 'five_profitable_trades',
            'name': 'Five Profitable Buys',
            'description': 'Make five profitable buy trades.',
            'category': 'achievement',
            'token_reward': 50,
            'target_value': 5,
            'active': True,
            'sort_order': 2,
        },
        {
            'slug': 'portfolio_105k',
            'name': 'Portfolio Breaks 105K',
            'description': 'Grow your portfolio above $105,000.',
            'category': 'achievement',
            'token_reward': 25,
            'target_value': 105000,
            'active': True,
            'sort_order': 3,
        },
        {
            'slug': 'daily_trade',
            'name': 'Daily Trader',
            'description': 'Complete at least one trade today.',
            'category': 'daily',
            'token_reward': 5,
            'target_value': 1,
            'active': True,
            'sort_order': 1,
        },
        {
            'slug': 'daily_three_trades',
            'name': 'Momentum Builder',
            'description': 'Execute three trades in a single day.',
            'category': 'daily',
            'token_reward': 10,
            'target_value': 3,
            'active': True,
            'sort_order': 2,
        },
    ]
    for attrs in defaults:
        GameChallenge.objects.update_or_create(slug=attrs['slug'], defaults=attrs)


def evaluate_challenge(user, challenge, user_challenge):
    today = timezone.localdate()
    trades = Trade.objects.filter(user=user)
    progress = 0
    complete = False

    if challenge.category == 'daily':
        trades_today = trades.filter(created_at__date=today)
        progress = min(trades_today.count(), challenge.target_value)
        complete = trades_today.count() >= challenge.target_value
    elif challenge.slug == 'first_trade':
        progress = min(trades.count(), challenge.target_value)
        complete = trades.count() >= challenge.target_value
    elif challenge.slug == 'portfolio_105k':
        portfolio_value = calculate_portfolio_value(user)
        progress = min(portfolio_value, challenge.target_value)
        complete = portfolio_value >= challenge.target_value
    elif challenge.slug == 'five_profitable_trades':
        buy_trades = trades.filter(mode='buy').select_related('asset')
        profitable = sum(1 for t in buy_trades if t.asset.price > t.price)
        progress = min(profitable, challenge.target_value)
        complete = profitable >= challenge.target_value
    else:
        progress = 0
        complete = False

    changed = False
    if user_challenge.progress != progress:
        user_challenge.progress = progress
        changed = True

    new_status = 'complete' if complete else 'pending'
    if user_challenge.status != new_status:
        user_challenge.status = new_status
        changed = True

    if challenge.category == 'daily':
        if complete and user_challenge.completed_at is None:
            user_challenge.completed_at = timezone.now()
            profile = UserProfile.objects.get_or_create(user=user)[0]
            profile.bonus_tokens += challenge.token_reward
            profile.save(update_fields=['bonus_tokens'])
            changed = True
        elif not complete and user_challenge.completed_at is not None:
            user_challenge.completed_at = None
            changed = True
    else:
        if complete and user_challenge.completed_at is None:
            user_challenge.completed_at = timezone.now()
            profile = UserProfile.objects.get_or_create(user=user)[0]
            profile.bonus_tokens += challenge.token_reward
            profile.save(update_fields=['bonus_tokens'])
            changed = True

    if changed:
        user_challenge.save(update_fields=['progress', 'status', 'completed_at'])

    return user_challenge


def sync_user_challenges(user):
    ensure_default_challenges()

    today = timezone.localdate()
    active_challenges = GameChallenge.objects.filter(active=True)
    user_challenges = []

    for challenge in active_challenges:
        date = today if challenge.category == 'daily' else None
        user_challenge, created = UserChallenge.objects.get_or_create(
            user=user,
            challenge=challenge,
            date=date,
            defaults={'status': 'pending', 'progress': 0},
        )
        if challenge.category == 'daily' and not created:
            if user_challenge.date and user_challenge.date != today:
                user_challenge, _ = UserChallenge.objects.get_or_create(
                    user=user,
                    challenge=challenge,
                    date=today,
                    defaults={'status': 'pending', 'progress': 0},
                )

        user_challenges.append(evaluate_challenge(user, challenge, user_challenge))

    accuracy = calculate_accuracy(user)
    risk_score = calculate_risk_score(user)
    profile = UserProfile.objects.get_or_create(user=user)[0]
    update_fields = []
    if profile.accuracy != accuracy:
        profile.accuracy = accuracy
        update_fields.append('accuracy')
    if profile.risk_score != risk_score:
        profile.risk_score = risk_score
        update_fields.append('risk_score')
    if update_fields:
        profile.save(update_fields=update_fields)

    return user_challenges


def refresh_leaderboard_entries():
    for user in User.objects.filter(is_active=True):
        get_or_create_leaderboard_entry(user)

    entries = LeaderboardEntry.objects.select_related('user').all()
    updated = []
    for entry in entries:
        if not entry.user.is_active:
            continue
        portfolio_value = calculate_portfolio_value(entry.user)
        profile = UserProfile.objects.get_or_create(user=entry.user)[0]
        new_token_count = calculate_token_count(portfolio_value, profile.bonus_tokens)
        new_accuracy = calculate_accuracy(entry.user)

        dirty = False
        if entry.portfolio != portfolio_value:
            entry.portfolio = portfolio_value
            dirty = True
        if entry.token_count != new_token_count:
            entry.token_count = new_token_count
            dirty = True
        if entry.accuracy != new_accuracy:
            entry.accuracy = new_accuracy
            dirty = True
        if entry.learning_score != profile.learning_score:
            entry.learning_score = profile.learning_score
            dirty = True
        if dirty:
            updated.append(entry)

    if updated:
        LeaderboardEntry.objects.bulk_update(updated, ['portfolio', 'token_count', 'accuracy', 'learning_score'])

    rebuild_leaderboard_ranks()


def get_or_create_leaderboard_entry(user):
    entry, _ = LeaderboardEntry.objects.get_or_create(
        user=user,
        defaults={
            'portfolio': 100000.0,
            'learning_score': 0,
            'badge': 'Market Rookie',
            'accuracy': 0,
            'handle': f'@{user.username}',
            'token_count': 0,
        }
    )
    if not entry.handle:
        entry.handle = f'@{user.username}'
        entry.save(update_fields=['handle'])
    return entry


def rebuild_leaderboard_ranks():
    entries = list(
        LeaderboardEntry.objects.select_related('user')
        .filter(user__is_active=True)
        .order_by('-learning_score', '-token_count', '-portfolio', 'user__username')
    )
    updated = []
    for idx, entry in enumerate(entries, start=1):
        if entry.rank != idx:
            entry.rank = idx
            updated.append(entry)
    if updated:
        LeaderboardEntry.objects.bulk_update(updated, ['rank'])
    for entry in entries:
        profile = UserProfile.objects.get_or_create(user=entry.user)[0]
        if profile.global_rank != entry.rank:
            profile.global_rank = entry.rank
            profile.save(update_fields=['global_rank'])


def update_leaderboard_for_user(user):
    profile = UserProfile.objects.get_or_create(user=user)[0]
    update_user_badge(profile)
    portfolio_value = calculate_portfolio_value(user)
    entry = get_or_create_leaderboard_entry(user)
    entry.portfolio = portfolio_value
    entry.learning_score = profile.learning_score
    entry.badge = profile.badge
    entry.accuracy = profile.accuracy
    entry.token_count = calculate_token_count(portfolio_value, profile.bonus_tokens)
    entry.handle = entry.handle or f'@{user.username}'
    entry.save(update_fields=['portfolio', 'learning_score', 'badge', 'accuracy', 'token_count', 'handle'])
    rebuild_leaderboard_ranks()
    profile.global_rank = entry.rank
    profile.save(update_fields=['global_rank'])
    return entry


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    s = RegisterSerializer(data=request.data)
    if s.is_valid():
        user = s.save()
        profile = UserProfile.objects.create(user=user, cash=100000.0, portfolio_value=100000.0)
        LeaderboardEntry.objects.update_or_create(
            user=user,
            defaults={
                'rank': 0,
                'portfolio': profile.portfolio_value,
                'token_count': 0,
                'learning_score': 0,
                'badge': profile.badge,
                'accuracy': 0,
                'handle': f'@{user.username}',
            }
        )
        PortfolioSnapshot.objects.create(user=user, value=100000.0, cash=100000.0)
        login(request, user)
        rebuild_leaderboard_ranks()
        return Response({'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)
    return Response({'error': s.errors}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        profile = UserProfile.objects.get_or_create(user=user)[0]
        update_user_badge(profile)
        get_or_create_leaderboard_entry(user)
        accuracy = calculate_accuracy(user)
        risk_score = calculate_risk_score(user)
        update_fields = []
        if profile.accuracy != accuracy:
            profile.accuracy = accuracy
            update_fields.append('accuracy')
        if profile.risk_score != risk_score:
            profile.risk_score = risk_score
            update_fields.append('risk_score')
        if update_fields:
            profile.save(update_fields=update_fields)
        return Response({
            'user': UserSerializer(user).data,
            'profile': UserProfileSerializer(profile).data,
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@csrf_exempt
@api_view(['POST'])
def user_logout(request):
    logout(request)
    return Response({'message': 'Logged out'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    profile = UserProfile.objects.get_or_create(user=request.user)[0]
    update_user_badge(profile)
    get_or_create_leaderboard_entry(request.user)
    sync_user_challenges(request.user)
    profile.refresh_from_db()
    return Response({
        'user': UserSerializer(request.user).data,
        'profile': UserProfileSerializer(profile).data,
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def assets_list(request):
    ensure_foundation_assets()
    category = request.query_params.get("category")
    search_query = request.query_params.get("search")

    qs = Asset.objects.live_assets()
    if category and category != "All":
        qs = qs.filter(category=category)

    if search_query:
        search_query = search_query.strip()
        comm_alias = COMMODITY_SEARCH_MAP.get(search_query.upper())
        if comm_alias:
            qs_match = qs.filter(symbol=comm_alias)
        else:
            qs_match = qs.filter(Q(symbol__iexact=search_query) | Q(name__icontains=search_query))
            
        if not qs_match.exists() and len(search_query) <= 7:
            new_asset = fetch_and_create_asset(search_query)
            if new_asset:
                qs_match = Asset.objects.filter(id=new_asset.id)
                if category and category != "All" and new_asset.category != category:
                    qs_match = Asset.objects.none()
        qs = qs_match

    # Sort results to prioritize trending and foundation assets
    assets_list = list(qs[:250])

    def sort_key(asset):
        sym = asset.symbol.upper()
        if sym in TRENDING_SYMBOLS:
            return (0, TRENDING_SYMBOLS.index(sym))
        if sym in ["TECH", "BANK", "HLTH", "ENRG"]:
            return (1, sym)
        if sym in ["XAU", "WTI", "NG", "XAG"]:
            return (2, sym)
        return (3, sym)

    assets_list.sort(key=sort_key)

    results = []
    for asset in assets_list[:60]:
        quote = get_quote(asset.symbol)
        results.append({
            "id": asset.id,
            "symbol": asset.symbol,
            "name": asset.name,
            "exchange": asset.exchange,
            "sector": asset.sector,
            "category": asset.category,
            "price": quote["price"],
            "change": quote["change"],
        })

    return Response(results)


@api_view(["GET"])
@permission_classes([AllowAny])
def asset_detail(request, asset_id):
    try:
        asset = Asset.objects.get(id=asset_id)
    except Asset.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    quote = get_quote(asset.symbol)
    return Response({
        "id": asset.id,
        "symbol": asset.symbol,
        "name": asset.name,
        "exchange": asset.exchange,
        "category": asset.category,
        "sector": asset.sector,
        "price": quote["price"],
        "change": quote["change"],
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def asset_candles(request, asset_id):
    from .services.market_data import get_candles
    try:
        asset = Asset.objects.get(id=asset_id)
    except Asset.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    days = int(request.query_params.get("days", 30))
    candles = get_candles(asset.symbol, days)
    return Response(candles)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio(request):
    profile = UserProfile.objects.get_or_create(user=request.user)[0]
    holdings = Holding.objects.filter(user=request.user).select_related('asset')

    total_value = sum(h.shares * h.asset.price for h in holdings)
    total_cost = sum(h.shares * h.avg_price for h in holdings)
    portfolio_value = total_value + profile.cash
    day_change = sum(h.shares * h.asset.price * (h.asset.change / 100) for h in holdings)
    day_change_pct = (day_change / portfolio_value * 100) if portfolio_value > 0 else 0
    return_pct = ((portfolio_value - 100000) / 100000 * 100)

    return Response({
        'value': portfolio_value,
        'cash': profile.cash,
        'day_change': day_change,
        'day_change_pct': day_change_pct,
        'return_pct': return_pct,
        'holdings': HoldingSerializer(holdings, many=True).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio_history(request):
    from datetime import timedelta, datetime
    range_param = request.query_params.get('range', '1M')

    range_days = {'1D': 1, '1W': 7, '1M': 30, '1Y': 365}.get(range_param, 30)
    cutoff = timezone.now() - timedelta(days=range_days)

    snapshots = PortfolioSnapshot.objects.filter(
        user=request.user,
        recorded_at__gte=cutoff
    ).order_by('recorded_at')

    if not snapshots.exists():
        profile = UserProfile.objects.get_or_create(user=request.user)[0]
        current_value = calculate_portfolio_value(request.user)
        return Response([
            {'label': 'Start', 'value': 100000.0},
            {'label': 'Now', 'value': current_value},
        ])

    def label_for(dt, range_param):
        if range_param == '1D':
            return dt.strftime('%-I:%M %p')
        elif range_param == '1W':
            return dt.strftime('%a')
        elif range_param == '1M':
            return dt.strftime('%b %d')
        else:
            return dt.strftime('%b %Y')

    points = [{'label': label_for(s.recorded_at, range_param), 'value': round(s.value, 2)} for s in snapshots]

    current_value = calculate_portfolio_value(request.user)
    points.append({'label': 'Now', 'value': round(current_value, 2)})

    return Response(points)


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trade(request):
    asset_id = request.data.get('asset_id')
    mode = request.data.get('mode')
    shares = float(request.data.get('shares', 1))

    try:
        asset = Asset.objects.get(id=asset_id)
    except Asset.DoesNotExist:
        return Response({'error': 'Asset not found'}, status=status.HTTP_404_NOT_FOUND)

    live_price = asset.price
    profile = UserProfile.objects.get_or_create(user=request.user)[0]
    total = shares * live_price

    if mode == 'buy':
        if profile.cash < total:
            return Response({'error': 'Insufficient cash'}, status=status.HTTP_400_BAD_REQUEST)
        holding, _ = Holding.objects.get_or_create(user=request.user, asset=asset)
        if holding.shares == 0:
            holding.avg_price = live_price
        else:
            holding.avg_price = ((holding.avg_price * holding.shares) + total) / (holding.shares + shares)
        holding.shares += shares
        holding.save()
        profile.cash -= total
        profile.save()

    elif mode == 'sell':
        try:
            holding = Holding.objects.get(user=request.user, asset=asset)
        except Holding.DoesNotExist:
            return Response({'error': 'You do not own this asset'}, status=status.HTTP_400_BAD_REQUEST)
        if holding.shares < shares:
            return Response({'error': 'Not enough shares'}, status=status.HTTP_400_BAD_REQUEST)
        holding.shares -= shares
        holding.save()
        if holding.shares == 0:
            holding.delete()
        profile.cash += total
        profile.save()

    Trade.objects.create(
        user=request.user,
        asset=asset,
        mode=mode,
        shares=shares,
        price=live_price,
        total=total,
    )

    portfolio_value = calculate_portfolio_value(request.user)
    record_portfolio_snapshot(request.user)
    user_challenges = sync_user_challenges(request.user)
    entry = update_leaderboard_for_user(request.user)
    profile.refresh_from_db()

    completed_challenges = [uc for uc in user_challenges if uc.status == 'complete']

    return Response({
        'message': 'Trade executed',
        'cash': profile.cash,
        'portfolio_value': portfolio_value,
        'token_count': entry.token_count,
        'rank': entry.rank,
        'accuracy': profile.accuracy,
        'risk_score': profile.risk_score,
        'completed_challenges': UserChallengeSerializer(completed_challenges, many=True).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def challenges(request):
    profile = UserProfile.objects.get_or_create(user=request.user)[0]
    ensure_default_challenges()
    user_challenges = sync_user_challenges(request.user)
    serialized = UserChallengeSerializer(user_challenges, many=True)
    return Response({
        'challenges': serialized.data,
        'bonus_tokens': profile.bonus_tokens,
        'accuracy': profile.accuracy,
        'risk_score': profile.risk_score,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trade_history(request):
    trades = Trade.objects.filter(user=request.user).order_by('-created_at')[:50]
    return Response(TradeSerializer(trades, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def case_studies(request):
    qs = CaseStudy.objects.all()
    return Response(CaseStudySerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def case_study_detail(request, study_id):
    try:
        cs = CaseStudy.objects.get(id=study_id)
        return Response(CaseStudySerializer(cs).data)
    except CaseStudy.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def leaderboard(request):
    refresh_leaderboard_entries()
    entries = LeaderboardEntry.objects.select_related('user').filter(
        user__is_active=True
    ).order_by('rank')
    return Response(LeaderboardEntrySerializer(entries, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics(request):
    profile = UserProfile.objects.get_or_create(user=request.user)[0]
    trades_qs = Trade.objects.filter(user=request.user)

    best = {'label': 'No trades yet', 'value': '0%'}
    worst = {'label': 'No trades yet', 'value': '0%'}

    buy_trades = trades_qs.filter(mode='buy').select_related('asset')
    if buy_trades.exists():
        gains = []
        for t in buy_trades:
            gain_pct = ((t.asset.price - t.price) / t.price) * 100
            gains.append((gain_pct, t.asset.name))
        gains.sort(key=lambda x: x[0])
        worst = {'label': f'Bought {gains[0][1]}', 'value': f'{gains[0][0]:+.1f}%'}
        best = {'label': f'Bought {gains[-1][1]}', 'value': f'{gains[-1][0]:+.1f}%'}

    risk_score = calculate_risk_score(request.user)
    if profile.risk_score != risk_score:
        profile.risk_score = risk_score
        profile.save(update_fields=['risk_score'])

    return Response({
        'simulations_completed': profile.simulations_completed,
        'learning_score': profile.learning_score,
        'risk_score': risk_score,
        'best_decision': best,
        'worst_decision': worst,
    })


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_simulation(request):
    profile = UserProfile.objects.get_or_create(user=request.user)[0]
    profile.simulations_completed += 1
    profile.learning_score += request.data.get('score', 100)
    update_user_badge(profile)
    profile.save()
    update_leaderboard_for_user(request.user)
    user_challenges = sync_user_challenges(request.user)
    return Response({
        'message': 'Simulation recorded',
        'learning_score': profile.learning_score,
        'challenges': UserChallengeSerializer(user_challenges, many=True).data,
        'profile': UserProfileSerializer(profile).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mentor(request):
    ensure_foundation_assets()
    message = request.data.get('message', '')
    requested_symbols = request.data.get('symbols') or []
    history = request.data.get('history') or []

    history_text = ' '.join(
        _normalize_text(item.get('content', ''))
        for item in history
        if isinstance(item, dict)
    )
    combined_message = ' '.join(part for part in [message, history_text] if part).strip()

    profile, holdings, portfolio_symbols = build_portfolio_context(request.user)
    symbols = extract_symbols(combined_message or message, requested_symbols or portfolio_symbols)
    quotes = fetch_quotes(symbols)
    news = fetch_news(symbols[:3])

    if not quotes:
        quotes = [
            {
                'symbol': item.symbol,
                'name': item.name,
                'price': item.price,
                'change': item.change,
                'source': 'local',
            }
            for item in Asset.objects.filter(symbol__in=symbols)
        ]

    response = {
        'message': message,
        'history': history[-6:] if isinstance(history, list) else [],
        'symbols': symbols,
        'reply': generate_reply(message, quotes, holdings, profile.cash, history=history[-6:] if isinstance(history, list) else []),
        'summary': summarize_market(quotes, holdings, profile.cash),
        'portfolio': {
            'cash': profile.cash,
            'portfolio_value': profile.portfolio_value,
            'badge': profile.badge,
        },
        'quotes': quotes[:6],
        'news': news,
    }
    return Response(response)
