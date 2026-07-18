import os
import requests

from django.core.management.base import BaseCommand
from api.models import Asset

FINNHUB_KEY ="d8uhtjpr01qinhui35agd8uhtjpr01qinhui35b0"


def get_us_symbols():
    url = "https://finnhub.io/api/v1/stock/symbol"

    r = requests.get(
        url,
        params={
            "exchange": "US",
            "token": FINNHUB_KEY,
        },
        timeout=30,
    )

    r.raise_for_status()

    return r.json()


class Command(BaseCommand):
    help = "Sync US stock symbols"

    def handle(self, *args, **kwargs):

        symbols = get_us_symbols()

        count = 0

        for stock in symbols:

            symbol = stock.get("symbol")
            description = stock.get("description", "") or ""

            if not symbol:
                continue
            if "TEST" in symbol.upper() and not description.strip():
                continue

            Asset.objects.update_or_create(
                id=symbol.lower(),
                defaults={
                    "symbol": symbol,
                    "name": description or symbol,
                    "exchange": stock.get("mic", "US"),
                    "category": "Stocks",
                    "sector": "",
                    "last_price": 0,
                }
            )
            count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Loaded {count} symbols"
            )
        )