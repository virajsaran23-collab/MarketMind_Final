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
            },
            {
                'question': 'What international financial messaging network were major Russian banks disconnected from as part of the Western sanctions?',
                'options': ['SWIFT', 'CHIPS', 'Fedwire', 'SEPA'],
                'answer': 'SWIFT',
                'explanation': 'Western nations banned major Russian banks from SWIFT (Society for Worldwide Interbank Financial Telecommunication), disrupting Russia\'s ability to receive payments for its exports.'
            },
            {
                'question': 'What policy measure did the G7 nations implement in December 2022 to restrict Russia\'s seaborne crude oil revenues?',
                'options': ['A flat embargo on all exports', 'A price cap of $60 per barrel', 'A shipping blockade in the Baltic Sea', 'A high import tariff on refined products'],
                'answer': 'A price cap of $60 per barrel',
                'explanation': 'The G7, EU, and Australia implemented a $60 per barrel price cap on Russian seaborne crude oil to limit funding for its military while keeping global oil markets supplied.'
            },
            {
                'question': 'Which major grain export commodity saw global prices rise by over 50% in the first half of 2022?',
                'options': ['Corn', 'Wheat', 'Rice', 'Barley'],
                'answer': 'Wheat',
                'explanation': 'Ukraine and Russia are both massive global wheat exporters. The conflict restricted ports and farming, driving wheat futures prices up by ~50%.'
            },
            {
                'question': 'What was the name of the main natural gas pipeline from Russia to Germany that experienced severe flow reductions in 2022?',
                'options': ['Nord Stream 1', 'Yamal-Europe', 'Progress Pipeline', 'Druzhba Pipeline'],
                'answer': 'Nord Stream 1',
                'explanation': 'Nord Stream 1, the major pipeline delivering Russian natural gas to Germany, saw its capacity reduced and eventually halted in 2022, causing gas prices to spike.'
            },
            {
                'question': 'How did European equity markets generally perform during 2022 as energy prices spiked?',
                'options': ['They rallied on high retail sales', 'They entered a bear market on stagflation and inflation concerns', 'They remained unchanged', 'They hit all-time highs'],
                'answer': 'They entered a bear market on stagflation and inflation concerns',
                'explanation': 'High energy prices forced high inflation, leading to central bank rate hikes and fears of economic recession (stagflation), which drove down European equities.'
            },
            {
                'question': 'Which country was the primary consumer of Russian seaborne gas imports before the conflict, provoking a rush for LNG alternatives?',
                'options': ['France', 'Spain', 'Germany', 'United Kingdom'],
                'answer': 'Germany',
                'explanation': 'Germany had a heavy reliance on cheap pipeline gas from Russia, prompting a rapid pivot to build LNG terminals and find alternative suppliers.'
            },
            {
                'question': 'What was the approximate S&P 500 drop in the full year of 2022 due to the macroeconomic fallout of inflation and rate hikes?',
                'options': ['-5.4%', '-19.4%', '-35.2%', '-45.0%'],
                'answer': '-19.4%',
                'explanation': 'The S&P 500 closed 2022 down about 19.4%, its worst calendar-year performance since the 2008 financial crisis.'
            },
            {
                'question': 'In financial markets, what term describes the combination of stagnant economic growth and high inflation that was feared in late 2022?',
                'options': ['Hyperinflation', 'Deflation', 'Stagflation', 'Disinflation'],
                'answer': 'Stagflation',
                'explanation': 'Stagflation refers to the economic challenge of high inflation alongside high unemployment and stagnant economic demand.'
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
            },
            {
                'question': 'What term describes the simultaneous shutdown of public life and economic activity that triggered the March 2020 bear market?',
                'options': ['Quantitative Easing', 'Global Lockdown', 'Stagflation', 'Fiscal Austerity'],
                'answer': 'Global Lockdown',
                'explanation': 'Governments worldwide implemented lock-downs and travel bans to limit the spread of COVID-19, shutting down non-essential economic activity.'
            },
            {
                'question': 'Which asset class plummeted along with equities during the extreme panic in mid-March 2020 before recovering due to Fed intervention?',
                'options': ['US Treasuries', 'Cryptocurrencies', 'Gold', 'All of the above'],
                'answer': 'All of the above',
                'explanation': 'During the peak liquidity panic of mid-March 2020, investors sold everything—including safe havens like Gold and US Treasuries—to raise cash.'
            },
            {
                'question': 'Which video communication software saw its stock gain over 400% in 2020 as it became the standard for remote meetings?',
                'options': ['Zoom', 'Webex', 'Microsoft Teams', 'Skype'],
                'answer': 'Zoom',
                'explanation': 'Zoom Video Communications (ZM) became a household name and speculative darling, surging over 400% during the peak remote-work lockdowns.'
            },
            {
                'question': 'What event in late 2020 sparked a massive "rotation" from technology growth stocks into travel, value, and reopening stocks?',
                'options': ['The launch of the iPhone 12', 'The announcement of highly effective vaccine trial results', 'A new stimulus check package', 'The Fed raising interest rates'],
                'answer': 'The announcement of highly effective vaccine trial results',
                'explanation': 'In November 2020, Pfizer/BioNTech and Moderna announced successful vaccine trials, prompting a rapid rotation into "reopening" trades like airlines and cruise lines.'
            },
            {
                'question': 'What was the approximate maximum drawdown of the S&P 500 index during the rapid crash in February-March 2020?',
                'options': ['-10%', '-22%', '-33.9%', '-50%'],
                'answer': '-33.9%',
                'explanation': 'The S&P 500 crashed 33.9% in just 22 trading days, marking the fastest entry into a bear market in Wall Street history.'
            },
            {
                'question': 'Which sector suffered near-bankruptcies and severe revenue loss due to borders closing and lockdown mandates?',
                'options': ['E-Commerce', 'Pharmaceuticals', 'Airlines & Hospitality', 'Software-as-a-Service'],
                'answer': 'Airlines & Hospitality',
                'explanation': 'Airlines, cruise lines, hotels, and physical entertainment venues saw revenue plummet to near zero during travel bans and lockdowns.'
            },
            {
                'question': 'What type of policy stimulus involves direct cash payments to citizens and expanded unemployment benefits to support demand?',
                'options': ['Monetary stimulus', 'Fiscal stimulus', 'Quantitative Easing', 'Regulatory easing'],
                'answer': 'Fiscal stimulus',
                'explanation': 'Fiscal stimulus is implemented by governments (e.g. CARES Act stimulus checks) rather than central bank monetary operations.'
            },
            {
                'question': 'What structural shift in consumer behavior accelerated dramatically during lockdowns due to the closure of physical retail?',
                'options': ['Cash payments', 'E-commerce and online shopping', 'Traditional banking usage', 'Paper-bill reading'],
                'answer': 'E-commerce and online shopping',
                'explanation': 'E-commerce adoption spiked as consumers ordered groceries, household goods, and electronics online during lockdowns.'
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
            },
            {
                'question': 'Which programming platform/architecture created by NVIDIA became a key software moat for its generative AI hardware?',
                'options': ['CUDA', 'DirectX', 'OpenCL', 'Vulkan'],
                'answer': 'CUDA',
                'explanation': 'NVIDIA\'s proprietary CUDA (Compute Unified Device Architecture) platform allows developers to program GPUs directly, serving as a massive software ecosystem moat.'
            },
            {
                'question': 'What is the primary constraint that prompted the AI hardware rally to expand to energy and utility stocks in late 2024?',
                'options': ['Chip size limitations', 'Lack of software engineers', 'Massive electricity demands of AI data centers', 'High interest rates'],
                'answer': 'Massive electricity demands of AI data centers',
                'explanation': 'As training and running large language models requires massive data centers, the power demands of these centers highlighted electricity grid and generation capacity constraints.'
            },
            {
                'question': 'What public release in November 2022 by OpenAI is widely credited with kicking off the modern Generative AI investment wave?',
                'options': ['DALL-E 2', 'GPT-4', 'ChatGPT', 'Midjourney'],
                'answer': 'ChatGPT',
                'explanation': 'The public launch of ChatGPT in November 2022 showed conversational AI capabilities to the masses, triggering a massive tech capex cycle.'
            },
            {
                'question': 'What term describes companies like NVIDIA that sell the fundamental hardware and infrastructure needed for a technological shift?',
                'options': ['Picks and shovels', 'Software-as-a-service', 'Value traps', 'Defensive staples'],
                'answer': 'Picks and shovels',
                'explanation': 'Derived from the Gold Rush, "picks and shovels" refers to companies that supply the tools needed to build the technology, capturing value first.'
            },
            {
                'question': 'Which group of large technology companies (including Microsoft, Alphabet, Meta, and Amazon) spent hundreds of billions on AI data centers?',
                'options': ['The Silicon Valley Club', 'The Hyperscalers', 'The Hardware Giants', 'The FinTech Coalition'],
                'answer': 'The Hyperscalers',
                'explanation': 'Cloud "hyperscalers" invest massive capital expenditure (capex) to build high-performance data centers equipped with AI chips.'
            },
            {
                'question': 'Approximately how much return did NVIDIA stock generate between late 2022 and late 2024?',
                'options': ['+50%', '+150%', '+500%', '+1,000%+'],
                'answer': '+1,000%+',
                'explanation': 'Driven by near-monopoly chip demand, NVIDIA stock grew more than 10-fold (+1,000%+) between late 2022 and mid-2024.'
            },
            {
                'question': 'Which metal experienced a secondary rally in late 2024 due to its critical role in electrical wiring and power transmission for data centers?',
                'options': ['Aluminum', 'Nickel', 'Copper', 'Zinc'],
                'answer': 'Copper',
                'explanation': 'Data center buildouts and electricity grid upgrades require massive amounts of copper for high-conductivity wiring, driving up prices.'
            },
            {
                'question': 'In early 2025, what major paradigm shift did the AI investment focus shift toward?',
                'options': ['Raw silicon wafers', 'AI software agents and practical workplace automation', 'Liquid cooling systems', 'Solar farms'],
                'answer': 'AI software agents and practical workplace automation',
                'explanation': 'As hardware infrastructure was built out, the investment focus pivoted to the application layer—autonomous AI agents that execute complex tasks.'
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
            },
            {
                'question': 'What target range did the Fed Funds rate reach at its peak in July 2023?',
                'options': ['2.25% - 2.50%', '3.50% - 3.75%', '5.25% - 5.50%', '7.25% - 7.50%'],
                'answer': '5.25% - 5.50%',
                'explanation': 'The Federal Reserve raised the benchmark fed funds rate to a peak range of 5.25% - 5.50% in July 2023, the highest level in 22 years.'
            },
            {
                'question': 'Which sectors generally benefit from rising rates due to improved lending margins?',
                'options': ['Growth Technology', 'Residential Real Estate', 'Retail Commercial Banks', 'Aviation and Tourism'],
                'answer': 'Retail Commercial Banks',
                'explanation': 'Banks can often charge higher interest rates on loans faster than they pay out on deposits, widening their net interest margins (NIM) in a rising-rate environment.'
            },
            {
                'question': 'What was the peak year-over-year CPI inflation rate reached in the United States in June 2022 that forced the Fed to act?',
                'options': ['5.2%', '7.5%', '9.1%', '14.7%'],
                'answer': '9.1%',
                'explanation': 'US consumer inflation reached a 40-year peak of 9.1% in June 2022, prompting the Fed to implement consecutive jumbo interest rate hikes.'
            },
            {
                'question': 'What is the standard increment of a "jumbo" rate hike (like the four consecutive hikes the Fed executed in 2022)?',
                'options': ['10 basis points (0.1%)', '25 basis points (0.25%)', '50 basis points (0.50%)', '75 basis points (0.75%)'],
                'answer': '75 basis points (0.75%)',
                'explanation': 'To combat runaway inflation, the Fed raised rates by 75 basis points (0.75%) four times in a row between June and November 2022.'
            },
            {
                'question': 'How does a rapid rise in interest rates affect the price of existing fixed-rate bonds?',
                'options': ['Bond prices rise', 'Bond prices fall', 'Bond prices remain completely flat', 'Bonds default automatically'],
                'answer': 'Bond prices fall',
                'explanation': 'As interest rates rise, newly issued bonds offer higher yields. Existing bonds with lower interest rates become less attractive, and their prices fall.'
            },
            {
                'question': 'What term describes a bank\'s mismatch between short-term liabilities (deposits) and long-term assets (bonds or mortgages)?',
                'options': ['Credit risk', 'Duration mismatch', 'Liquidity spread', 'Capital adequacy'],
                'answer': 'Duration mismatch',
                'explanation': 'Duration mismatch occurs when the interest rate sensitivity of assets is longer than that of liabilities, exposing the bank to loss if depositors withdraw cash.'
            },
            {
                'question': 'Approximately what level did the US 30-year fixed mortgage rate reach at its peak in late 2023?',
                'options': ['3.5%', '5.0%', '7.79%', '12.4%'],
                'answer': '7.79%',
                'explanation': 'With the benchmark rate high, 30-year fixed mortgage rates peaked at 7.79% in October 2023, freezing residential transaction volumes.'
            },
            {
                'question': 'In stock valuation theory, interest rates are often described as what force on stock multiples?',
                'options': ['The fuel', 'The floor', 'The gravitational pull', 'The buffer'],
                'answer': 'The gravitational pull',
                'explanation': 'Warren Buffett popularized the phrase that interest rates act like gravity on financial asset valuations—higher rates pull down multiples.'
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
            },
            {
                'question': 'What disease/virus caused the striking, highly-prized mosaic petal patterns in Dutch tulips?',
                'options': ['Tulip breaking virus', 'Rust fungus', 'Blight infestation', 'Crown gall bacterium'],
                'answer': 'Tulip breaking virus',
                'explanation': 'The "tulip breaking virus" (a mosaic virus) was actually responsible for the flame-like patterns on the petals that Dutch buyers found so desirable.'
            },
            {
                'question': 'How did the Dutch government eventually resolve the legal disputes over outstanding tulip futures contracts?',
                'options': ['They bailed out all buyers', 'They declared the contracts to be gambling debts and made them unenforceable', 'They imprisoned the default sellers', 'They forced buyers to pay in full'],
                'answer': 'They declared the contracts to be gambling debts and made them unenforceable',
                'explanation': 'To prevent widespread bankruptcy, judges and local authorities nullified the contracts, categorizing them as speculative gambling debts.'
            },
            {
                'question': 'Which century did the famous Tulip Mania take place in?',
                'options': ['15th Century', '16th Century', '17th Century', '18th Century'],
                'answer': '17th Century',
                'explanation': 'Tulip Mania took place in the Netherlands between 1636 and 1637 during the Dutch Golden Age.'
            },
            {
                'question': 'What was the name of the most famous, beautiful, and expensive tulip bulb during the mania?',
                'options': ['Semper Augustus', 'Viceroy', 'Admiral van der Eyck', 'Centenarian'],
                'answer': 'Semper Augustus',
                'explanation': 'The Semper Augustus was the most famous and highly prized bulb, featuring white petals with blood-red streaks.'
            },
            {
                'question': 'What did speculators use to trade bulbs before they were harvested, which did not require immediate cash or physical delivery?',
                'options': ['Gold coins only', 'Paper futures contracts', 'Barter agreements for wheat', 'Real estate deeds'],
                'answer': 'Paper futures contracts',
                'explanation': 'Futures contracts allowed traders to speculate on next year\'s crop without buying the physical bulb today, providing synthetic leverage.'
            },
            {
                'question': 'Which Dutch city was the epicentre of the Haarlem auction failure that triggered the panic?',
                'options': ['Amsterdam', 'Rotterdam', 'Haarlem', 'Utrecht'],
                'answer': 'Haarlem',
                'explanation': 'In Haarlem, on February 3, 1637, a group of buyers failed to show up at a regular bulb auction, signaling the end of demand.'
            },
            {
                'question': 'What was the estimated peak value of a Semper Augustus bulb relative to Amsterdam real estate?',
                'options': ['The price of a small basket of wheat', 'The value of a large canal house', 'The price of a single carriage', 'The cost of a fleet of ships'],
                'answer': 'The value of a large canal house',
                'explanation': 'At the height of the bubble, a single Semper Augustus bulb could sell for 10,000 guilders—enough to buy a grand canal house.'
            },
            {
                'question': 'What term is used to describe speculative trading where people buy assets solely to sell them to someone else at a higher price?',
                'options': ['Value investing', 'Arbitrage', 'Greater Fool Theory', 'Hedging'],
                'answer': 'Greater Fool Theory',
                'explanation': 'The Greater Fool Theory states that you can make money on an overvalued asset because there will always be someone else willing to buy it at a higher price.'
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
            },
            {
                'question': 'Which civilization is credited with minting the first standardized gold and silver coins around 600 BC?',
                'options': ['The Roman Empire', 'The Kingdom of Lydia', 'Ancient Egypt', 'The Han Dynasty'],
                'answer': 'The Kingdom of Lydia',
                'explanation': 'Standardized coins minted from electrum (a gold-silver alloy) were first produced under King Croesus in Lydia (modern-day Turkey).'
            },
            {
                'question': 'What are the three primary functions that define money in economics?',
                'options': ['Supply, demand, and velocity', 'Medium of exchange, unit of account, and store of value', 'Mining, printing, and digital ledgering', 'Lending, borrowing, and interest accumulation'],
                'answer': 'Medium of exchange, unit of account, and store of value',
                'explanation': 'To be considered money, an asset must serve as a medium of exchange, a unit of account, and a store of value.'
            },
            {
                'question': 'Which country introduced the first recorded paper currency in history, around the 11th century?',
                'options': ['Italy', 'Egypt', 'China', 'Greece'],
                'answer': 'China',
                'explanation': 'China introduced "Jiaozi" paper money during the Song Dynasty to replace heavy iron coins, facilitating long-distance trade.'
            },
            {
                'question': 'What type of money is backed by government decree and public trust rather than a physical commodity?',
                'options': ['Commodity money', 'Representative money', 'Fiat money', 'Asset-backed currency'],
                'answer': 'Fiat money',
                'explanation': 'Fiat money (like the modern USD, EUR, or INR) is not backed by gold or silver, but by the decree of the issuing government.'
            },
            {
                'question': 'What system tied major global currencies to a fixed weight of gold during the late 19th and early 20th centuries?',
                'options': ['The Bretton Woods System', 'The Gold Standard', 'The Silver Standard', 'The Fiat Agreement'],
                'answer': 'The Gold Standard',
                'explanation': 'Under the Gold Standard, countries promised to exchange paper currency for physical gold at a fixed price, limiting monetary expansion.'
            },
            {
                'question': 'What is the name of the genesis block miner of Bitcoin who published the whitepaper in 2008?',
                'options': ['Vitalik Buterin', 'Satoshi Nakamoto', 'Nick Szabo', 'Hal Finney'],
                'answer': 'Satoshi Nakamoto',
                'explanation': 'Satoshi Nakamoto is the pseudonym of the creator who released the Bitcoin whitepaper and mined its first block in 2009.'
            },
            {
                'question': 'What was the gold price in US dollars per ounce before the Nixon Shock ended convertibility?',
                'options': ['$20.67', '$35.00', '$100.00', '$350.00'],
                'answer': '$35.00',
                'explanation': 'Under the Bretton Woods system, the US dollar was backed by gold at a fixed exchange rate of $35 per ounce.'
            },
            {
                'question': 'Which characteristic of sound money prevents it from being easily replicated or inflated?',
                'options': ['Divisibility', 'Portability', 'Scarcity', 'Durability'],
                'answer': 'Scarcity',
                'explanation': 'Scarcity is the quality that ensures currency retains value over time because its supply cannot be expanded without significant cost.'
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
            },
            {
                'question': 'What specific day of the week became famous for the catastrophic panic selling on October 29, 1929?',
                'options': ['Black Monday', 'Black Tuesday', 'Black Thursday', 'Black Friday'],
                'answer': 'Black Tuesday',
                'explanation': 'October 29, 1929 is known as Black Tuesday, when the stock market collapsed completely under a wave of panic selling.'
            },
            {
                'question': 'What did the Glass-Steagall Act of 1933 mandate for commercial and investment banking?',
                'options': ['It forced them to merge to prevent insolvency', 'It separated commercial banking (deposits) from investment banking (speculative activities)', 'It prohibited banks from charging interest', 'It nationalized all retail banks'],
                'answer': 'It separated commercial banking (deposits) from investment banking (speculative activities)',
                'explanation': 'The Glass-Steagall Act separated commercial banks (which take deposits and are FDIC-insured) from riskier investment banks to protect consumer capital.'
            },
            {
                'question': 'What was the approximate peak-to-trough percentage decline of the Dow Jones Industrial Average during the Great Depression crash?',
                'options': ['-30%', '-50%', '-89.2%', '-98%'],
                'answer': '-89.2%',
                'explanation': 'The Dow Jones peaked in September 1929 at 381 and bottomed out in July 1932 at just 41, a devastating loss of 89.2%.'
            },
            {
                'question': 'What was the peak unemployment rate reached in the United States during the worst phase of the Depression (1933)?',
                'options': ['10%', '15%', '25%', '40%'],
                'answer': '25%',
                'explanation': 'At the depth of the Great Depression, one in four American workers (25%) was unemployed, causing severe social and economic hardship.'
            },
            {
                'question': 'What term describes depositors rushing to a bank to withdraw their money simultaneously, fearing the bank will fail?',
                'options': ['Short squeeze', 'Margin call', 'Bank run', 'Capital strike'],
                'answer': 'Bank run',
                'explanation': 'A bank run occurs when depositors panic and try to withdraw cash simultaneously, depleting a fractional reserve bank\'s vault cash.'
            },
            {
                'question': 'Which US President implemented the "New Deal" and signed the Banking Act of 1933?',
                'options': ['Herbert Hoover', 'Franklin D. Roosevelt', 'Woodrow Wilson', 'Calvin Coolidge'],
                'answer': 'Franklin D. Roosevelt',
                'explanation': 'President Franklin D. Roosevelt took office in 1933 and immediately initiated sweeping financial reforms under the New Deal.'
            },
            {
                'question': 'What was the typical cash margin requirement for retail investors buying stocks in the late 1920s?',
                'options': ['10% cash', '50% cash', '100% cash', 'Margin was illegal'],
                'answer': '10% cash',
                'explanation': 'Before modern margin rules, investors could buy $1,000 worth of stock with only $100 of cash, borrowing the remaining 90% from brokers.'
            },
            {
                'question': 'What regulatory agency was established in 1934 to police Wall Street, prevent insider trading, and enforce disclosure laws?',
                'options': ['The Federal Reserve', 'The Securities and Exchange Commission (SEC)', 'The FDIC', 'The Treasury Department'],
                'answer': 'The Securities and Exchange Commission (SEC)',
                'explanation': 'The SEC was created in 1934 to regulate stock exchanges, brokers, and corporate disclosures, restoring public faith in equities.'
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
            },
            {
                'question': 'Which web browser company\'s explosive IPO in August 1995 is widely seen as the opening bell of the Dot-Com Bubble?',
                'options': ['Netscape', 'Microsoft Internet Explorer', 'Opera', 'AOL'],
                'answer': 'Netscape',
                'explanation': 'Netscape\'s IPO on August 9, 1995 was a massive success, doubling in value on day one and setting off speculation in internet stocks.'
            },
            {
                'question': 'By what percentage did the Nasdaq Composite fall from its peak in March 2000 to its bottom in October 2002?',
                'options': ['25%', '45%', '78%', '95%'],
                'answer': '78%',
                'explanation': 'The Nasdaq Composite index collapsed from an intraday peak of 5,048 down to a bottom of 1,114, representing a devastating 78.4% decline.'
            },
            {
                'question': 'Which index, heavy with technology and telecommunication stocks, is the symbol of the Dot-Com Bubble?',
                'options': ['S&P 500', 'Dow Jones Industrial Average', 'Nasdaq Composite', 'Russell 2000'],
                'answer': 'Nasdaq Composite',
                'explanation': 'The Nasdaq Composite, which listed most tech startups, rose to an all-time high above 5,000 before crashing during the dot-com bust.'
            },
            {
                'question': 'What was the peak P/E (Price-to-Earnings) ratio of the Nasdaq Composite index at the height of the bubble?',
                'options': ['15x', '30x', '100x', '200x+'],
                'answer': '200x+',
                'explanation': 'At the bubble\'s peak in March 2000, the tech-heavy Nasdaq index traded at a nosebleed P/E multiple of over 200x average earnings.'
            },
            {
                'question': 'Which online pet food supplier became the ultimate poster child of dot-com bankruptcy, failing less than a year after its IPO?',
                'options': ['Pets.com', 'Petco', 'Webvan', 'Chewy'],
                'answer': 'Pets.com',
                'explanation': 'Pets.com had a high-profile Super Bowl ad but negative unit economics. It went bankrupt just 268 days after going public.'
            },
            {
                'question': 'What policy action by the Federal Reserve in 1999-2000 helped dry up venture capital liquidity, poping the bubble?',
                'options': ['Cutting interest rates', 'Raising interest rates', 'Launching Quantitative Easing', 'Nationalizing tech firms'],
                'answer': 'Raising interest rates',
                'explanation': 'The Fed raised rates multiple times in 1999 and 2000 to cool the economy, making speculative risk capital more expensive and harder to get.'
            },
            {
                'question': 'What term describes a stock market listing strategy where companies went public with no earnings simply by adding a suffix to their name?',
                'options': ['Value rotation', 'The dot-com effect', 'Reverse takeover', 'Stagflation hedge'],
                'answer': 'The dot-com effect',
                'explanation': 'Adding ".com" to a company\'s name was often enough to double or triple its stock price during the height of the bubble.'
            },
            {
                'question': 'Approximately how much global stock market capitalization was wiped out during the dot-com crash?',
                'options': ['500 Billion', '1 Trillion', '5 Trillion', '15 Trillion'],
                'answer': '5 Trillion',
                'explanation': 'An estimated $5 Trillion in global stock market value evaporated during the crash between 2000 and 2002.'
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
            },
            {
                'question': 'Where was the first formal stock exchange established in 1611 to facilitate the trading of VOC shares?',
                'options': ['London', 'Amsterdam', 'Paris', 'Antwerp'],
                'answer': 'Amsterdam',
                'explanation': 'The Amsterdam Stock Exchange was set up in 1611 primarily to create secondary liquidity for VOC share and bondholders.'
            },
            {
                'question': 'What was the typical annual dividend yield paid out by the VOC to its investors over its lifespan?',
                'options': ['2%', '5%', '18%', '75%'],
                'answer': '18%',
                'explanation': 'Over its nearly two-century history, the VOC paid out substantial annual dividends averaging around 18%, keeping investor demand high.'
            },
            {
                'question': 'In what year was the Dutch East India Company (VOC) chartered, issuing the first public shares?',
                'options': ['1588', '1602', '1648', '1715'],
                'answer': '1602',
                'explanation': 'The VOC was established in 1602 by the States-General of the Netherlands to consolidate Dutch spice voyages.'
            },
            {
                'question': 'What primary commodity from the East Indies was the VOC seeking to monopolize due to its high value in Europe?',
                'options': ['Cotton and silk', 'Spices (nutmeg, cloves, pepper)', 'Gold and silver bullion', 'Tea and porcelain'],
                'answer': 'Spices (nutmeg, cloves, pepper)',
                'explanation': 'Spices were highly valued status symbols in Europe, and controlling their sources (like the Banda Islands) yielded massive profit margins.'
            },
            {
                'question': 'What joint-stock crisis in London in 1720 resulted from speculative trading of shares in a company trading with South America?',
                'options': ['The South Sea Bubble', 'The Mississippi Bubble', 'The Tulip Crisis', 'The Railway Mania'],
                'answer': 'The South Sea Bubble',
                'explanation': 'The South Sea Bubble involved intense speculation in the shares of the South Sea Company, crashing the British stock market in 1720.'
            },
            {
                'question': 'What was the name of the French joint-stock bubble of 1720 centered around colonial trade in North America?',
                'options': ['The Louisiana Crash', 'The Mississippi Bubble', 'The Amsterdam Panic', 'The East India Debacle'],
                'answer': 'The Mississippi Bubble',
                'explanation': 'John Law\'s Mississippi Company inflated a massive speculative bubble in France based on exaggerated riches in French Louisiana, collapsing in 1720.'
            },
            {
                'question': 'What happened to the VOC in 1799 after facing massive corruption, heavy debt, and changing trade routes?',
                'options': ['It merged with the British East India Company', 'It went bankrupt and was nationalized by the Dutch state', 'It was sold to a private consortium of merchants', 'It became the modern Central Bank of Holland'],
                'answer': 'It went bankrupt and was nationalized by the Dutch state',
                'explanation': 'Often nicknamed "Vergaan Onder Corruptie" (Perished Under Corruption), the VOC collapsed in debt and was dissolved in 1799, its assets taken over by the government.'
            },
            {
                'question': 'What is the fundamental financial innovation of joint-stock companies that shields individual investors from personal bankruptcy if the company fails?',
                'options': ['Double-entry bookkeeping', 'Limited liability', 'Fiat backing', 'Audited balance sheets'],
                'answer': 'Limited liability',
                'explanation': 'Limited liability ensures that shareholders can only lose the capital they invested, shielding their personal assets from creditors of the company.'
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
            },
            {
                'question': 'What fixed weight standard did Great Britain establish in 1816 to stabilize its currency value?',
                'options': ['The Silver Standard', 'The Gold Standard', 'The Electrum Standard', 'The Sterling Decree'],
                'answer': 'The Gold Standard',
                'explanation': 'By adopting the gold standard in 1816, Great Britain legally linked the value of the Pound Sterling to a set amount of physical gold.'
            },
            {
                'question': 'Why is gold considered chemically inert, which makes it ideal as a durable physical currency?',
                'options': ['It dissolves instantly in water', 'It does not oxidize, rust, or corrode over time', 'It reacts strongly with oxygen to form gold oxide', 'It decays radioactively within decades'],
                'answer': 'It does not oxidize, rust, or corrode over time',
                'explanation': 'Gold does not react with oxygen or moisture, meaning gold coins buried centuries ago remain in perfect condition when unearthed.'
            },
            {
                'question': 'Which Roman coin, composed of pure gold, served as the currency anchor for trade across the Roman Empire?',
                'options': ['Denarius', 'Sestertius', 'Aureus', 'Solidus'],
                'answer': 'Aureus',
                'explanation': 'The Aureus was the primary Roman gold coin, while the Denarius was a silver coin that suffered from debasement.'
            },
            {
                'question': 'What is the density of gold in grams per cubic centimeter, which makes it easy to authenticate?',
                'options': ['5.5 g/cm3', '10.5 g/cm3', '19.3 g/cm3', '22.6 g/cm3'],
                'answer': '19.3 g/cm3',
                'explanation': 'Gold is exceptionally dense (19.3 g/cm3), making it heavy and easy to verify using water displacement tests.'
            },
            {
                'question': 'What is the approximate annual growth rate of the total global above-ground supply of gold from mining?',
                'options': ['~0.1%', '~1.5%', '~5.0%', '~10.0%'],
                'answer': '~1.5%',
                'explanation': 'Global gold supply increases slowly, by only about 1.5% annually, preserving its purchasing power and scarcity.'
            },
            {
                'question': 'Which country defined its currency, the Pound Sterling, as a fixed weight of gold in 1816?',
                'options': ['The United States', 'Great Britain', 'France', 'Germany'],
                'answer': 'Great Britain',
                'explanation': 'Great Britain adopted the gold standard with the Coinage Act of 1816, establishing the sovereign gold coin as the currency unit.'
            },
            {
                'question': 'What term describes gold because it does not pay interest or dividends, requiring investors to rely purely on capital gains?',
                'options': ['High-yield asset', 'Non-yielding asset', 'Defensive growth stock', 'Derivative instrument'],
                'answer': 'Non-yielding asset',
                'explanation': 'Unlike bonds or stocks, physical gold pays no interest or dividends. Its return depends solely on capital appreciation.'
            },
            {
                'question': 'Why do central banks continue to buy and hold gold reserves today, even in the fiat currency era?',
                'options': ['To use in making currency coins', 'As a high-quality reserve asset to hedge inflation and support systemic trust', 'To sell it to electronics companies', 'To peg the value of the dollar'],
                'answer': 'As a high-quality reserve asset to hedge inflation and support systemic trust',
                'explanation': 'Central banks hold thousands of tonnes of gold as a secure reserve asset with no counterparty risk, protecting national balance sheets.'
            }
        ]
    }
]


class Command(BaseCommand):
    help = 'Seed assets and case studies only — no fake users'

    def handle(self, *args, **options):
        from django.contrib.auth.models import User
        from api.models import LeaderboardEntry
        LeaderboardEntry.objects.filter(user__username='aria_mehta').delete()
        User.objects.filter(username='aria_mehta').delete()

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
