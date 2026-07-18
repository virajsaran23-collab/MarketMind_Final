import os
import time
import threading
import requests
from django.core.cache import cache

FINNHUB_KEY = os.getenv("FINNHUB_API_KEY", "")

SYMBOL_MAP = {
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "INFY": "INFY.NS",
    "TECH": None,
    "BANK": None,
    "HLTH": None,
    "ENRG": None,
    "XAU": "GC=F",
    "WTI": "CL=F",
    "NG": "NG=F",
    "XAG": "SI=F",
}

FALLBACK_PRICES = {
    "AAPL": (195.0, 0.5),
    "TSLA": (175.0, -1.2),
    "MSFT": (420.0, 0.8),
    "GOOGL": (175.0, -0.5),
    "AMZN": (185.0, 1.2),
    "NVDA": (125.0, -2.4),
    "META": (480.0, 1.5),
    "NFLX": (620.0, 0.4),
    "JPM": (195.0, -0.2),
    "V": (275.0, 0.3),
    "DIS": (102.0, -0.8),
    "NKE": (95.0, 1.1),
    "SBUX": (80.0, -0.4),
    "KO": (62.0, 0.2),
    "PEP": (165.0, -0.1),
    "WMT": (68.0, 0.5),
    "AMD": (160.0, -1.8),
    "COST": (820.0, 0.9),
    "LMT": (450.0, 0.3),
    "CAT": (330.0, -0.7),
    "RELIANCE": (1420.0, 0.3),
    "RELIANCE.NS": (1420.0, 0.3),
    "TCS": (3900.0, 0.8),
    "TCS.NS": (3900.0, 0.8),
    "INFY": (1550.0, -0.4),
    "INFY.NS": (1550.0, -0.4),
    "TECH": (1800.0, 1.5),
    "BANK": (980.0, 0.5),
    "HLTH": (1200.0, -0.3),
    "ENRG": (1500.0, 2.0),
    "XAU": (2680.0, 0.4),
    "GC=F": (2680.0, 0.4),
    "WTI": (78.0, 1.2),
    "CL=F": (78.0, 1.2),
    "NG": (3.2, -1.0),
    "NG=F": (3.2, -1.0),
    "XAG": (30.5, 0.7),
    "SI=F": (30.5, 0.7),
}

_lock = threading.Lock()


def _fetch_yahoo(ticker):
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
        headers = {"User-Agent": "Mozilla/5.0"}
        r = requests.get(url, headers=headers, timeout=8, params={"interval": "1d", "range": "5d"})
        if r.status_code != 200:
            return None
        data = r.json()
        meta = data.get("chart", {}).get("result", [{}])[0].get("meta", {})
        price = meta.get("regularMarketPrice") or meta.get("previousClose")
        prev = meta.get("chartPreviousClose") or meta.get("previousClose") or price
        if not price:
            return None
        change_pct = ((price - prev) / prev * 100) if prev else 0.0
        return {"price": round(float(price), 4), "change": round(float(change_pct), 4)}
    except Exception:
        return None


def _fetch_finnhub(symbol):
    if not FINNHUB_KEY:
        return None
    try:
        r = requests.get(
            "https://finnhub.io/api/v1/quote",
            params={"symbol": symbol, "token": FINNHUB_KEY},
            timeout=8,
        )
        d = r.json()
        price = d.get("c")
        change_pct = d.get("dp")
        if price:
            return {"price": round(float(price), 4), "change": round(float(change_pct or 0), 4)}
    except Exception:
        pass
    return None


_fetching_symbols = set()
_fetching_lock = threading.Lock()

def _bg_fetch_quote(symbol):
    try:
        mapped = SYMBOL_MAP.get(symbol, symbol)
        result = None

        if mapped:
            result = _fetch_finnhub(mapped)
            if result is None:
                result = _fetch_yahoo(mapped)

        if result is None and mapped != symbol:
            result = _fetch_finnhub(symbol)
            if result is None:
                result = _fetch_yahoo(symbol)

        if result is not None:
            cache.set(f"quote_v2_{symbol}", result, 60)
            cache.set(f"quote_v2_stale_{symbol}", result, 86400)
    except Exception:
        pass
    finally:
        with _fetching_lock:
            _fetching_symbols.discard(symbol)


def get_quote(symbol):
    cache_key = f"quote_v2_{symbol}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    with _fetching_lock:
        if symbol not in _fetching_symbols:
            _fetching_symbols.add(symbol)
            t = threading.Thread(target=_bg_fetch_quote, args=(symbol,), daemon=True)
            t.start()

    stale_cached = cache.get(f"quote_v2_stale_{symbol}")
    if stale_cached:
        return stale_cached

    fb_price, fb_chg = FALLBACK_PRICES.get(symbol, (100.0, 0.0))
    return {"price": fb_price, "change": fb_chg}


_fetching_candles = set()
_candles_lock = threading.Lock()

def _bg_fetch_candles(symbol, days):
    try:
        mapped = SYMBOL_MAP.get(symbol, symbol)
        ticker = mapped if mapped else symbol

        candles = []
        try:
            range_map = {7: "5d", 30: "1mo", 90: "3mo", 365: "1y"}
            yrange = range_map.get(days, "1mo")
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
            headers = {"User-Agent": "Mozilla/5.0"}
            r = requests.get(url, headers=headers, timeout=10, params={"interval": "1d", "range": yrange})
            if r.status_code == 200:
                data = r.json()
                result = data.get("chart", {}).get("result", [])
                if result:
                    ts_list = result[0].get("timestamp", [])
                    closes = result[0].get("indicators", {}).get("quote", [{}])[0].get("close", [])
                    for ts, cl in zip(ts_list, closes):
                        if cl is not None:
                            candles.append({"t": ts, "c": round(float(cl), 4)})
        except Exception:
            pass

        if not candles:
            quote = get_quote(symbol)
            base = quote["price"]
            import math
            now = int(time.time())
            day_secs = 86400
            for i in range(days, -1, -1):
                noise = (math.sin(i * 1.7) + math.cos(i * 0.9)) * (base * 0.005)
                drift = (base * 0.0003) * (days - i)
                candles.append({"t": now - i * day_secs, "c": round(max(1, base - drift + noise), 4)})

        cache.set(f"candles_v2_{symbol}_{days}", candles, 300)
        cache.set(f"candles_v2_stale_{symbol}_{days}", candles, 86400)
    except Exception:
        pass
    finally:
        with _candles_lock:
            _fetching_candles.discard((symbol, days))


def get_candles(symbol, days=30):
    cache_key = f"candles_v2_{symbol}_{days}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    with _candles_lock:
        if (symbol, days) not in _fetching_candles:
            _fetching_candles.add((symbol, days))
            t = threading.Thread(target=_bg_fetch_candles, args=(symbol, days), daemon=True)
            t.start()

    stale_cached = cache.get(f"candles_v2_stale_{symbol}_{days}")
    if stale_cached:
        return stale_cached

    quote = get_quote(symbol)
    base = quote["price"]
    import math
    now = int(time.time())
    day_secs = 86400
    candles = []
    for i in range(days, -1, -1):
        noise = (math.sin(i * 1.7) + math.cos(i * 0.9)) * (base * 0.005)
        drift = (base * 0.0003) * (days - i)
        candles.append({"t": now - i * day_secs, "c": round(max(1, base - drift + noise), 4)})
    return candles

