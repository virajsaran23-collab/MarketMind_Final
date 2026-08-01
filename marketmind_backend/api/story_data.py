# Story chapters data for Great Market Calamities

CALAMITIES = [
    {
        "id": "1929-crash",
        "title": "The Great Crash of 1929",
        "era": "October 1929",
        "difficulty": "Beginner",
        "read_time": "6 min",
        "image": "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop",
        "tags": ["Margin Leverage", "Panic Selling", "Liquidity Freeze", "Great Depression"],
        "reward_xp": 500,
        "badge_reward": "1929 Crash Survivor",
        "summary": "Step into Wall Street during the Roaring Twenties. Retail investors are using 10x margin leverage to buy stocks. When the ticker tape lags behind, panic erupts.",
        "study": {
            "prof_algo_intro": "Ah, 1929! The Roaring Twenties turned everyone into stock speculators. But there was a hidden trap: 90% margin debt. People put down $10 to buy $100 of stock. When prices dipped slightly, brokers issued margin calls. If investors couldn't pay cash, their stock was forcibly dumped into the market, triggering a death spiral. Let's see if you can navigate the collapse without losing your virtual shirt!",
            "historical_background": "Between 1920 and 1929, the Dow Jones increased by 500%. On Thursday, October 24, 1929 ('Black Thursday'), a record 12.9 million shares were traded. Financial tycoons tried to prop up the market by buying blue chips, but by 'Black Tuesday' (October 29), panic was absolute.",
            "key_concepts": [
                {
                    "term": "Margin Call",
                    "definition": "A demand by a broker for an investor to deposit additional money or securities so that the account is brought up to the minimum maintenance margin."
                },
                {
                    "term": "Forced Liquidation",
                    "definition": "When a broker automatically sells an investor's assets because the investor failed to meet a margin call."
                },
                {
                    "term": "Ticker Tape Lag",
                    "definition": "When trading volume exceeds the speed of mechanical communication, leaving traders blind to current prices."
                }
            ],
            "key_indicators": {
                "Dow Jones Level": 381.17,
                "Avg Margin Debt Ratio": "90%",
                "Commercial Bank Failures": "Elevated"
            }
        },
        "simulation": {
            "initial_index": 381.17,
            "starting_cash": 100000.0,
            "ticks": [
                {
                    "step": 1,
                    "date": "Oct 24, 1929 (Black Thursday)",
                    "headline": "BREAKING: Panic selling erupts at opening bell! Record 12.9M shares traded; ticker tape 4 hours behind!",
                    "index_val": 299.47,
                    "pct_change": -21.4,
                    "market_sentiment": "Extreme Panic",
                    "prof_algo_comment": "Look at the tape! Forced margin liquidations are flooding the floor. Brokerages are calling in loans. What is your position?",
                    "options": [
                        {
                            "id": "exit_cash",
                            "label": "Move 100% to Cash (Sell All)",
                            "description": "Liquidate positions immediately to preserve remaining fake cash.",
                            "risk": 15,
                            "pnl_impact": 0.05,
                            "memory_tag": "Prudent Risk Saver",
                            "prof_algo_reaction": "Masterful move! Moving to cash prevented you from getting wiped out by incoming margin liquidations."
                        },
                        {
                            "id": "buy_the_dip",
                            "label": "Buy the Dip with 2x Margin",
                            "description": "Use margin leverage to double down, betting the bankers will rescue Wall Street.",
                            "risk": 95,
                            "pnl_impact": -0.35,
                            "memory_tag": "Aggressive Margin Speculator",
                            "prof_algo_reaction": "Ouch! Catching a falling knife on margin in 1929 is deadly. You just triggered a broker margin call!"
                        },
                        {
                            "id": "short_market",
                            "label": "Open Short Position",
                            "description": "Bet on further market decline as margin calls cascade.",
                            "risk": 60,
                            "pnl_impact": 0.40,
                            "memory_tag": "Ruthless Bearish Hedger",
                            "prof_algo_reaction": "Brilliant short play! You profited from the cascading margin liquidations."
                        }
                    ]
                },
                {
                    "step": 2,
                    "date": "Oct 28, 1929 (Black Monday)",
                    "headline": "DEVELOPING: Banking Syndicate fails to halt sell-off! Dow plummets another 12.8% in single session!",
                    "index_val": 260.64,
                    "pct_change": -12.8,
                    "market_sentiment": "Total Meltdown",
                    "prof_algo_comment": "Even Richard Whitney and the Morgan bankers couldn't stop the avalanche. Stock values are disintegrating.",
                    "options": [
                        {
                            "id": "hold_cash",
                            "label": "Hold Cash & Wait",
                            "description": "Remain on the sidelines while liquidity drains out of the market.",
                            "risk": 20,
                            "pnl_impact": 0.0,
                            "memory_tag": "Patient Capital Holder",
                            "prof_algo_reaction": "Patience is a virtue in a liquidity crash. You protected your portfolio while others lost fortunes."
                        },
                        {
                            "id": "short_more",
                            "label": "Increase Short Position",
                            "description": "Press the short advantage as panic turns into structural economic collapse.",
                            "risk": 50,
                            "pnl_impact": 0.25,
                            "memory_tag": "Aggressive Trend Follower",
                            "prof_algo_reaction": "Spot-on macro execution! The lack of circuit breakers meant downside momentum was unstoppable."
                        },
                        {
                            "id": "average_down",
                            "label": "Buy Blue Chips at Discount",
                            "description": "Buy Montgomery Ward & US Steel believing they are undervalued.",
                            "risk": 80,
                            "pnl_impact": -0.20,
                            "memory_tag": "Early Value Trapper",
                            "prof_algo_reaction": "Be careful! Valuations meant nothing during 1929 because credit was completely frozen."
                        }
                    ]
                },
                {
                    "step": 3,
                    "date": "Nov 1929 (Post-Crash Bottom)",
                    "headline": "SUMMARY: Dow drops from 381 to 198. Over $30 Billion in wealth wiped out as Great Depression begins.",
                    "index_val": 198.69,
                    "pct_change": -47.8,
                    "market_sentiment": "Deep Depression",
                    "prof_algo_comment": "The Roaring Twenties are over. The Great Depression has begun. Let's see how your account survived!",
                    "options": [
                        {
                            "id": "reinvest_distressed",
                            "label": "Accumulate High Yield Distressed Assets",
                            "description": "Begin fractional dollar-cost averaging into rock-bottom dividend stocks.",
                            "risk": 40,
                            "pnl_impact": 0.15,
                            "memory_tag": "Generational Value Investor",
                            "prof_algo_reaction": "A classic value move. Buying at generational lows sets the foundation for long-term recovery."
                        },
                        {
                            "id": "stay_defensive",
                            "label": "Hold Gold & Treasury Bonds",
                            "description": "Keep cash locked in safe havens until bank solvent rules stabilize.",
                            "risk": 15,
                            "pnl_impact": 0.08,
                            "memory_tag": "Ultra Conservative Capital Defender",
                            "prof_algo_reaction": "Defensive perfection. Preserving capital during systemic banking collapses is rule #1."
                        }
                    ]
                }
            ]
        }
    },
    {
        "id": "1973-oil-crisis",
        "title": "The 1973 OPEC Energy Crisis & Stagflation",
        "era": "October 1973",
        "difficulty": "Intermediate",
        "read_time": "7 min",
        "image": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
        "tags": ["OPEC Embargo", "Stagflation", "Oil Shock", "Commodities"],
        "reward_xp": 650,
        "badge_reward": "Stagflation Strategist",
        "summary": "OPEC proclaims an oil embargo against Western nations. Crude prices quadruple overnight, sparking 12% inflation alongside negative GDP growth — creating the dreaded Stagflation.",
        "study": {
            "prof_algo_intro": "Welcome to 1973! Investors spent decades assuming cheap oil and low inflation would last forever. Then OPEC shut off the taps. Oil quadrupled from $3 to $12 per barrel. Stocks crashed while inflation skyrocketed — a toxic combo known as Stagflation. Standard stock-bond portfolios failed. Let's see if you can pivot into commodities and energy producers!",
            "historical_background": "In October 1973, Arab members of OPEC imposed an oil embargo during the Yom Kippur War. Gas lines stretched for miles across America. S&P 500 fell 48% between 1973 and 1974 while inflation surged to 12.3%.",
            "key_concepts": [
                {
                    "term": "Stagflation",
                    "definition": "A rare economic condition characterized by stagnant economic growth, high unemployment, and high inflation simultaneously."
                },
                {
                    "term": "Supply Shock",
                    "definition": "An unexpected event that suddenly changes the supply of a product or commodity, causing sudden price swings."
                },
                {
                    "term": "Cost-Push Inflation",
                    "definition": "Inflation caused by an increase in prices of inputs like energy, raw materials, or labor."
                }
            ],
            "key_indicators": {
                "Crude Oil Price": "$3.00 ➔ $11.65",
                "US Inflation Rate": "12.3%",
                "S&P 500 Drawdown": "-48.2%"
            }
        },
        "simulation": {
            "initial_index": 110.10,
            "starting_cash": 100000.0,
            "ticks": [
                {
                    "step": 1,
                    "date": "Oct 17, 1973",
                    "headline": "ALERT: OPEC announces total oil export embargo! Gas stations run dry; crude spikes 300%!",
                    "index_val": 96.50,
                    "pct_change": -12.3,
                    "market_sentiment": "Energy Shock Panic",
                    "prof_algo_comment": "Traditional growth stocks like tech and manufacturing are getting slammed by input costs. How do you reallocate your portfolio?",
                    "options": [
                        {
                            "id": "rotate_energy",
                            "label": "Rotate into Oil & Energy Majors",
                            "description": "Shift 60% of fake cash into domestic oil producers and energy exploration companies.",
                            "risk": 45,
                            "pnl_impact": 0.35,
                            "memory_tag": "Macro Commodity Rotator",
                            "prof_algo_reaction": "Outstanding rotation! Energy equities exploded higher as crude prices skyrocketed."
                        },
                        {
                            "id": "hold_tech_growth",
                            "label": "Hold Nifty Fifty Growth Stocks",
                            "description": "Maintain positions in Kodak, Polaroid, and Xerox believing quality withstands inflation.",
                            "risk": 75,
                            "pnl_impact": -0.25,
                            "memory_tag": "Growth Stock Stubborn Holding",
                            "prof_algo_reaction": "Ouch! High P/E growth stocks get crushed during high interest rate and inflation cycles."
                        },
                        {
                            "id": "buy_gold",
                            "label": "Buy Gold & Hard Assets",
                            "description": "Hedge against currency devaluation by buying gold bullion and commodities.",
                            "risk": 30,
                            "pnl_impact": 0.30,
                            "memory_tag": "Inflation Hedge Specialist",
                            "prof_algo_reaction": "Gold had an epic run in the 1970s. Perfect inflation defense!"
                        }
                    ]
                },
                {
                    "step": 2,
                    "date": "Mid-1974",
                    "headline": "ECONOMIC UPDATE: US Inflation hits 12.3%! Unemployment rises; Fed raises rates aggressively.",
                    "index_val": 72.30,
                    "pct_change": -25.0,
                    "market_sentiment": "Stagflation Bear Market",
                    "prof_algo_comment": "The Federal Reserve is hiking rates into a weakening economy. Double-whammy for equities!",
                    "options": [
                        {
                            "id": "short_consumer",
                            "label": "Short Consumer Discretionary",
                            "description": "Short auto manufacturers and retail stocks struggling with squeezed consumer wallets.",
                            "risk": 40,
                            "pnl_impact": 0.20,
                            "memory_tag": "Tactical Sector Shorting",
                            "prof_algo_reaction": "Great tactical read. Consumer spending collapsed as gasoline prices ate up household budgets."
                        },
                        {
                            "id": "buy_bonds",
                            "label": "Buy Long-Term Treasury Bonds",
                            "description": "Buy long bonds assuming rates will fall back down soon.",
                            "risk": 70,
                            "pnl_impact": -0.15,
                            "memory_tag": "Rate Duration Error",
                            "prof_algo_reaction": "Bonds got hammered in 1974 because inflation kept pushing yields higher!"
                        }
                    ]
                }
            ]
        }
    },
    {
        "id": "1987-black-monday",
        "title": "Black Monday 1987: Algorithmic Panic",
        "era": "October 19, 1987",
        "difficulty": "Intermediate",
        "read_time": "5 min",
        "image": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop",
        "tags": ["Program Trading", "Single-Day Crash", "Portfolio Insurance", "Circuit Breakers"],
        "reward_xp": 600,
        "badge_reward": "Black Monday Survivor",
        "summary": "On October 19, 1987, the Dow Jones dropped 22.6% in a SINGLE day — the largest one-day drop in stock market history. Automated computer trading software triggered cascading sell orders.",
        "study": {
            "prof_algo_intro": "Imagine waking up and seeing your portfolio drop 22% before lunch! That was Black Monday 1987. Back then, institutional funds introduced 'Portfolio Insurance' — computerized models programmed to sell index futures whenever stocks dropped. When market dips started, computers sold futures automatically, causing further drops, which triggered more automated sells! It was the first computer-driven flash crash in history.",
            "historical_background": "On Monday, Oct 19, 1987, the Dow collapsed 508 points (-22.6%). There were no circuit breakers to pause trading. Newly appointed Fed Chairman Alan Greenspan flooded banks with liquidity the next morning.",
            "key_concepts": [
                {
                    "term": "Portfolio Insurance",
                    "definition": "A computer-driven hedging strategy designed to limit portfolio loss by automatically shorting index futures as prices drop."
                },
                {
                    "term": "Feedback Loop",
                    "definition": "When computerized sell orders trigger price drops that activate even more computerized sell orders."
                },
                {
                    "term": "Circuit Breakers",
                    "definition": "Trading halts implemented after 1987 to temporarily pause trading when markets fall by specific percentages."
                }
            ],
            "key_indicators": {
                "Single-Day Dow Change": "-22.6%",
                "S&P Futures Discount": "-12%",
                "Federal Reserve Action": "Immediate Liquidity Injection"
            }
        },
        "simulation": {
            "initial_index": 2246.74,
            "starting_cash": 100000.0,
            "ticks": [
                {
                    "step": 1,
                    "date": "Monday Morning, Oct 19, 1987",
                    "headline": "FLASH CRASH: Computer trading algorithms trigger panic sell loop! Dow down 200 pts by noon!",
                    "index_val": 1950.00,
                    "pct_change": -13.2,
                    "market_sentiment": "Algorithmic Chaos",
                    "prof_algo_comment": "The exchange floor is in pandemonium. Market makers refuse to answer phone calls! What do you do during the flash crash?",
                    "options": [
                        {
                            "id": "dont_panic_sell",
                            "label": "Hold Tight & Do Not Panic Sell",
                            "description": "Recognize that fundamentals haven't changed and computer liquidations will overreach.",
                            "risk": 35,
                            "pnl_impact": 0.10,
                            "memory_tag": "Discipline Under Pressure",
                            "prof_algo_reaction": "Wisdom under fire! Panic selling at the bottom of a flash crash is the worst mistake a trader can make."
                        },
                        {
                            "id": "panic_sell_bottom",
                            "label": "Sell Everything at Market Price",
                            "description": "Dump all holdings immediately into illiquid bids.",
                            "risk": 90,
                            "pnl_impact": -0.22,
                            "memory_tag": "Panic Floor Seller",
                            "prof_algo_reaction": "You sold right into the computer-driven bottom! You locked in a massive 22% loss."
                        },
                        {
                            "id": "buy_post_crash",
                            "label": "Prepare Low-Limit Bids for Blue Chips",
                            "description": "Set limit orders to buy top American corporations at fire-sale discounts.",
                            "risk": 50,
                            "pnl_impact": 0.30,
                            "memory_tag": "Opportunistic Liquidity Provider",
                            "prof_algo_reaction": "Sensational execution! The market rallied sharply in the following months as the Fed stepped in."
                        }
                    ]
                }
            ]
        }
    },
    {
        "id": "2000-dotcom",
        "title": "The 2000 Dot-Com Bubble Collapse",
        "era": "March 2000 - 2002",
        "difficulty": "Intermediate",
        "read_time": "6 min",
        "image": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format&fit=crop",
        "tags": ["Tech Bubble", "Valuation Meltdown", "Pets.com", "P/E Ratio"],
        "reward_xp": 700,
        "badge_reward": "Bubble Navigator",
        "summary": "Invest in the height of internet fever when unprofitable web companies trade at 400x revenue. Watch as the NASDAQ collapses by 78% over two agonizing years.",
        "study": {
            "prof_algo_intro": "Ah, the year 2000! Everyone thought 'The New Economy' had eliminated economic recessions. Companies added '.com' to their name and saw their stock double in a day, despite having zero earnings! But when interest rates rose and venture capital dried up, valuation gravity returned. NASDAQ crashed 78%. Let's see if you can spot speculative hype vs true cash flow!",
            "historical_background": "Between 1995 and 2000, NASDAQ skyrocketed from 1,000 to 5,048. Super Bowl 2000 featured 14 dot-com ads costing $2.2M each. Within 24 months, 12 of those companies went bankrupt.",
            "key_concepts": [
                {
                    "term": "Price-to-Sales (P/S) Ratio",
                    "definition": "A valuation metric comparing a company's stock price to its revenues. High ratios during dot-com indicated extreme speculation."
                },
                {
                    "term": "Burn Rate",
                    "definition": "The rate at which a new company is spending its venture capital before generating positive cash flow."
                },
                {
                    "term": "Irrational Exuberance",
                    "definition": "A phrase coined by Fed Chairman Alan Greenspan describing unsustainable investor enthusiasm that drives prices far above fundamental value."
                }
            ],
            "key_indicators": {
                "NASDAQ Peak": "5,048.62",
                "Avg Tech P/E Ratio": "200x+",
                "NASDAQ Total Drawdown": "-78.4%"
            }
        },
        "simulation": {
            "initial_index": 5048.62,
            "starting_cash": 100000.0,
            "ticks": [
                {
                    "step": 1,
                    "date": "March 10, 2000 (NASDAQ Peak)",
                    "headline": "HIGH TECH MADNESS: NASDAQ breaches 5,000! Analysts claim 'earnings don't matter in the internet age'!",
                    "index_val": 5048.62,
                    "pct_change": 0.0,
                    "market_sentiment": "Euphoric Speculation",
                    "prof_algo_comment": "Pets.com and Webvan have massive burn rates and no profits, yet their market caps are bigger than traditional blue chips. How do you position?",
                    "options": [
                        {
                            "id": "short_unprofitable_tech",
                            "label": "Short Unprofitable Dot-Coms",
                            "description": "Initiate short positions on high-burn rate tech stocks with zero cash flow.",
                            "risk": 55,
                            "pnl_impact": 0.50,
                            "memory_tag": "Fundamental Valuation Short Bear",
                            "prof_algo_reaction": "Legendary move! Shorting zero-earning tech stocks at the top yielded massive gains as NASDAQ crashed 78%."
                        },
                        {
                            "id": "fomo_buy_tech",
                            "label": "All-In Tech Stocks (FOMO)",
                            "description": "Buy Cisco, Intel, and dot-com IPOs expecting NASDAQ to hit 10,000.",
                            "risk": 95,
                            "pnl_impact": -0.50,
                            "memory_tag": "Euphoric Bubble Victim",
                            "prof_algo_reaction": "Ouch! Buying tech at 200x earnings right at the 2000 peak wiped out 75%+ of capital."
                        },
                        {
                            "id": "value_rotation",
                            "label": "Rotate to Boring Value & Cash",
                            "description": "Buy traditional dividend payers like Berkshire Hathaway, consumer staples, and utilities.",
                            "risk": 25,
                            "pnl_impact": 0.25,
                            "memory_tag": "Disciplined Value Rotator",
                            "prof_algo_reaction": "Value stocks actually OUTPERFORMED during the dot-com crash while tech collapsed!"
                        }
                    ]
                }
            ]
        }
    },
    {
        "id": "2008-gfc",
        "title": "The 2008 Great Financial Crisis",
        "era": "September 2008",
        "difficulty": "Advanced",
        "read_time": "8 min",
        "image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
        "tags": ["Subprime Mortgages", "Lehman Collapse", "Credit Contagion", "Systemic Risk"],
        "reward_xp": 850,
        "badge_reward": "Systemic Risk Master",
        "summary": "Subprime mortgage defaults trigger the fall of Lehman Brothers, freezing interbank lending markets worldwide and sparking the worst crisis since 1929.",
        "study": {
            "prof_algo_intro": "September 15, 2008: Lehman Brothers files for bankruptcy. This wasn't just a stock market dip — the entire global financial plumbing froze! Banks refused to lend to other banks because nobody knew who was holding toxic Mortgage-Backed Securities (MBS). Credit markets seized up, insurance giant AIG needed a $85B bailout, and the S&P 500 halved. Let's see if you can manage systemic credit contagion!",
            "historical_background": "Lax lending standards created millions of subprime mortgage loans bundled into complex financial derivatives (CDOs). When housing prices fell, default rates exploded. S&P 500 dropped 57% from peak to trough.",
            "key_concepts": [
                {
                    "term": "Collateralized Debt Obligation (CDO)",
                    "definition": "A complex structured asset-backed security that pools together individual cash-flowing assets like mortgages."
                },
                {
                    "term": "Credit Default Swap (CDS)",
                    "definition": "A financial derivative allowing an investor to swap or offset their credit risk with another investor."
                },
                {
                    "term": "Interbank Liquidity Freeze",
                    "definition": "When banks lose trust in each other's solvency and stop lending short-term cash overnight."
                }
            ],
            "key_indicators": {
                "Lehman Brothers Debt": "$613 Billion",
                "TED Spread (Credit Stress)": "300+ bps",
                "S&P 500 Drawdown": "-56.8%"
            }
        },
        "simulation": {
            "initial_index": 1251.70,
            "starting_cash": 100000.0,
            "ticks": [
                {
                    "step": 1,
                    "date": "Sept 15, 2008",
                    "headline": "GLOBAL CRISIS: Lehman Brothers files Bankruptcy! Merrill Lynch sold to BofA; Credit markets freeze!",
                    "index_val": 1192.70,
                    "pct_change": -4.7,
                    "market_sentiment": "Systemic Credit Contagion",
                    "prof_algo_comment": "Lehman has failed and AIG is on the brink. Money market funds are breaking the dollar. Financial contagion is spreading fast!",
                    "options": [
                        {
                            "id": "short_financials",
                            "label": "Short Investment Banks & Real Estate",
                            "description": "Short vulnerable financial institutions and real estate investment trusts.",
                            "risk": 60,
                            "pnl_impact": 0.45,
                            "memory_tag": "Systemic Contagion Short Trader",
                            "prof_algo_reaction": "Incredible macro analysis! Financials lost over 80% of their value during the peak crisis."
                        },
                        {
                            "id": "buy_treasuries",
                            "label": "Flight to Quality (US Treasuries & Cash)",
                            "description": "Move 100% into short-term US Treasury bills and safe cash.",
                            "risk": 10,
                            "pnl_impact": 0.10,
                            "memory_tag": "Systemic Risk Averse Shield",
                            "prof_algo_reaction": "Capital preservation at its finest. Treasuries rallied hard during the liquidity crunch."
                        },
                        {
                            "id": "buy_banks_early",
                            "label": "Buy Banking Stocks (Thinking they are cheap)",
                            "description": "Buy Lehman and Citigroup believing government won't let them fall further.",
                            "risk": 95,
                            "pnl_impact": -0.60,
                            "memory_tag": "Subprime Contagion Catching Falling Knife",
                            "prof_algo_reaction": "Catastrophic error! Lehman went to $0 and Citigroup fell another 90% before stabilizing."
                        }
                    ]
                },
                {
                    "step": 2,
                    "date": "March 9, 2009 (Generational Bottom)",
                    "headline": "GENERATIONAL BOTTOM: S&P hits '666'! Fed launches unprecedented Quantitative Easing (QE1) & TARP!",
                    "index_val": 676.53,
                    "pct_change": -43.2,
                    "market_sentiment": "Maximum Pessimism",
                    "prof_algo_comment": "Everyone thinks the monetary system is ending. The Fed is buying assets with Quantitative Easing (QE1). Is this the ultimate buy point?",
                    "options": [
                        {
                            "id": "generational_buy",
                            "label": "Deploy Cash into Broad Market S&P Index",
                            "description": "Aggressively deploy cash at historical lows as central banks inject trillions.",
                            "risk": 50,
                            "pnl_impact": 0.70,
                            "memory_tag": "Generational Bull Bottom Buyer",
                            "prof_algo_reaction": "LEGENDARY TRADE! Buying the March 2009 bottom kicked off a 10-year bull market that grew over 400%!"
                        },
                        {
                            "id": "stay_scared",
                            "label": "Stay in Cash (Scared of Depression)",
                            "description": "Remain in cash believing the market will drop another 50%.",
                            "risk": 20,
                            "pnl_impact": -0.05,
                            "memory_tag": "Bottom Hesitation Cash Trap",
                            "prof_algo_reaction": "Fear cost you the greatest buying opportunity of a generation."
                        }
                    ]
                }
            ]
        }
    },
    {
        "id": "2020-covid",
        "title": "The 2020 COVID Flash Crash & Recovery",
        "era": "Feb - March 2020",
        "difficulty": "Beginner",
        "read_time": "5 min",
        "image": "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?q=80&w=1200&auto=format&fit=crop",
        "tags": ["Pandemic Lockdown", "Flash Crash", "Unlimited QE", "Retail Trading Boom"],
        "reward_xp": 500,
        "badge_reward": "COVID Crash Resilient",
        "summary": "A global pandemic halts world travel and triggers the fastest 30% drop in stock history, followed by an unprecedented central bank stimulus rally.",
        "study": {
            "prof_algo_intro": "March 2020! Markets plummeted 34% in just 22 trading days — the fastest collapse from an all-time high in history. Economies shut down overnight. But then the Fed introduced 'Unlimited Quantitative Easing' and stimulus checks rained down. What followed was the fastest recovery in stock history! Let's see if you can trade both sides of a V-bottom!",
            "historical_background": "S&P 500 fell from 3,386 on Feb 19 to 2,237 on March 23, 2020 (-34%). Oil futures briefly traded below $0 (-$37/barrel) due to storage exhaustion.",
            "key_concepts": [
                {
                    "term": "V-Shaped Recovery",
                    "definition": "A sharp economic decline followed immediately by a rapid and strong recovery back to previous highs."
                },
                {
                    "term": "Unlimited QE",
                    "definition": "Unrestricted central bank purchasing of government bonds and corporate debt to inject liquidity into credit markets."
                },
                {
                    "term": "Stay-at-Home Economy",
                    "definition": "Sector rotation favoring digital services, e-commerce, and remote work tech over travel and hospitality."
                }
            ],
            "key_indicators": {
                "Speed of 30% Drop": "22 Trading Days",
                "Fed Balance Sheet Expansion": "+$3 Trillion",
                "WTI Crude Futures Low": "-$37.63/barrel"
            }
        },
        "simulation": {
            "initial_index": 3386.15,
            "starting_cash": 100000.0,
            "ticks": [
                {
                    "step": 1,
                    "date": "March 16, 2020",
                    "headline": "PANIC LOCKDOWN: S&P falls 12% in single session! VIX surges to 82.69 as global travel halts!",
                    "index_val": 2386.13,
                    "pct_change": -29.5,
                    "market_sentiment": "Unprecedented Lockdown Panic",
                    "prof_algo_comment": "Circuit breakers triggered 4 times in two weeks. Airlines and cruise lines are collapsing, but stay-at-home tech is holding relative strength.",
                    "options": [
                        {
                            "id": "rotate_stay_at_home",
                            "label": "Rotate into Stay-At-Home Tech (Zoom, Amazon)",
                            "description": "Buy e-commerce, cloud computing, and streaming platforms benefiting from lockdowns.",
                            "risk": 40,
                            "pnl_impact": 0.40,
                            "memory_tag": "Stay-At-Home Sector Strategist",
                            "prof_algo_reaction": "Brilliant sector allocation! Tech companies saw multi-year adoption compressed into months."
                        },
                        {
                            "id": "buy_airlines_early",
                            "label": "Buy Beaten-Down Airlines & Cruises",
                            "description": "Catch the dip on airlines thinking travel will resume immediately.",
                            "risk": 85,
                            "pnl_impact": -0.30,
                            "memory_tag": "Reopening Premature Trader",
                            "prof_algo_reaction": "Airlines stayed grounded for over a year and issued massive dilution."
                        }
                    ]
                },
                {
                    "step": 2,
                    "date": "April 2020",
                    "headline": "STIMULUS RALLY: Fed prints $3 Trillion; Tech stocks record historic monthly gains!",
                    "index_val": 2912.43,
                    "pct_change": 22.0,
                    "market_sentiment": "Liquidity Fueled Bull",
                    "prof_algo_comment": "Don't fight the Fed! Central bank liquidity is pushing tech stocks to new record highs despite economic lockdowns.",
                    "options": [
                        {
                            "id": "ride_stimulus",
                            "label": "Ride the Liquidity Wave (Long Tech & Index)",
                            "description": "Stay fully invested as stimulus floods financial markets.",
                            "risk": 35,
                            "pnl_impact": 0.35,
                            "memory_tag": "Don't Fight the Fed Master",
                            "prof_algo_reaction": "'Don't Fight the Fed' is rule #1 of macro trading. You nailed the recovery rally!"
                        }
                    ]
                }
            ]
        }
    },
    {
        "id": "2022-inflation",
        "title": "The 2022 Inflation & Rate Hike Shock",
        "era": "2022 - 2023",
        "difficulty": "Advanced",
        "read_time": "7 min",
        "image": "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop",
        "tags": ["40-Year Inflation", "Fed Rate Hikes", "Tech De-rating", "Bond Bear Market"],
        "reward_xp": 750,
        "badge_reward": "Rate Hike Tactician",
        "summary": "US inflation surges to 9.1%, forcing the Federal Reserve to implement four consecutive 75bps rate hikes. Unprofitable tech and bonds suffer their worst losses in decades.",
        "study": {
            "prof_algo_intro": "2022 brought the end of 'Easy Money'. Inflation hit 9.1% — a 40-year high. Federal Reserve Chairman Jerome Powell embarked on the most aggressive rate hiking cycle since Paul Volcker in 1980. High-multiple growth stocks, crypto, and long-term bonds cratered together. Traditional 60/40 portfolios had their worst year in history! Let's see if you can manage rising interest rates!",
            "historical_background": "Fed raised rates from 0% to 5.25% in under 18 months. NASDAQ fell 33%, while long-term US Treasury bonds fell over 30%, disproving the belief that bonds always hedge stock drops.",
            "key_concepts": [
                {
                    "term": "Discount Rate / Net Present Value",
                    "definition": "Higher interest rates increase the discount rate applied to future earnings, reducing present values of high-growth tech stocks."
                },
                {
                    "term": "Quantitative Tightening (QT)",
                    "definition": "Central bank shrinking its balance sheet by letting bonds mature without repurchasing, reducing financial market liquidity."
                },
                {
                    "term": "Multiple Compression",
                    "definition": "When a stock's valuation ratio (P/E ratio) declines even if company earnings remain stable, caused by higher interest rates."
                }
            ],
            "key_indicators": {
                "US CPI Peak": "9.1%",
                "Fed Funds Rate Hikes": "0.25% ➔ 5.50%",
                "NASDAQ Drawdown": "-33.1%"
            }
        },
        "simulation": {
            "initial_index": 4766.18,
            "starting_cash": 100000.0,
            "ticks": [
                {
                    "step": 1,
                    "date": "June 2022",
                    "headline": "RATE HIKES: US Inflation hits 9.1%! Fed enacts jumbo +75bps rate hike; Tech stocks plunge!",
                    "index_val": 3674.84,
                    "pct_change": -22.8,
                    "market_sentiment": "Aggressive Tightening Fear",
                    "prof_algo_comment": "Jerome Powell warned of 'pain to households and businesses'. High valuation tech stocks are undergoing severe multiple compression. Where do you take shelter?",
                    "options": [
                        {
                            "id": "short_high_pe_tech",
                            "label": "Short High-Multiple Tech & Crypto",
                            "description": "Short speculative tech trading at 50x sales and non-yielding crypto assets.",
                            "risk": 50,
                            "pnl_impact": 0.40,
                            "memory_tag": "Rate Hike Short Specialist",
                            "prof_algo_reaction": "Superb execution! High P/E tech got decimated as interest rates rose to 5%."
                        },
                        {
                            "id": "buy_short_duration",
                            "label": "Move Cash to 5% Yield Money Market T-Bills",
                            "description": "Lock in guaranteed risk-free 5% annual yield on short-term US Treasury bills.",
                            "risk": 5,
                            "pnl_impact": 0.15,
                            "memory_tag": "Risk-Free Yield Optimizer",
                            "prof_algo_reaction": "Smart capital allocation! Earning 5% risk-free cash while stocks drop 25% is an unbeatable defensive play."
                        },
                        {
                            "id": "buy_unprofitable_dips",
                            "label": "Buy Dips on Unprofitable Growth Stocks",
                            "description": "Buy speculative tech assuming the Fed will pivot back to 0% rates.",
                            "risk": 90,
                            "pnl_impact": -0.35,
                            "memory_tag": "Premature Pivot Speculator",
                            "prof_algo_reaction": "The Fed did not pivot! Fighting a hawk Fed led to severe drawdowns."
                        }
                    ]
                }
            ]
        }
    }
]


def get_all_calamities():
    return CALAMITIES


def get_calamity_by_id(calamity_id):
    for c in CALAMITIES:
        if c["id"] == calamity_id:
            return c
    return None
