from django.core.management.base import BaseCommand
from api.models import Asset, CaseStudy




CASE_STUDIES = [
    {
        'id': 'russia-ukraine',
        'title': 'Russia–Ukraine Conflict',
        'description': 'Impact on oil prices, defense stocks, and global markets.',
        'long_description': 'In February 2022, geopolitical tensions in Eastern Europe escalated into open conflict, sending shockwaves through global commodity and financial markets. As one of the world\'s largest energy producers, Russia\'s actions triggered fears of supply shortages, leading to severe sanctions from Western nations. This resulted in crude oil surging past $120 per barrel, natural gas prices spiking to record highs across Europe, and grain prices climbing rapidly. While consumer sectors and equity markets retreated on inflation and rate hike concerns, defense contractors and commodity exporters experienced a strong rally, demonstrating the profound impact of geopolitics on asset allocation.',
        'difficulty': 'Intermediate',
        'read_time': '8 min',
        'image': '/case-russia-ukraine.png',
        'tags': ['Commodities', 'Defense', 'Geopolitics'],
        'timeline': [
            {'date': 'Late 2021', 'event': 'Troop Movements', 'description': 'Russia begins assembling military forces near the Ukrainian border, sparking early diplomatic concern.'},
            {'date': 'Feb 24, 2022', 'event': 'Conflict Commences', 'description': 'Russian forces launch a full-scale invasion. Oil and commodities spike instantly.'},
            {'date': 'Mar 2022', 'event': 'Sanctions & Peak Oil', 'description': 'Western nations cut off major Russian banks from SWIFT and ban energy imports. Brent crude surges to $127.98.'},
            {'date': 'Jun 2022', 'event': 'Gas Reductions', 'description': 'Nord Stream 1 gas flows to Europe are restricted, leading to high natural gas prices and global inflation.'},
            {'date': 'Dec 2022', 'event': 'G7 Price Cap', 'description': 'G7 nations impose a $60 per barrel price cap on Russian seaborne oil to limit military funding.'}
        ],
        'stats': [
            {'label': 'Brent Crude Peak', 'value': '$127.98'},
            {'label': 'Defense Sector Index', 'value': '+28% (2022)'},
            {'label': 'Wheat Futures Rise', 'value': '+50% (H1 2022)'},
            {'label': 'S&P 500 Drop', 'value': '-19.4% (2022)'}
        ],
        'lessons': [
            'Geopolitical escalation acts as a powerful catalyst for commodity prices, especially energy and agricultural products.',
            'Defense stocks often act as a hedge during geopolitical crises as governments increase long-term defense expenditures.',
            'Supply chain dependencies (e.g. Europe on Russian gas) can trigger severe stagflationary pressures across global economies.'
        ],
        'chart_data': [
            {'date': 'Jan 22', 'value': 78},
            {'date': 'Feb 22', 'value': 94},
            {'date': 'Mar 22', 'value': 127},
            {'date': 'Apr 22', 'value': 105},
            {'date': 'May 22', 'value': 113},
            {'date': 'Jun 22', 'value': 122},
            {'date': 'Jul 22', 'value': 110},
            {'date': 'Aug 22', 'value': 96},
            {'date': 'Sep 22', 'value': 89},
            {'date': 'Oct 22', 'value': 93},
            {'date': 'Nov 22', 'value': 85},
            {'date': 'Dec 22', 'value': 80}
        ],
        'quiz': [
            {
                'question': 'Which of the following commodities spiked to near-record highs of ~$128/bbl in March 2022?',
                'options': ['Gold', 'Crude Oil', 'Copper', 'Soybeans'],
                'answer': 'Crude Oil',
                'explanation': 'Fears of supply disruptions and sanctions against Russia led Brent crude oil to surge to near-record highs near $128/bbl in early March 2022.'
            },
            {
                'question': 'How do defense stocks generally behave during periods of escalating international conflict?',
                'options': ['They collapse due to high debt', 'They act as a hedge and often rally on expectations of higher government spending', 'They correlate exactly with consumer staples', 'They remain completely unchanged'],
                'answer': 'They act as a hedge and often rally on expectations of higher government spending',
                'explanation': 'Defense contractors like Lockheed Martin and Raytheon often rally during conflicts as investors anticipate increased national defense budgets.'
            }
        ]
    },
    {
        'id': 'covid-crash',
        'title': 'COVID-19 Market Crash',
        'description': 'Effect on airline, healthcare, and tech sectors.',
        'long_description': 'March 2020 saw the fastest bear market in history as the rapid global spread of COVID-19 shut down international travel and domestic economies. In less than a month, the S&P 500 plummeted by over 33% as investors panicked. However, this crisis triggered a massive divergence in sector performance: airlines and tourism collapsed to near-bankruptcy, whereas remote-work software, cloud computing, and pharmaceutical developers surged to new highs. Coupled with unprecedented monetary easing (cutting rates to zero) and trillions in fiscal stimulus, markets recovered with shocking speed, showing that crises create major winners alongside losers.',
        'difficulty': 'Beginner',
        'read_time': '6 min',
        'image': '/case-covid.png',
        'tags': ['Pandemic', 'Sector Rotation', 'Volatility'],
        'timeline': [
            {'date': 'Jan 2020', 'event': 'Initial Outbreaks', 'description': 'The virus is first identified, causing mild local market concern.'},
            {'date': 'Feb-Mar 2020', 'event': 'Global Lockdowns', 'description': 'Countless countries close borders and order businesses to shut down. Markets enter the fastest bear market ever.'},
            {'date': 'Mar 15, 2020', 'event': 'Fed Zero Rates', 'description': 'The Federal Reserve slashes rates to 0-0.25% and launches trillions in QE.'},
            {'date': 'Late 2020', 'event': 'Vaccine Breakthrough', 'description': 'Pfizer/BioNTech announce effective clinical trial results, sparking a massive value/reopening rally.'},
            {'date': '2021', 'event': 'Tech Bubble Peak', 'description': 'Growth and work-from-home tech stocks peak at extreme valuations supported by low interest rates.'}
        ],
        'stats': [
            {'label': 'S&P 500 Drawdown', 'value': '-33.9%'},
            {'label': 'US Fed Rate Cut', 'value': '1.5% to 0.0%'},
            {'label': 'Zoom Stock Gain', 'value': '+400% (2020)'},
            {'label': 'Nasdaq recovery', 'value': '+45% (by Dec 20)'}
        ],
        'lessons': [
            'Systemic panic causes short-term correlations to converge to 1, but sector dispersion widens dramatically soon after.',
            'Massive liquidity injection by central banks serves as a strong buffer and fuel for equity asset prices.',
            'Crisis events accelerate existing structural trends (e.g. digital transformation and e-commerce adoption).'
        ],
        'chart_data': [
            {'date': 'Jan 20', 'value': 3280},
            {'date': 'Feb 20', 'value': 2954},
            {'date': 'Mar 20', 'value': 2237},
            {'date': 'Apr 20', 'value': 2912},
            {'date': 'May 20', 'value': 3044},
            {'date': 'Jun 20', 'value': 3100},
            {'date': 'Jul 20', 'value': 3271},
            {'date': 'Aug 20', 'value': 3500},
            {'date': 'Sep 20', 'value': 3363},
            {'date': 'Oct 20', 'value': 3269},
            {'date': 'Nov 20', 'value': 3621},
            {'date': 'Dec 20', 'value': 3756}
        ],
        'quiz': [
            {
                'question': 'How did the US Federal Reserve respond to the market panic in March 2020?',
                'options': ['They increased interest rates to protect bank deposits', 'They cut interest rates to near zero and launched open-ended quantitative easing', 'They shut down stock trading for three weeks', 'They banned the sale of tech stocks'],
                'answer': 'They cut interest rates to near zero and launched open-ended quantitative easing',
                'explanation': 'To restore liquidity and support the economy, the Fed slashed interest rates to zero and purchased trillions in assets.'
            },
            {
                'question': 'Which sector saw dramatic growth in valuation during the 2020 lockdowns?',
                'options': ['Commercial Real Estate', 'Airlines & Cruise Lines', 'Cloud Services & Remote Work Tech', 'Refined Petroleum Exporters'],
                'answer': 'Cloud Services & Remote Work Tech',
                'explanation': 'With millions working and learning from home, SaaS, streaming, and remote communication tools saw explosive revenue and share gains.'
            }
        ]
    },
    {
        'id': 'ai-boom',
        'title': 'AI Boom (2023–2025)',
        'description': 'Growth of AI companies and semiconductor stocks.',
        'long_description': 'The public release of ChatGPT in late 2022 marked the beginning of a transformative era in technology, triggerring a massive investment boom in Artificial Intelligence. Companies rushed to build next-generation language models, requiring unprecedented amounts of specialized computer hardware. This created a massive "picks and shovels" rally in semiconductor manufacturers (most notably NVIDIA), cloud providers, and energy infrastructure developers. By 2024, NVIDIA\'s market capitalization had crossed $3 Trillion, briefly making it the most valuable company in the world. As investors grapple with lofty valuations, the case illustrates how technological revolutions alter market leadership and trigger capital reallocation.',
        'difficulty': 'Advanced',
        'read_time': '10 min',
        'image': '/case-ai-boom.png',
        'tags': ['Technology', 'Semiconductors', 'Growth'],
        'timeline': [
            {'date': 'Nov 2022', 'event': 'ChatGPT Launch', 'description': 'OpenAI releases ChatGPT to the public, demonstrating human-like conversational capabilities.'},
            {'date': 'May 2023', 'event': 'NVIDIA Guidance Blowout', 'description': 'NVIDIA forecasts a massive 50% revenue beat driven by generative AI chip demand, validating the boom.'},
            {'date': '2024', 'event': 'Hyperscaler Capex War', 'description': 'Microsoft, Meta, Google, and Amazon commit hundreds of billions in annual capital expenditure for AI data centers.'},
            {'date': 'Late 2024', 'event': 'Energy Infrastructure Rally', 'description': 'Power grid, nuclear, and copper stocks rally as the market realizes AI data centers consume massive electricity.'},
            {'date': '2025', 'event': 'Agentic Era & Software Focus', 'description': 'The boom shifts from raw hardware chips to practical AI software agents and workplace automation.'}
        ],
        'stats': [
            {'label': 'NVIDIA Stock Return', 'value': '+1,000% (2022-2024)'},
            {'label': 'Big Tech Annual Capex', 'value': '$180B+ (2024)'},
            {'label': 'Nasdaq-100 Rise', 'value': '+54% (2023)'},
            {'label': 'NVIDIA Market Cap Peak', 'value': '$3.3 Trillion'}
        ],
        'lessons': [
            'In a new technology boom, "picks and shovels" providers (hardware/infrastructure) capture value first before software applications emerge.',
            'Capital expenditure booms create massive secondary winners (e.g., energy utilities supplying AI data centers).',
            'Exponential valuation growth can occur when a new technology is perceived as a paradigm shift, expanding multiples to historical extremes.'
        ],
        'chart_data': [
            {'date': 'Dec 22', 'value': 146},
            {'date': 'Mar 23', 'value': 270},
            {'date': 'Jun 23', 'value': 420},
            {'date': 'Sep 23', 'value': 430},
            {'date': 'Dec 23', 'value': 495},
            {'date': 'Mar 24', 'value': 900},
            {'date': 'Jun 24', 'value': 1200},
            {'date': 'Sep 24', 'value': 1210},
            {'date': 'Dec 24', 'value': 1350},
            {'date': 'Mar 25', 'value': 1450}
        ],
        'quiz': [
            {
                'question': 'Which company became the key beneficiary and symbolic leader of the AI chip-building rush?',
                'options': ['Intel', 'NVIDIA', 'AMD', 'Qualcomm'],
                'answer': 'NVIDIA',
                'explanation': 'NVIDIA\'s early bets on CUDA and high-performance GPUs gave it a near-monopoly on chips required to train and run generative AI models.'
            },
            {
                'question': 'Why did energy and power-grid companies rally in the secondary phase of the AI boom (late 2024)?',
                'options': ['AI chips require less power than old chips', 'AI data centers consume massive amounts of electricity, stressing the power grid', 'Tech companies bought oil fields to hedge inflation', 'Governments banned nuclear power'],
                'answer': 'AI data centers consume massive amounts of electricity, stressing the power grid',
                'explanation': 'AI chips consume far more power than traditional servers, driving massive new demand for stable baseload electricity (nuclear, gas) and grid upgrades.'
            }
        ]
    },
    {
        'id': 'rate-hikes',
        'title': 'Interest Rate Hikes',
        'description': 'Impact on banking, real estate, and growth stocks.',
        'long_description': 'Following the massive stimulus and supply disruptions of the COVID era, inflation in major economies reached a 40-year high of over 9% in 2022. To combat this, the Federal Reserve and other central banks aggressively raised their benchmark interest rates from near-zero to over 5.25%. This rapid increase in the cost of capital reshaped the market: high-multiple growth stocks (which discount future cash flows at a higher rate) collapsed, real estate sales cooled due to high mortgage rates, and banking margins widened. However, the speed of these hikes also caused severe balance sheet stress, resulting in the failure of several regional banks (like Silicon Valley Bank) in early 2023.',
        'difficulty': 'Intermediate',
        'read_time': '7 min',
        'image': '/case-rate-hikes.png',
        'tags': ['Monetary Policy', 'Banking', 'Real Estate'],
        'timeline': [
            {'date': 'Mid 2021', 'event': 'Fed "Transitory" Claim', 'description': 'The Fed maintains that inflation is temporary and keeps rates at 0%.'},
            {'date': 'Mar 2022', 'event': 'First Rate Hike', 'description': 'Fed begins the tightening cycle with a modest 25 basis point hike.'},
            {'date': 'Jun-Nov 2022', 'event': 'Consecutive 75bps Hikes', 'description': 'Fed acts aggressively with four consecutive jumbo 75bps rate hikes to curb runaway CPI.'},
            {'date': 'Mar 2023', 'event': 'Regional Banking Crisis', 'description': 'Silicon Valley Bank collapses due to bond portfolio losses caused by rising rates, causing bank runs.'},
            {'date': 'Jul 2023', 'event': 'Fed Funds Peak', 'description': 'Fed funds target rate reaches 5.25% - 5.50%, the highest level since 2001.'}
        ],
        'stats': [
            {'label': 'Peak US CPI Inflation', 'value': '9.1% (June 2022)'},
            {'label': 'Fed Funds Rate Peak', 'value': '5.50%'},
            {'label': 'US 30Y Mortgage Peak', 'value': '7.79% (Oct 2023)'},
            {'label': 'Nasdaq-100 Drawdown', 'value': '-33% (2022)'}
        ],
        'lessons': [
            'Interest rates are the "gravitational pull" on stock valuations. High rates contract multiples, especially for growth companies.',
            'Rapid rate increases expose weak balance sheets, duration mismatches, and leverage across financial institutions.',
            'Real estate is highly sensitive to monetary policy; rising mortgage rates suppress demand and lower volumes.'
        ],
        'chart_data': [
            {'date': 'Jan 22', 'value': 0.08},
            {'date': 'Mar 22', 'value': 0.33},
            {'date': 'Jun 22', 'value': 1.58},
            {'date': 'Sep 22', 'value': 3.08},
            {'date': 'Dec 22', 'value': 4.33},
            {'date': 'Mar 23', 'value': 4.83},
            {'date': 'Jun 23', 'value': 5.08},
            {'date': 'Sep 23', 'value': 5.33},
            {'date': 'Dec 23', 'value': 5.33},
            {'date': 'Mar 24', 'value': 5.33},
            {'date': 'Jun 24', 'value': 5.33}
        ],
        'quiz': [
            {
                'question': 'Why are high-growth technology companies particularly sensitive to rising interest rates?',
                'options': ['They cannot pay higher wages to workers', 'Their valuations are based on future cash flows, which are discounted at a higher rate', 'They are prohibited from borrowing money', 'High rates degrade the quality of software'],
                'answer': 'Their valuations are based on future cash flows, which are discounted at a higher rate',
                'explanation': 'Growth stocks have cash flows far in the future. In financial models, a higher discount rate (interest rate) significantly lowers the present value of those future earnings.'
            },
            {
                'question': 'Which banking crisis in early 2023 was a direct result of rapid interest rate hikes?',
                'options': ['Lehman Brothers Collapse', 'Silicon Valley Bank (SVB) Failure', 'Long-Term Capital Management Bailout', 'Great Depression Bank Runs'],
                'answer': 'Silicon Valley Bank (SVB) Failure',
                'explanation': 'SVB held long-term treasuries purchased at low yields. As rates rose, the value of these bonds fell. When clients pulled deposits, SVB was forced to realize massive losses, causing a bank run.'
            }
        ]
    },
    {
        'id': 'tulip-mania',
        'title': 'Tulip Mania (1636–1637)',
        'description': 'The first recorded speculative bubble, in 17th-century Holland.',
        'long_description': 'During the Dutch Golden Age, the Netherlands became a major hub of wealth and global trade. In the 1630s, rare tulips with striking petal patterns (caused by a mosaic virus) became highly sought-after status symbols. As demand grew, prices began to rise exponentially, and by 1636, a formal futures market was created, enabling speculators to trade contracts for next year\'s bulbs without taking physical delivery. At the peak in early 1637, a single bulb sold for more than ten times the annual income of a skilled artisan. When buyers in Haarlem failed to show up at an auction in February 1637, panic spread instantly, causing prices to collapse by over 99% within weeks, leaving many holding worthless contracts.',
        'difficulty': 'Beginner',
        'read_time': '5 min',
        'image': '/case-tulip-mania.png',
        'tags': ['Bubbles', 'Speculation', 'History'],
        'timeline': [
            {'date': '1634', 'event': 'Status Symbol Rise', 'description': 'Wealthy Dutch merchants start collecting rare, virus-infected tulip bulbs, driving up local prices.'},
            {'date': '1636', 'event': 'Futures Market Created', 'description': 'The "wind trade" (windhandel) begins, allowing buyers to speculate on bulbs still in the ground using paper contracts.'},
            {'date': 'Jan 1637', 'event': 'Speculation Frenzy', 'description': 'Prices climb to absurd heights. A single rare Semper Augustus bulb is valued at the price of a canal house.'},
            {'date': 'Feb 3, 1637', 'event': 'The Bubble Bursts', 'description': 'An auction in Haarlem fails to find buyers at listed prices. Panic sets in, and the market collapses.'},
            {'date': 'Late 1637', 'event': 'Government Step-In', 'description': 'Judges declare futures contracts to be gambling debts, rendering them legally unenforceable to avoid bankruptcies.'}
        ],
        'stats': [
            {'label': 'Estimated Price Increase', 'value': '2,000%+'},
            {'label': 'Peak Value of Semper Augustus', 'value': '10,000 Guilders'},
            {'label': 'Duration of Collapse', 'value': 'Under 6 Weeks'},
            {'label': 'Value Decline', 'value': '-99.9%'}
        ],
        'lessons': [
            'Speculative bubbles require tools that make leverage and speculation easy (such as futures contracts).',
            'When an asset\'s price detaches completely from its utility or cash flow, a crash is inevitable.',
            'A market collapse is triggered when the pool of marginal buyers is exhausted and FOMO turns to panic.'
        ],
        'chart_data': [
            {'date': 'Nov 1636', 'value': 100},
            {'date': 'Dec 1636', 'value': 220},
            {'date': 'Jan 1637', 'value': 750},
            {'date': 'Feb 3, 1637', 'event': 'Peak', 'value': 2000},
            {'date': 'Feb 15, 1637', 'value': 800},
            {'date': 'Feb 28, 1637', 'value': 200},
            {'date': 'Mar 1637', 'value': 25},
            {'date': 'May 1637', 'value': 1}
        ],
        'quiz': [
            {
                'question': 'What was the "wind trade" (windhandel) that facilitated the tulip bubble?',
                'options': ['Trading shipping insurance policies', 'Speculating on tulip futures contracts without taking immediate physical delivery', 'Selling windmill-generated power contracts', 'Exchanging maritime routes'],
                'answer': 'Speculating on tulip futures contracts without taking immediate physical delivery',
                'explanation': 'The wind trade allowed speculators to buy and sell contracts for bulbs still growing in the ground, enabling leverage and rapid speculation.'
            },
            {
                'question': 'What happened when an auction in Haarlem failed to attract buyers in February 1637?',
                'options': ['The government bought all the remaining tulips', 'Foreign investors acquired the market', 'The bubble burst immediately as sellers panicked and prices fell 99%', 'Tulips were declared national currency'],
                'answer': 'The bubble burst immediately as sellers panicked and prices fell 99%',
                'explanation': 'When demand dried up, confidence vanished. Without marginal buyers, prices collapsed and contracts became worthless.'
            }
        ]
    },
    {
        'id': 'history-of-currencies',
        'title': 'History of Currencies',
        'description': 'From barter and gold coins to fiat money and digital currency.',
        'long_description': 'Money is a social construct that has evolved over thousands of years to facilitate trade. Before money, people relied on direct barter systems, which suffered from the "coincidence of wants" problem. Societies later adopted commodity money (like shells or salt) before transitioning to minted gold and silver coins, which provided standardized weight and value. Paper currency was originally introduced as receipts for gold stored in vaults. However, in 1971, the US officially decoupled the dollar from gold, ushering in the era of fiat money—currency backed solely by government decree and public trust. The rise of Bitcoin in 2009 introduced decentralized digital currencies, challenging traditional central banking control.',
        'difficulty': 'Beginner',
        'read_time': '7 min',
        'image': '/case-currency-history.png',
        'tags': ['Currencies', 'Monetary History', 'Central Banks'],
        'timeline': [
            {'date': 'Pre-600 BC', 'event': 'Barter & Commodity Money', 'description': 'Communities trade goods directly or use natural items like cowrie shells as currency.'},
            {'date': '600 BC', 'event': 'First Minted Coins', 'description': 'King Croesus of Lydia mints the first standardized gold and silver alloy coins.'},
            {'date': '1870s', 'event': 'Gold Standard Era', 'description': 'Major nations tie the value of their currencies directly to a fixed weight of gold, stabilizing exchange rates.'},
            {'date': 'Aug 15, 1971', 'event': 'Nixon Shock', 'description': 'US President Richard Nixon suspends USD convertibility to gold, ending the Bretton Woods system and launching the fiat currency era.'},
            {'date': 'Jan 3, 2009', 'event': 'Bitcoin Launch', 'description': 'Satoshi Nakamoto mines the genesis block of Bitcoin, creating the first decentralized peer-to-peer electronic cash system.'}
        ],
        'stats': [
            {'label': 'USD Value of Gold (1970)', 'value': '$35 / oz'},
            {'label': 'USD Value of Gold (1980)', 'value': '$850 / oz'},
            {'label': 'USD Purchasing Power Loss', 'value': '-95% (Since 1913)'},
            {'label': 'Fiat Currency Lifespan Avg', 'value': '27 Years'}
        ],
        'lessons': [
            'Money serves three primary functions: a medium of exchange, a unit of account, and a store of value.',
            'Fiat money allows central banks to manage liquidity and interest rates, but increases the risk of inflation and debasement.',
            'Sound money is characterized by scarcity, durability, portability, divisibility, and recognizability.'
        ],
        'chart_data': [
            {'date': '1970', 'value': 35},
            {'date': '1972', 'value': 58},
            {'date': '1974', 'value': 154},
            {'date': '1976', 'value': 124},
            {'date': '1978', 'value': 193},
            {'date': '1980', 'value': 615},
            {'date': '1985', 'value': 317},
            {'date': '1990', 'value': 383},
            {'date': '2000', 'value': 279},
            {'date': '2010', 'value': 1225},
            {'date': '2020', 'value': 1770},
            {'date': '2025', 'value': 2350}
        ],
        'quiz': [
            {
                'question': 'What was the significance of the "Nixon Shock" in 1971?',
                'options': ['It created the Federal Reserve system', 'It outlawed private gold ownership in the US', 'It decoupled the US Dollar from gold, initiating the global fiat era', 'It launched the first digital credit card system'],
                'answer': 'It decoupled the US Dollar from gold, initiating the global fiat era',
                'explanation': 'By ending the dollar\'s convertibility to gold, Nixon allowed the dollar (and other linked currencies) to float freely, backed only by government credit.'
            },
            {
                'question': 'What fundamental problem of barter systems does money solve?',
                'options': ['High import tariffs', 'The double coincidence of wants', 'The lack of transport vehicles', 'The high cost of mining metals'],
                'answer': 'The double coincidence of wants',
                'explanation': 'In a barter system, you can only trade if you find someone who has what you want AND wants what you have. Money acts as a universal intermediary.'
            }
        ]
    },
    {
        'id': 'great-depression',
        'title': 'The Great Depression (1929)',
        'description': 'The stock market crash that reshaped modern financial regulation.',
        'long_description': 'The 1920s ("The Roaring Twenties") was a decade of rapid industrial growth, urban expansion, and extreme stock market speculation. Driven by cheap credit, millions of ordinary Americans bought stocks on margin—borrowing up to 90% of the purchase price. On "Black Tuesday" (October 29, 1929), the bubble burst, triggering panic selling and erasing billions of dollars in wealth. This financial panic quickly infected the banking sector: depositors rushed to withdraw cash, leading to the collapse of over 9,000 banks. The crash led to a global depression, forcing governments to establish modern banking regulations like the SEC and deposit insurance (FDIC) to restore public confidence.',
        'difficulty': 'Intermediate',
        'read_time': '9 min',
        'image': '/case-great-depression.png',
        'tags': ['Market Crash', 'Regulation', 'History'],
        'timeline': [
            {'date': '1920-1929', 'event': 'Speculation Boom', 'description': 'Margin trading spikes as retail investors borrow money to participate in a roaring stock market.'},
            {'date': 'Oct 24, 1929', 'event': 'Black Thursday', 'description': 'The market suffers a sharp drop, but investment bankers step in to buy shares and support prices.'},
            {'date': 'Oct 29, 1929', 'event': 'Black Tuesday', 'description': 'Massive panic selling hits Wall Street. The Dow drops 12%, trading volume hits record highs, and fortunes are wiped out.'},
            {'date': '1930-1933', 'event': 'Banking Collapse', 'description': 'Runs on banks deplete reserves, forcing thousands of local banks to close and freezing economic credit.'},
            {'date': '1933-1934', 'event': 'Financial Reforms', 'description': 'President Franklin D. Roosevelt passes the Glass-Steagall Act (creating the FDIC) and creates the SEC to regulate markets.'}
        ],
        'stats': [
            {'label': 'Dow Jones Peak-to-Trough', 'value': '-89.2%'},
            {'label': 'US Unemployment Peak', 'value': '25.0%'},
            {'label': 'US Bank Closures', 'value': '9,000+'},
            {'label': 'Margin Requirement (1929)', 'value': '10% Cash'}
        ],
        'lessons': [
            'Systemic leverage (buying assets with borrowed money) magnifies gains on the way up but forces catastrophic liquidation on the way down.',
            'Fractional reserve banking is vulnerable to liquidity panics and bank runs if depositors lose confidence.',
            'Robust regulatory bodies and government deposit guarantees are essential for long-term market stability.'
        ],
        'chart_data': [
            {'date': '1928', 'value': 200},
            {'date': 'Sep 1929', 'value': 381},
            {'date': 'Dec 1929', 'value': 248},
            {'date': 'Dec 1930', 'value': 164},
            {'date': 'Dec 1931', 'value': 77},
            {'date': 'Jul 1932', 'value': 41},
            {'date': 'Dec 1932', 'value': 59},
            {'date': 'Dec 1933', 'value': 99},
            {'date': 'Dec 1934', 'value': 104},
            {'date': 'Dec 1935', 'value': 144}
        ],
        'quiz': [
            {
                'question': 'What was a primary driver of the extreme speculation during the 1920s stock bubble?',
                'options': ['High gold production', 'Margin trading with up to 90% borrowed funds', 'Banning foreign stock listings', 'Low company earnings'],
                'answer': 'Margin trading with up to 90% borrowed funds',
                'explanation': 'Investors could buy stocks by putting down only 10% of their own cash, inflating prices with leverage.'
            },
            {
                'question': 'Which of the following was created in the aftermath of the crash to protect bank depositors?',
                'options': ['The Securities and Exchange Commission (SEC)', 'The Federal Deposit Insurance Corporation (FDIC)', 'The Investment Company Act', 'The World Bank'],
                'answer': 'The Federal Deposit Insurance Corporation (FDIC)',
                'explanation': 'The FDIC was created in 1933 to guarantee bank deposits up to a certain limit, preventing panic bank runs.'
            }
        ]
    },
    {
        'id': 'dotcom-bubble',
        'title': 'Dot-Com Bubble (1995–2001)',
        'description': 'How hype around the internet inflated and then burst tech valuations.',
        'long_description': 'In the late 1990s, the commercialization of the internet triggered a speculative wave in technology stocks. Venture capital flowed into any company with ".com" in its name, regardless of whether it had a viable business model or actual profits. Driven by retail day-traders and media hype, the Nasdaq Composite index rose by nearly 400% between 1995 and March 2000. When interest rates were raised and companies began running out of cash, the bubble burst. Trillions in market value evaporated, and famous startups like Pets.com went bankrupt. However, survivors like Amazon and eBay proved that the underlying technological shift was real, even if initial valuations were irrational.',
        'difficulty': 'Intermediate',
        'read_time': '8 min',
        'image': '/case-dotcom-bubble.png',
        'tags': ['Technology', 'Bubbles', 'Valuation'],
        'timeline': [
            {'date': 'Aug 1995', 'event': 'Netscape IPO', 'description': 'The web browser company doubles its stock price on day one, sparking internet IPO fever.'},
            {'date': '1999', 'event': 'Mania Phase', 'description': 'Dozens of internet companies go public, seeing massive first-day gains despite reporting zero earnings.'},
            {'date': 'Mar 10, 2000', 'event': 'Nasdaq Peak', 'description': 'The tech-heavy Nasdaq Composite peaks at an all-time high of 5,048.'},
            {'date': 'Late 2000', 'event': 'Liquidity Crunch', 'description': 'The Fed raises interest rates, capital dries up, and companies burn through their remaining cash reserves.'},
            {'date': 'Oct 2002', 'event': 'Market Bottom', 'description': 'The Nasdaq bottoms out at 1,114, down nearly 78% from its peak.'}
        ],
        'stats': [
            {'label': 'Nasdaq Max Drawdown', 'value': '-78.4%'},
            {'label': 'Nasdaq Peak P/E Ratio', 'value': '200x+'},
            {'label': 'Pets.com Bankruptcy Time', 'value': '268 Days Post-IPO'},
            {'label': 'Trillions Lost Globally', 'value': '$5.0T'}
        ],
        'lessons': [
            'In the long run, stock prices must reflect cash flows and earnings; hype and traffic metrics are insufficient.',
            'A genuine structural change (like the internet) can still be accompanied by a massive speculative bubble.',
            'Market bubbles can stay irrational longer than short-sellers can stay solvent, driven by retail herd behavior.'
        ],
        'chart_data': [
            {'date': '1995', 'value': 750},
            {'date': '1996', 'value': 1050},
            {'date': '1997', 'value': 1200},
            {'date': '1998', 'value': 1580},
            {'date': '1999', 'value': 2200},
            {'date': 'Mar 2000', 'value': 5048},
            {'date': 'Sep 2000', 'value': 3600},
            {'date': 'Mar 2001', 'value': 1800},
            {'date': 'Sep 2001', 'value': 1400},
            {'date': 'Oct 2002', 'value': 1114},
            {'date': 'Dec 2003', 'value': 2000}
        ],
        'quiz': [
            {
                'question': 'What was the primary business model flaw of many dot-com startups in the late 1990s?',
                'options': ['High research taxes', 'Prioritizing growth and eye-balls over actual revenue and profitability', 'Using inefficient physical storefronts', 'Refusing to hire software engineers'],
                'answer': 'Prioritizing growth and eye-balls over actual revenue and profitability',
                'explanation': 'Companies burned through venture capital to acquire users, expecting to figure out monetization later, which proved fatal when capital markets dried up.'
            },
            {
                'question': 'Which major tech company survived the crash and eventually became a global e-commerce giant?',
                'options': ['Pets.com', 'Webvan', 'Amazon', 'Netscape'],
                'answer': 'Amazon',
                'explanation': 'While Amazon\'s stock fell 90%+ from its peak, the company had enough cash reserves and a solid infrastructure to survive and rebuild.'
            }
        ]
    },
    {
        'id': 'trade-and-colonialism',
        'title': 'Trade, Colonialism & the Birth of Markets',
        'description': 'How the spice trade and colonial companies created modern finance.',
        'long_description': 'In the early 17th century, European nations sought to establish trade monopolies over the highly lucrative spice trade in Asia. However, sending ships on multi-year voyages carried immense risks of piracy, shipwrecks, and conflict. To fund these ventures, the Dutch government chartered the Dutch East India Company (VOC) in 1602. Instead of borrowing money, the VOC pioneered a revolutionary concept: issuing public shares of stock, allowing citizens to purchase fractional ownership. To facilitate trading, the Amsterdam Stock Exchange was established in 1611. This created the framework of modern public equities, though it was deeply intertwined with colonial exploitation, militarized monopolies, and human cost.',
        'difficulty': 'Advanced',
        'read_time': '10 min',
        'image': '/case-trade-colonialism.png',
        'tags': ['Trade', 'Colonialism', 'Market History'],
        'timeline': [
            {'date': '1602', 'event': 'VOC Founded', 'description': 'The Dutch East India Company is chartered, issuing the first public shares to fund spice voyages.'},
            {'date': '1611', 'event': 'First Stock Exchange', 'description': 'The Amsterdam Stock Exchange opens to allow merchants to trade VOC shares and bonds.'},
            {'date': '1630s-1680s', 'event': 'Colonial Expansion', 'description': 'VOC becomes a militarized monopoly, generating massive wealth for the Dutch state through control of Indonesian spice trade.'},
            {'date': '1720', 'event': 'Joint-Stock Crises', 'description': 'The South Sea Bubble in London and Mississippi Bubble in Paris crash early European stock markets due to speculation.'},
            {'date': '1799', 'event': 'VOC Dissolution', 'description': 'The VOC goes bankrupt due to corruption and changing trade routes, and its assets are nationalized.'}
        ],
        'stats': [
            {'label': 'Estimated VOC Peak Cap', 'value': '$7.9 Trillion'},
            {'label': 'First Share Issued Year', 'value': '1602'},
            {'label': 'Average Dividend Yield', 'value': '18% Annual'},
            {'label': 'VOC Fleet Peak Size', 'value': '150+ Ships'}
        ],
        'lessons': [
            'Joint-stock companies spread risk across a broad pool of investors, allowing massive capital accumulation for high-risk projects.',
            'Stock exchanges create liquidity, permitting investors to easily exit their positions and redirect capital.',
            'Early financial engineering was heavily reliant on state-backed monopoly charters and colonial violence.'
        ],
        'chart_data': [
            {'date': '1602', 'value': 100},
            {'date': '1610', 'value': 120},
            {'date': '1620', 'value': 150},
            {'date': '1630', 'value': 210},
            {'date': '1640', 'value': 300},
            {'date': '1650', 'value': 350},
            {'date': '1660', 'value': 400},
            {'date': '1670', 'value': 480},
            {'date': '1680', 'value': 500},
            {'date': '1700', 'value': 450},
            {'date': '1750', 'value': 250},
            {'date': '1799', 'value': 0}
        ],
        'quiz': [
            {
                'question': 'Which entity was the first company to offer public shares to raise capital?',
                'options': ['British East India Company', 'Dutch East India Company (VOC)', 'Bank of England', 'Mississippi Company'],
                'answer': 'Dutch East India Company (VOC)',
                'explanation': 'The VOC issued shares in 1602, granting citizens fractional ownership and rights to future dividends.'
            },
            {
                'question': 'What structural innovation did the VOC introduce to solve the risk of sending ships on long voyages?',
                'options': ['Government-mandated insurance for all losses', 'Fractional ownership shared among public stockholders', 'Banning foreign maritime trade', 'Replacing wooden ships with iron hulls'],
                'answer': 'Fractional ownership shared among public stockholders',
                'explanation': 'Instead of a single merchant funding an entire ship, thousands of shareholders pooled money, sharing both the risks and the profits.'
            }
        ]
    },
    {
        'id': 'precious-metals-history',
        'title': 'Precious Metals Through History',
        'description': 'Why gold and silver have anchored economies for millennia.',
        'long_description': 'Gold and silver have served as global stores of value across civilizations for over three thousand years. Unlike paper currencies, which can be printed at will, precious metals possess physical properties that make them natural sound money: they are scarce, durable, chemically inert, divisible, and universally recognizable. From the classical Roman Aureus to the British Sovereign, gold coinage backed empire trade. In the 20th century, as governments abandoned metal backing to gain flexibility in monetary policy, gold emerged as a primary safe-haven asset, acting as a hedge against currency inflation and banking system instability.',
        'difficulty': 'Beginner',
        'read_time': '6 min',
        'image': '/case-precious-metals.png',
        'tags': ['Commodities', 'Metals', 'Store of Value'],
        'timeline': [
            {'date': '550 BC', 'event': 'Lydian Coinage', 'description': 'King Croesus issues electrum coins, establishing gold as the primary medium of exchange.'},
            {'date': '1816', 'event': 'Great Britain Gold Standard', 'description': 'The UK adopts the gold standard, defining the Pound Sterling as a fixed weight of gold.'},
            {'date': '1933', 'event': 'US Executive Order 6102', 'description': 'President Franklin D. Roosevelt outlaws private hoarding of gold bullion, forcing citizens to sell gold to the government.'},
            {'date': '1971', 'event': 'Bretton Woods Decoupling', 'description': 'The US suspends dollar-to-gold convertibility, allowing the gold price to float freely.'},
            {'date': '2011', 'event': 'Financial Crisis Bull Run', 'description': 'Gold reaches a record peak of $1,900/oz as investors seek safety following the Great Recession.'}
        ],
        'stats': [
            {'label': 'Total Mined Gold', 'value': '212,000 Tonnes'},
            {'label': 'Annual Mine Growth Rate', 'value': '~1.5%'},
            {'label': 'Gold Density', 'value': '19.3 g/cm3'},
            {'label': 'Gold Price (2024)', 'value': '$2,400 / oz'}
        ],
        'lessons': [
            'Gold is a scarce physical asset with a very low supply growth rate, protecting it from hyperinflation.',
            'Because gold does not pay dividends or yields, its performance relies entirely on capital appreciation during times of uncertainty.',
            'Central banks continue to hold gold reserves as a primary collateral asset to support national monetary systems.'
        ],
        'chart_data': [
            {'date': '1970', 'value': 35},
            {'date': '1975', 'value': 161},
            {'date': '1980', 'value': 615},
            {'date': '1985', 'value': 317},
            {'date': '1990', 'value': 383},
            {'date': '1995', 'value': 387},
            {'date': '2000', 'value': 279},
            {'date': '2005', 'value': 444},
            {'date': '2010', 'value': 1225},
            {'date': '2015', 'value': 1160},
            {'date': '2020', 'value': 1770},
            {'date': '2024', 'value': 2400}
        ],
        'quiz': [
            {
                'question': 'Which executive order by FDR in 1933 forced American citizens to sell their gold bullion to the government?',
                'options': ['Executive Order 9066', 'Executive Order 6102', 'Executive Order 7055', 'Executive Order 8033'],
                'answer': 'Executive Order 6102',
                'explanation': 'FDR signed Executive Order 6102 to confiscate gold holdings, enabling the government to devalue the dollar against gold to stimulate the economy.'
            },
            {
                'question': 'What is the primary reason gold holds value during severe inflationary cycles?',
                'options': ['It is used in food preparation', 'It cannot be printed at will and maintains scarcity relative to paper currency', 'It is backed by international treaties', 'It automatically yields high interest'],
                'answer': 'It cannot be printed at will and maintains scarcity relative to paper currency',
                'explanation': 'Unlike fiat currencies, gold must be mined and refined, limiting supply expansion and preserving its purchasing power.'
            }
        ]
    }
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
