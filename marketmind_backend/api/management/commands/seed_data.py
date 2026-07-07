from django.core.management.base import BaseCommand
from api.models import Asset, CaseStudy




CASE_STUDIES = [
    {
        'id': 'russia-ukraine',
        'title': 'Russia–Ukraine Conflict',
        'description': 'Impact on oil prices, defense stocks, and global markets.',
        'long_description': 'In February 2022, geopolitical tension escalated into open conflict, sending shockwaves through global commodity and equity markets. Crude oil surged past $120, natural gas spiked across Europe, and defense contractors rallied while consumer sectors retreated on inflation fears.',
        'difficulty': 'Intermediate',
        'read_time': '8 min',
        'image': '/case-russia-ukraine.png',
        'tags': ['Commodities', 'Defense', 'Geopolitics'],
    },
    {
        'id': 'covid-crash',
        'title': 'COVID-19 Market Crash',
        'description': 'Effect on airline, healthcare, and tech sectors.',
        'long_description': 'March 2020 saw the fastest bear market in history as a global pandemic shut down economies. Airlines and travel collapsed, healthcare and pharma surged, and technology emerged stronger as the world moved online. Understanding sector rotation here is essential.',
        'difficulty': 'Beginner',
        'read_time': '6 min',
        'image': '/case-covid.png',
        'tags': ['Pandemic', 'Sector Rotation', 'Volatility'],
    },
    {
        'id': 'ai-boom',
        'title': 'AI Boom (2023–2025)',
        'description': 'Growth of AI companies and semiconductor stocks.',
        'long_description': 'The generative AI revolution triggered an unprecedented rally in semiconductors and cloud infrastructure. Chipmakers multiplied in value while a new wave of AI-native companies reshaped the technology landscape and investor expectations.',
        'difficulty': 'Advanced',
        'read_time': '10 min',
        'image': '/case-ai-boom.png',
        'tags': ['Technology', 'Semiconductors', 'Growth'],
    },
    {
        'id': 'rate-hikes',
        'title': 'Interest Rate Hikes',
        'description': 'Impact on banking, real estate, and growth stocks.',
        'long_description': 'As central banks aggressively raised rates to fight inflation, the cost of capital reshaped market leadership. Banks benefited from wider margins, real estate cooled, and high-multiple growth stocks were repriced sharply lower.',
        'difficulty': 'Intermediate',
        'read_time': '7 min',
        'image': '/case-rate-hikes.png',
        'tags': ['Monetary Policy', 'Banking', 'Real Estate'],
    },
    {
        'id': 'tulip-mania',
        'title': 'Tulip Mania (1636–1637)',
        'description': 'The first recorded speculative bubble, in 17th-century Holland.',
        'long_description': 'During the Dutch Golden Age, tulip bulb prices rose to absurd levels as speculation replaced rational pricing — a single rare bulb could cost more than a house. When confidence broke in February 1637, prices collapsed almost overnight. It remains the textbook example of how mania, herd behavior, and speculation can detach an asset\'s price from any real value.',
        'difficulty': 'Beginner',
        'read_time': '5 min',
        'image': '/case-tulip-mania.svg',
        'tags': ['Bubbles', 'Speculation', 'History'],
    },
    {
        'id': 'history-of-currencies',
        'title': 'History of Currencies',
        'description': 'From barter and gold coins to fiat money and digital currency.',
        'long_description': 'Money has evolved from bartered goods to gold and silver coins, to paper notes backed by precious metals, to today\'s fiat currencies backed only by government trust. Understanding this evolution — including the end of the gold standard in 1971 — explains why currencies fluctuate, why inflation happens, and how central banks influence the value of the money in your pocket.',
        'difficulty': 'Beginner',
        'read_time': '7 min',
        'image': '/case-currency-history.svg',
        'tags': ['Currencies', 'Monetary History', 'Central Banks'],
    },
    {
        'id': 'great-depression',
        'title': 'The Great Depression (1929)',
        'description': 'The stock market crash that reshaped modern financial regulation.',
        'long_description': 'The Wall Street Crash of 1929 wiped out fortunes and triggered a decade-long global depression. Excessive speculation, margin trading, and a lack of regulation combined to create the most severe economic downturn of the 20th century. Its aftermath produced the regulatory foundations — like the SEC and deposit insurance — that still shape markets today.',
        'difficulty': 'Intermediate',
        'read_time': '9 min',
        'image': '/case-great-depression.svg',
        'tags': ['Market Crash', 'Regulation', 'History'],
    },
    {
        'id': 'dotcom-bubble',
        'title': 'Dot-Com Bubble (1995–2001)',
        'description': 'How hype around the internet inflated and then burst tech valuations.',
        'long_description': 'In the late 1990s, investors poured money into internet companies with little regard for profitability, driving the NASDAQ up nearly 400%. When the bubble burst in 2000–2001, trillions in market value evaporated and countless companies vanished. Survivors like Amazon show how genuine innovation can outlast a speculative bubble built around it.',
        'difficulty': 'Intermediate',
        'read_time': '8 min',
        'image': '/case-dotcom-bubble.svg',
        'tags': ['Technology', 'Bubbles', 'Valuation'],
    },
    {
        'id': 'trade-and-colonialism',
        'title': 'Trade, Colonialism & the Birth of Markets',
        'description': 'How the spice trade and colonial companies created modern finance.',
        'long_description': 'The Dutch and British East India Companies, formed to control lucrative spice and textile trade routes, pioneered concepts like shares, dividends, and stock exchanges to fund risky colonial voyages. This era of global trade and colonial expansion laid the institutional groundwork for the stock markets and multinational corporations we know today — a legacy with both financial innovation and significant human cost.',
        'difficulty': 'Advanced',
        'read_time': '10 min',
        'image': '/case-trade-colonialism.svg',
        'tags': ['Trade', 'Colonialism', 'Market History'],
    },
    {
        'id': 'precious-metals-history',
        'title': 'Precious Metals Through History',
        'description': 'Why gold and silver have anchored economies for millennia.',
        'long_description': 'From ancient coinage to the modern gold standard to today\'s central bank reserves, gold and silver have functioned as stores of value across nearly every civilization. Examining why metals hold this role — scarcity, durability, and universal trust — helps explain their continued use as a hedge against inflation and currency instability, alongside newer commodities like industrial metals.',
        'difficulty': 'Beginner',
        'read_time': '6 min',
        'image': '/case-precious-metals.svg',
        'tags': ['Commodities', 'Metals', 'Store of Value'],
    },
]


class Command(BaseCommand):
    help = 'Seed assets and case studies only — no fake users'

    def handle(self, *args, **options):
        self.stdout.write('Seeding foundation assets...')
        from api.views import CURATED_ASSETS, FOUNDATION_SYMBOLS
        count = 0
        for data in CURATED_ASSETS:
            if data['symbol'] in FOUNDATION_SYMBOLS:
                _, created = Asset.objects.update_or_create(
                    id=data['id'],
                    defaults={
                        'symbol': data['symbol'],
                        'name': data['name'],
                        'exchange': data['exchange'],
                        'category': data['category'],
                        'sector': data['sector'],
                    }
                )
                if created:
                    count += 1
        self.stdout.write(f'  Foundation assets: {count} new, {len(FOUNDATION_SYMBOLS)} total')

        self.stdout.write('Seeding case studies...')
        for cs in CASE_STUDIES:
            CaseStudy.objects.update_or_create(id=cs['id'], defaults={k: v for k, v in cs.items() if k != 'id'})

        self.stdout.write(self.style.SUCCESS('Seed complete!'))
