"""Market Math module helpers — quiz generation and grading from live portfolio data."""

from .models import Asset, Holding, MathModule, UserMathModuleProgress

LARGE_CAP_MIN = 10_000_000_000
MID_CAP_MIN = 2_000_000_000

ASSET_FUNDAMENTALS = {
    'AAPL': {'eps': 6.42, 'shares_outstanding': 15_500_000_000},
    'MSFT': {'eps': 11.80, 'shares_outstanding': 7_400_000_000},
    'GOOGL': {'eps': 6.52, 'shares_outstanding': 12_500_000_000},
    'AMZN': {'eps': 4.25, 'shares_outstanding': 10_500_000_000},
    'NVDA': {'eps': 2.50, 'shares_outstanding': 24_500_000_000},
    'TSLA': {'eps': 3.65, 'shares_outstanding': 3_200_000_000},
    'META': {'eps': 14.20, 'shares_outstanding': 2_550_000_000},
    'NFLX': {'eps': 12.30, 'shares_outstanding': 430_000_000},
    'JPM': {'eps': 16.50, 'shares_outstanding': 2_900_000_000},
    'V': {'eps': 9.80, 'shares_outstanding': 2_000_000_000},
    'DIS': {'eps': 2.10, 'shares_outstanding': 1_830_000_000},
    'NKE': {'eps': 3.50, 'shares_outstanding': 50_000_000},
    'SBUX': {'eps': 3.20, 'shares_outstanding': 10_000_000},
    'KO': {'eps': 2.48, 'shares_outstanding': 4_300_000_000},
    'PEP': {'eps': 6.75, 'shares_outstanding': 1_370_000_000},
    'WMT': {'eps': 6.90, 'shares_outstanding': 8_100_000_000},
    'AMD': {'eps': 2.65, 'shares_outstanding': 1_620_000_000},
    'COST': {'eps': 16.50, 'shares_outstanding': 443_000_000},
    'LMT': {'eps': 27.50, 'shares_outstanding': 240_000_000},
    'CAT': {'eps': 16.80, 'shares_outstanding': 500_000_000},
}


def asset_foundation_defaults(data):
    """Merge curated asset metadata with placeholder fundamentals."""
    fund = ASSET_FUNDAMENTALS.get(data['symbol'], {})
    return {
        'symbol': data['symbol'],
        'name': data['name'],
        'exchange': data['exchange'],
        'category': data['category'],
        'sector': data['sector'],
        'eps': fund.get('eps', 0.0),
        'shares_outstanding': fund.get('shares_outstanding', 0.0),
    }


def pe_ratio(price, eps):
    if eps <= 0:
        return None
    return round(price / eps, 2)


def pct_gain(avg_price, current_price):
    if avg_price <= 0:
        return 0.0
    return round(((current_price - avg_price) / avg_price) * 100, 2)


def market_cap_tier(market_cap):
    if market_cap >= LARGE_CAP_MIN:
        return 'large'
    if market_cap >= MID_CAP_MIN:
        return 'mid'
    return 'small'


def tier_label(tier):
    return {'large': 'Large cap', 'mid': 'Mid cap', 'small': 'Small cap'}[tier]


def serialize_asset_for_lab(asset):
    price = asset.price or 150.0
    fund = ASSET_FUNDAMENTALS.get(asset.symbol, {})
    eps = asset.eps if asset.eps > 0 else fund.get('eps', 5.0)
    shares = asset.shares_outstanding if asset.shares_outstanding > 0 else fund.get('shares_outstanding', 5_000_000_000)
    market_cap = price * shares
    pe = pe_ratio(price, eps) or 20.0
    return {
        'id': asset.id,
        'symbol': asset.symbol,
        'name': asset.name,
        'price': round(price, 2),
        'eps': round(eps, 2),
        'shares_outstanding': shares,
        'pe_ratio': pe,
        'market_cap': round(market_cap, 0),
        'market_cap_tier': market_cap_tier(market_cap),
    }


def get_compare_assets():
    assets = list(Asset.objects.filter(category='Stocks').order_by('symbol'))

    # If no stock assets found in DB, seed foundation assets
    if not assets:
        for sym, fund in ASSET_FUNDAMENTALS.items():
            Asset.objects.get_or_create(
                id=sym.lower(),
                defaults={
                    'symbol': sym,
                    'name': f"{sym} Inc.",
                    'exchange': 'NASDAQ',
                    'category': 'Stocks',
                    'sector': 'Technology',
                    'eps': fund['eps'],
                    'shares_outstanding': fund['shares_outstanding'],
                }
            )
        assets = list(Asset.objects.filter(category='Stocks').order_by('symbol'))

    results = [serialize_asset_for_lab(a) for a in assets]

    # Guarantee curated top assets are in the list if DB has missing stocks
    for sym, fund in ASSET_FUNDAMENTALS.items():
        if not any(r['symbol'] == sym for r in results):
            p = 180.0
            mc = p * fund['shares_outstanding']
            results.append({
                'id': sym.lower(),
                'symbol': sym,
                'name': f"{sym} Inc.",
                'price': p,
                'eps': fund['eps'],
                'shares_outstanding': fund['shares_outstanding'],
                'pe_ratio': round(p / fund['eps'], 2),
                'market_cap': mc,
                'market_cap_tier': market_cap_tier(mc),
            })

    results.sort(key=lambda x: x['symbol'])
    return results


def get_holdings_gains(user):
    rows = []
    if not user or not getattr(user, 'is_authenticated', False):
        return rows
    for holding in Holding.objects.filter(user=user, shares__gt=0).select_related('asset'):
        current = holding.asset.price
        gain = pct_gain(holding.avg_price, current)
        rows.append({
            'symbol': holding.asset.symbol,
            'name': holding.asset.name,
            'shares': holding.shares,
            'avg_price': round(holding.avg_price, 2),
            'current_price': round(current, 2),
            'pct_gain': gain,
            'steps': [
                f"Current price − Avg buy price = {round(current, 2)} − {round(holding.avg_price, 2)} = {round(current - holding.avg_price, 2)}",
                f"Gain ÷ Avg buy price = {round(current - holding.avg_price, 2)} ÷ {round(holding.avg_price, 2)} = {round((current - holding.avg_price) / holding.avg_price, 4)}",
                f"× 100 = {gain}%",
            ],
        })
    return rows


def get_fallback_gain_example():
    return {
        'symbol': 'AAPL',
        'name': 'Apple Inc.',
        'shares': 10,
        'avg_price': 150.0,
        'current_price': 180.0,
        'pct_gain': 20.0,
        'is_fallback': True,
        'steps': [
            'Current price − Avg buy price = 180.00 − 150.00 = 30.00',
            'Gain ÷ Avg buy price = 30.00 ÷ 150.00 = 0.2000',
            '× 100 = 20.0%',
        ],
    }


def get_market_cap_lab_assets():
    symbols = ['AAPL', 'NKE', 'SBUX']
    assets = Asset.objects.filter(symbol__in=symbols, category='Stocks')
    by_symbol = {a.symbol: a for a in assets}
    result = []
    for symbol in symbols:
        asset = by_symbol.get(symbol)
        if not asset:
            continue
        data = serialize_asset_for_lab(asset)
        data['tier_label'] = tier_label(data['market_cap_tier']) if data['market_cap_tier'] else None
        result.append(data)
    return result


def build_ratio_lab_interactive(user):
    compare_assets = get_compare_assets()
    default_ids = []
    for sym in ['AAPL', 'MSFT']:
        match = next((a for a in compare_assets if a['symbol'] == sym), None)
        if match:
            default_ids.append(match['id'])

    holdings = get_holdings_gains(user)
    fallback = get_fallback_gain_example()

    return {
        'compare_assets': compare_assets,
        'default_compare_ids': default_ids[:2],
        'holdings_gains': holdings,
        'primary_gain': holdings[0] if holdings else fallback,
        'market_cap_assets': get_market_cap_lab_assets(),
        'cap_thresholds': {
            'large_min': LARGE_CAP_MIN,
            'mid_min': MID_CAP_MIN,
            'labels': {
                'large': 'Large cap (≥ $10B)',
                'mid': 'Mid cap ($2B – $10B)',
                'small': 'Small cap (< $2B)',
            },
        },
        'formulas': {
            'pe': 'P/E = Price ÷ EPS',
            'pct_gain': '% Gain = (Current Price − Avg Buy Price) ÷ Avg Buy Price × 100',
            'market_cap': 'Market Cap = Price × Shares Outstanding',
        },
    }


def _format_pe_option(value):
    return f'{value:.1f}'


def _build_pe_distractors(correct):
    offsets = [-5.0, -2.5, 2.5, 5.0, 8.0]
    options = {_format_pe_option(correct)}
    for offset in offsets:
        candidate = max(0.1, correct + offset)
        options.add(_format_pe_option(candidate))
    while len(options) < 4:
        options.add(_format_pe_option(max(0.1, correct + len(options))))
    sorted_opts = sorted(options, key=lambda x: float(x))
    if _format_pe_option(correct) not in sorted_opts[:4]:
        sorted_opts = sorted_opts[:3] + [_format_pe_option(correct)]
    else:
        sorted_opts = sorted_opts[:4]
    return sorted(sorted_opts, key=lambda x: float(x))


def build_ratio_lab_quiz(user):
    compare_assets = get_compare_assets()
    pe_asset = next((a for a in compare_assets if a['symbol'] == 'AAPL'), compare_assets[0] if compare_assets else None)

    holdings = get_holdings_gains(user)
    gain_row = holdings[0] if holdings else get_fallback_gain_example()

    cap_assets = get_market_cap_lab_assets()
    cap_asset = next((a for a in cap_assets if a['symbol'] == 'NKE'), cap_assets[0] if cap_assets else None)

    questions = []

    # Q1 — Live P/E calculation
    if pe_asset and pe_asset['pe_ratio']:
        correct_pe = pe_asset['pe_ratio']
        questions.append({
            'id': 'pe_compute',
            'type': 'multiple_choice',
            'question': (
                f"{pe_asset['symbol']} is trading at ${pe_asset['price']:.2f} with EPS of "
                f"${pe_asset['eps']:.2f}. What is its P/E ratio?"
            ),
            'options': _build_pe_distractors(correct_pe),
            'explanation': f"P/E = Price ÷ EPS = {pe_asset['price']:.2f} ÷ {pe_asset['eps']:.2f} = {correct_pe:.1f}x",
            '_answer': _format_pe_option(correct_pe),
        })

    # Q2 — P/E concept: earnings growth
    questions.append({
        'id': 'pe_earnings_grow',
        'type': 'multiple_choice',
        'question': 'If a company\'s earnings grow 50% while its stock price stays exactly the same, the P/E ratio will:',
        'options': ['Increase by 50%', 'Decrease', 'Stay the same', 'Double'],
        'explanation': 'P/E = Price ÷ EPS. If EPS rises and price is unchanged, the denominator grows so the ratio falls.',
        '_answer': 'Decrease',
    })

    # Q3 — Live % gain
    gain_options = [
        f'{gain_row["pct_gain"]:.1f}%',
        f'{gain_row["pct_gain"] + 5:.1f}%',
        f'{max(0, gain_row["pct_gain"] - 5):.1f}%',
        f'{gain_row["pct_gain"] + 10:.1f}%',
    ]
    gain_options = sorted(set(gain_options), key=lambda x: float(x.replace('%', '')))
    while len(gain_options) < 4:
        gain_options.append(f'{gain_row["pct_gain"] + len(gain_options) * 3:.1f}%')

    prefix = 'Your' if not gain_row.get('is_fallback') else 'Example:'
    questions.append({
        'id': 'pct_gain',
        'type': 'multiple_choice',
        'question': (
            f"{prefix} average buy price on {gain_row['symbol']} was ${gain_row['avg_price']:.2f} "
            f"and the current price is ${gain_row['current_price']:.2f}. What is your % gain?"
        ),
        'options': gain_options[:4],
        'explanation': ' '.join(gain_row.get('steps', [])),
        '_answer': f'{gain_row["pct_gain"]:.1f}%',
    })

    # Q4 — Market cap classification
    if cap_asset and cap_asset['market_cap_tier']:
        questions.append({
            'id': 'market_cap',
            'type': 'multiple_choice',
            'question': (
                f"{cap_asset['symbol']} has a market cap of roughly "
                f"${cap_asset['market_cap']:,.0f}. How would you classify it?"
            ),
            'options': ['Large cap', 'Mid cap', 'Small cap', 'Micro cap'],
            'explanation': (
                f"Large cap ≥ $10B, mid cap $2B–$10B, small cap < $2B. "
                f"{cap_asset['symbol']} at ${cap_asset['market_cap']:,.0f} is {cap_asset['tier_label']}."
            ),
            '_answer': cap_asset['tier_label'],
        })

    # Q5 — P/E formula definition
    questions.append({
        'id': 'pe_formula_def',
        'type': 'multiple_choice',
        'question': 'What does the formula P/E = Price ÷ EPS tell an investor?',
        'options': [
            'How much investors pay for every $1 of annual company profit',
            'The total revenue a company generates each year',
            'The percentage of profits paid out as dividends',
            'How many employees the company has per dollar of sales',
        ],
        'explanation': 'P/E (Price-to-Earnings) measures the price you pay per $1 of earnings. A P/E of 20 means investors pay $20 for every $1 of annual profit.',
        '_answer': 'How much investors pay for every $1 of annual company profit',
    })

    # Q6 — High vs. low P/E interpretation
    questions.append({
        'id': 'pe_high_vs_low',
        'type': 'multiple_choice',
        'question': 'Company A has a P/E of 8x. Company B has a P/E of 35x. All else equal, which statement is most accurate?',
        'options': [
            'Company A is cheaper relative to its earnings',
            'Company B is cheaper relative to its earnings',
            'Both companies are valued identically',
            'A higher P/E always means a better investment',
        ],
        'explanation': 'A lower P/E means you pay less per dollar of earnings. Company A at 8x is cheaper than Company B at 35x on an earnings basis.',
        '_answer': 'Company A is cheaper relative to its earnings',
    })

    # Q7 — Market Cap formula
    questions.append({
        'id': 'market_cap_formula',
        'type': 'multiple_choice',
        'question': 'A company\'s stock is priced at $200 per share and it has 500 million shares outstanding. What is its market cap?',
        'options': ['$50 Billion', '$100 Billion', '$200 Billion', '$400 Billion'],
        'explanation': 'Market Cap = Price × Shares Outstanding = $200 × 500,000,000 = $100,000,000,000 = $100 Billion.',
        '_answer': '$100 Billion',
    })

    # Q8 — % gain concept
    questions.append({
        'id': 'pct_gain_concept',
        'type': 'multiple_choice',
        'question': 'You bought a stock at $80 and it is now worth $100. What is your percentage gain?',
        'options': ['20%', '25%', '80%', '100%'],
        'explanation': '% Gain = (Current − Avg Buy) ÷ Avg Buy × 100 = (100 − 80) ÷ 80 × 100 = 20 ÷ 80 × 100 = 25%.',
        '_answer': '25%',
    })

    # Q9 — Large cap threshold
    questions.append({
        'id': 'large_cap_threshold',
        'type': 'multiple_choice',
        'question': 'What minimum market capitalisation is required for a company to be classified as "Large Cap"?',
        'options': ['$500 Million', '$2 Billion', '$10 Billion', '$50 Billion'],
        'explanation': 'Large Cap is generally defined as a market cap of $10 billion or more. Mid cap is $2B–$10B and small cap is below $2B.',
        '_answer': '$10 Billion',
    })

    # Q10 — EPS impact on price direction
    questions.append({
        'id': 'eps_price_direction',
        'type': 'multiple_choice',
        'question': 'If a company reports earnings (EPS) that are much lower than expected, what typically happens to its stock price?',
        'options': [
            'Stock price tends to fall because investors revise their valuation downward',
            'Stock price always goes up because more shares become available',
            'Stock price is unaffected by earnings reports',
            'Stock price doubles due to volatility',
        ],
        'explanation': 'Earnings disappoint → investors revise P/E targets lower → stock price usually falls. Earnings are the most important driver of stock valuation.',
        '_answer': 'Stock price tends to fall because investors revise their valuation downward',
    })

    return questions


def quiz_for_client(questions):
    return [
        {k: v for k, v in q.items() if not k.startswith('_')}
        for q in questions
    ]


def grade_ratio_lab_quiz(user, submitted_answers):
    questions = build_ratio_lab_quiz(user)
    score = 0
    results = []
    for q in questions:
        qid = q['id']
        expected = q['_answer']
        given = submitted_answers.get(qid, '')
        correct = str(given).strip() == str(expected).strip()
        if correct:
            score += 1
        results.append({
            'id': qid,
            'correct': correct,
            'expected': expected,
            'explanation': q['explanation'],
        })
    total = len(questions)
    passed = total > 0 and (score / total) >= 0.8
    return score, total, passed, results


def award_badge_track_bonus(user, badge_track):
    if not badge_track:
        return 0
    track_modules = MathModule.objects.filter(badge_track=badge_track)
    if not track_modules.exists():
        return 0
    completed = UserMathModuleProgress.objects.filter(
        user=user,
        module__in=track_modules,
        status='complete',
    ).count()
    if completed == track_modules.count():
        return 50
    return 0


# =====================================================================
# MODULE 2: Growth & Compounding Lab
# =====================================================================

def build_growth_lab_interactive(user):
    snapshots = []
    if user and getattr(user, 'is_authenticated', False):
        from .models import PortfolioSnapshot, UserProfile
        profile = UserProfile.objects.filter(user=user).first()
        raw_snaps = PortfolioSnapshot.objects.filter(user=user).order_by('recorded_at')
        if raw_snaps.exists():
            snapshots = [{'label': s.recorded_at.strftime('%b %d'), 'value': round(s.value, 2)} for s in raw_snaps]
        elif profile:
            snapshots = [{'label': 'Start', 'value': 100000.0}, {'label': 'Now', 'value': round(profile.portfolio_value, 2)}]

    if not snapshots:
        snapshots = [{'label': 'Start', 'value': 100000.0}, {'label': 'Now', 'value': 105000.0}]

    start_val = snapshots[0]['value']
    current_val = snapshots[-1]['value']
    raw_return = round(((current_val - start_val) / start_val) * 100, 2) if start_val > 0 else 0.0

    return {
        'initial_principal': 10000,
        'default_rate': 8.0,
        'default_years': 10,
        'default_monthly': 200,
        'user_portfolio_return': raw_return,
        'user_portfolio_start': start_val,
        'user_portfolio_current': current_val,
        'rule_of_72_examples': [
            {'rate': 6.0, 'years_to_double': 12.0},
            {'rate': 8.0, 'years_to_double': 9.0},
            {'rate': 10.0, 'years_to_double': 7.2},
            {'rate': 12.0, 'years_to_double': 6.0},
        ],
        'formulas': {
            'compound_interest': 'A = P × (1 + r/n)^(n×t)',
            'rule_of_72': 'Years to Double ≈ 72 ÷ Annual Interest Rate (%)',
            'cagr': 'CAGR = (Ending Value ÷ Beginning Value)^(1 ÷ Years) − 1',
        },
    }


def build_growth_lab_quiz(user):
    return [
        # Q1
        {
            'id': 'rule_72_calc',
            'type': 'multiple_choice',
            'question': 'If an investment earns a steady 8% annual return, approximately how many years will it take to double your money using the Rule of 72?',
            'options': ['6 years', '9 years', '12 years', '15 years'],
            'explanation': 'Rule of 72: Years to Double ≈ 72 ÷ Rate = 72 ÷ 8 = 9 years.',
            '_answer': '9 years',
        },
        # Q2
        {
            'id': 'compound_concept',
            'type': 'multiple_choice',
            'question': 'How does compound interest differ fundamentally from simple interest?',
            'options': [
                'Compound interest only applies to real estate',
                'Interest is earned on both the initial principal and previously accumulated interest',
                'Simple interest pays a higher rate over long time horizons',
                'Compound interest subtracts inflation every year',
            ],
            'explanation': 'Compound interest generates "interest on interest", creating exponential growth over time — that is why it grows so much faster than simple interest.',
            '_answer': 'Interest is earned on both the initial principal and previously accumulated interest',
        },
        # Q3
        {
            'id': 'cagr_calc',
            'type': 'multiple_choice',
            'question': 'A portfolio grows from $100,000 to $144,000 over 2 years. What is its Compound Annual Growth Rate (CAGR)?',
            'options': ['15.0%', '20.0%', '22.0%', '44.0%'],
            'explanation': 'CAGR = (Ending ÷ Beginning)^(1/Years) − 1 = (144,000 ÷ 100,000)^(1/2) − 1 = (1.44)^0.5 − 1 = 1.20 − 1 = 20.0%.',
            '_answer': '20.0%',
        },
        # Q4
        {
            'id': 'rule_72_rate',
            'type': 'multiple_choice',
            'question': 'If you want your money to double in 6 years, what annual interest rate must your investments generate?',
            'options': ['6%', '8%', '10%', '12%'],
            'explanation': 'Rule of 72: Rate ≈ 72 ÷ Years = 72 ÷ 6 = 12%. So you need 12% annual return to double in 6 years.',
            '_answer': '12%',
        },
        # Q5
        {
            'id': 'compound_frequency',
            'type': 'multiple_choice',
            'question': 'If two investments both pay 10% interest per year but one compounds monthly and the other annually, which will be worth more after 10 years?',
            'options': [
                'The annually compounded investment',
                'The monthly compounded investment',
                'They will be exactly equal',
                'It depends on the starting principal only',
            ],
            'explanation': 'More frequent compounding (monthly) means interest is added to principal sooner, so it earns interest earlier. Monthly compounding grows slightly more.',
            '_answer': 'The monthly compounded investment',
        },
        # Q6
        {
            'id': 'cagr_concept',
            'type': 'multiple_choice',
            'question': 'What does CAGR (Compound Annual Growth Rate) measure?',
            'options': [
                'The total dollars earned in a single year',
                'The smoothed annual rate at which an investment grew over multiple years',
                'The highest single-year return achieved',
                'The number of times dividends were paid',
            ],
            'explanation': 'CAGR gives a smooth, consistent annual rate of return as if the investment grew at the same rate every year — useful for comparing investments with bumpy yearly returns.',
            '_answer': 'The smoothed annual rate at which an investment grew over multiple years',
        },
        # Q7
        {
            'id': 'rule_72_spx',
            'type': 'multiple_choice',
            'question': 'The S&P 500 has historically returned approximately 10% per year. Using the Rule of 72, roughly how long does it take to double your money?',
            'options': ['5 years', '7.2 years', '10 years', '14.4 years'],
            'explanation': '72 ÷ 10% = 7.2 years. At a 10% annual return, a $10,000 investment becomes ~$20,000 in about 7.2 years.',
            '_answer': '7.2 years',
        },
        # Q8
        {
            'id': 'compound_principal',
            'type': 'multiple_choice',
            'question': 'You invest $5,000 at 6% annual interest compounded yearly. Using the formula A = P(1+r)^t, what is the value after 3 years?',
            'options': ['$5,900', '$5,955.08', '$5,800', '$6,300'],
            'explanation': 'A = 5000 × (1 + 0.06)^3 = 5000 × 1.191016 = $5,955.08. The extra $55 over simple interest is the compound effect.',
            '_answer': '$5,955.08',
        },
        # Q9
        {
            'id': 'time_vs_rate',
            'type': 'multiple_choice',
            'question': 'For long-term wealth building using compounding, which factor has the GREATEST impact on your final portfolio value?',
            'options': [
                'The exact day of the month you invest',
                'The length of time the money stays invested',
                'Changing brokers every year',
                'Withdrawing profits each quarter',
            ],
            'explanation': 'Time is the most powerful factor in compounding. The longer you leave money invested without withdrawing, the more "interest on interest" accumulates exponentially.',
            '_answer': 'The length of time the money stays invested',
        },
        # Q10
        {
            'id': 'cagr_comparison',
            'type': 'multiple_choice',
            'question': 'Investment A grew from $10,000 to $12,100 in 2 years. Investment B grew from $10,000 to $13,310 in 3 years. Which has a higher CAGR?',
            'options': [
                'Investment A (CAGR ≈ 10%)',
                'Investment B (CAGR ≈ 10%)',
                'They have the exact same CAGR',
                'Investment B because it made more total dollars',
            ],
            'explanation': 'A: (12100÷10000)^(1/2)−1 = 1.1−1 = 10%. B: (13310÷10000)^(1/3)−1 = 1.1−1 = 10%. Both have the same CAGR of 10% even though B earned more in total.',
            '_answer': 'They have the exact same CAGR',
        },
    ]


def grade_growth_lab_quiz(user, submitted_answers):
    questions = build_growth_lab_quiz(user)
    score = 0
    results = []
    for q in questions:
        qid = q['id']
        expected = q['_answer']
        given = submitted_answers.get(qid, '')
        correct = str(given).strip() == str(expected).strip()
        if correct:
            score += 1
        results.append({
            'id': qid,
            'correct': correct,
            'expected': expected,
            'explanation': q['explanation'],
        })
    total = len(questions)
    passed = total > 0 and (score / total) >= 0.8
    return score, total, passed, results


# =====================================================================
# MODULE 3: Statistics & Risk Lab
# =====================================================================

def build_risk_lab_interactive(user):
    assets_data = [
        {'symbol': 'AAPL', 'name': 'Apple Inc.', 'volatility': 18.5, 'sma20': 182.40, 'price': 185.20, 'beta': 1.05},
        {'symbol': 'NVDA', 'name': 'NVIDIA Corp.', 'volatility': 34.2, 'sma20': 118.50, 'price': 124.80, 'beta': 1.75},
        {'symbol': 'JPM', 'name': 'JPMorgan Chase', 'volatility': 14.1, 'sma20': 198.10, 'price': 202.50, 'beta': 0.85},
        {'symbol': 'KO', 'name': 'Coca-Cola Co.', 'volatility': 10.2, 'sma20': 62.10, 'price': 63.40, 'beta': 0.55},
    ]

    correlation_matrix = [
        {'pair': 'AAPL / MSFT', 'corr': 0.82, 'relationship': 'Strong Positive'},
        {'pair': 'AAPL / NVDA', 'corr': 0.68, 'relationship': 'Moderate Positive'},
        {'pair': 'AAPL / KO', 'corr': 0.25, 'relationship': 'Low Correlation'},
        {'pair': 'AAPL / XAU (Gold)', 'corr': -0.15, 'relationship': 'Slight Negative (Hedge)'},
    ]

    return {
        'assets': assets_data,
        'correlations': correlation_matrix,
        'formulas': {
            'std_dev': 'σ = √( Σ(x - μ)² ÷ N )',
            'sma_20': 'SMA_20 = (Price_1 + Price_2 + ... + Price_20) ÷ 20',
            'correlation': 'Correlation (r) ranges from -1.0 (opposite) to +1.0 (identical)',
        },
    }


def build_risk_lab_quiz(user):
    return [
        # Q1
        {
            'id': 'volatility_concept',
            'type': 'multiple_choice',
            'question': 'In financial analysis, standard deviation (σ) of daily returns is primarily used to measure:',
            'options': ['Dividend yield', 'Stock volatility and price risk', 'Total annual revenue growth', 'Book value per share'],
            'explanation': 'Standard deviation measures how spread out (dispersed) daily returns are around the average. A high σ means wider price swings — more risk.',
            '_answer': 'Stock volatility and price risk',
        },
        # Q2
        {
            'id': 'sma_signal',
            'type': 'multiple_choice',
            'question': 'When a stock\'s live price crosses above its 20-day Simple Moving Average (SMA), technical analysts usually view it as:',
            'options': ['A short-term bullish trend signal', 'An immediate bankruptcy warning', 'A signal to sell all shares immediately', 'A drop in company quarterly earnings'],
            'explanation': 'Price crossing above the SMA suggests momentum is turning positive (bullish). The SMA acts as a dynamic support/resistance level.',
            '_answer': 'A short-term bullish trend signal',
        },
        # Q3
        {
            'id': 'correlation_value',
            'type': 'multiple_choice',
            'question': 'If two stocks have a correlation coefficient of +1.0, how do their prices behave?',
            'options': [
                'They move in exact opposite directions',
                'They move in perfect unison in the same direction',
                'One stock is always twice as volatile as the other',
                'They have zero mathematical relationship',
            ],
            'explanation': 'A correlation of +1.0 = perfect positive correlation. Every time one goes up by X%, the other goes up by the same proportion.',
            '_answer': 'They move in perfect unison in the same direction',
        },
        # Q4
        {
            'id': 'diversification_benefit',
            'type': 'multiple_choice',
            'question': 'What is the main benefit of combining assets with LOW or NEGATIVE correlation in a portfolio?',
            'options': [
                'Overall portfolio volatility decreases without necessarily sacrificing expected returns',
                'Portfolio returns are guaranteed to double every year',
                'Transaction fees are reduced by 100%',
                'The portfolio becomes immune to inflation',
            ],
            'explanation': 'Low/negative correlation means when one asset falls, others don\'t necessarily follow — smoothing out the portfolio\'s overall ups and downs. This is the core benefit of diversification.',
            '_answer': 'Overall portfolio volatility decreases without necessarily sacrificing expected returns',
        },
        # Q5
        {
            'id': 'high_volatility_stock',
            'type': 'multiple_choice',
            'question': 'Stock A has an annualised volatility (σ) of 35% while Stock B has a σ of 12%. Which stock carries more price risk?',
            'options': [
                'Stock A — higher σ means larger and more frequent price swings',
                'Stock B — lower σ always means more risk',
                'They are equally risky since σ is symmetrical',
                'Neither — volatility does not indicate risk',
            ],
            'explanation': 'Higher σ = more dispersed returns = wider price swings in both directions. Stock A at 35% will see far bigger moves than Stock B at 12%.',
            '_answer': 'Stock A — higher σ means larger and more frequent price swings',
        },
        # Q6
        {
            'id': 'sma_formula',
            'type': 'multiple_choice',
            'question': 'The 20-Day Simple Moving Average (SMA) is calculated by:',
            'options': [
                'Multiplying the latest price by 20',
                'Averaging the closing prices of the last 20 trading days',
                'Dividing the 52-week high by 20',
                'Adding the current EPS to the price 20 times',
            ],
            'explanation': 'SMA_20 = (Price_Day1 + Price_Day2 + ... + Price_Day20) ÷ 20. It is a simple arithmetic average of the last 20 closing prices.',
            '_answer': 'Averaging the closing prices of the last 20 trading days',
        },
        # Q7
        {
            'id': 'negative_correlation_use',
            'type': 'multiple_choice',
            'question': 'Gold is often added to stock portfolios because it has a slightly negative correlation with equities. This is done to:',
            'options': [
                'Increase the total portfolio return significantly',
                'Act as a hedge — reducing losses when stocks fall',
                'Increase overall portfolio volatility',
                'Guarantee profits during recessions',
            ],
            'explanation': 'Negative correlation means when stocks drop, gold often rises (or stays stable). Adding gold reduces portfolio swings, acting as a hedge during market downturns.',
            '_answer': 'Act as a hedge — reducing losses when stocks fall',
        },
        # Q8
        {
            'id': 'beta_concept',
            'type': 'multiple_choice',
            'question': 'A stock has a Beta of 1.75. If the overall market rises by 10%, what would you expect this stock to do?',
            'options': [
                'Rise by approximately 17.5%',
                'Rise by exactly 10%',
                'Fall by 7.5%',
                'Stay completely flat',
            ],
            'explanation': 'Beta measures sensitivity to market movements. Beta of 1.75 means the stock moves ~1.75× the market. Market +10% → Stock ~+17.5%.',
            '_answer': 'Rise by approximately 17.5%',
        },
        # Q9
        {
            'id': 'price_below_sma',
            'type': 'multiple_choice',
            'question': 'If a stock\'s price has been trading below its 20-day SMA for several consecutive days, technical analysts typically interpret this as:',
            'options': [
                'A bearish signal suggesting downward momentum',
                'A bullish signal suggesting the stock is about to rocket',
                'No useful information — SMA is irrelevant',
                'A sign that earnings are increasing',
            ],
            'explanation': 'Price persistently below the SMA suggests downward momentum (bearish). The SMA acts as a resistance level the price cannot break through.',
            '_answer': 'A bearish signal suggesting downward momentum',
        },
        # Q10
        {
            'id': 'correlation_range',
            'type': 'multiple_choice',
            'question': 'What is the valid range for a Pearson correlation coefficient (r) between two assets?',
            'options': ['-1 to +1', '0 to +1 only', '-100 to +100', '0 to 100'],
            'explanation': 'Correlation (r) always ranges from -1 (perfectly opposite movements) to +1 (perfectly identical movements). A value of 0 means no linear relationship.',
            '_answer': '-1 to +1',
        },
    ]


def grade_risk_lab_quiz(user, submitted_answers):
    questions = build_risk_lab_quiz(user)
    score = 0
    results = []
    for q in questions:
        qid = q['id']
        expected = q['_answer']
        given = submitted_answers.get(qid, '')
        correct = str(given).strip() == str(expected).strip()
        if correct:
            score += 1
        results.append({
            'id': qid,
            'correct': correct,
            'expected': expected,
            'explanation': q['explanation'],
        })
    total = len(questions)
    passed = total > 0 and (score / total) >= 0.8
    return score, total, passed, results


# =====================================================================
# MODULE 4: Portfolio Math Lab
# =====================================================================

def build_portfolio_lab_interactive(user):
    user_holdings = []
    total_val = 0
    if user and getattr(user, 'is_authenticated', False):
        from .models import Holding
        for h in Holding.objects.filter(user=user, shares__gt=0).select_related('asset'):
            val = round(h.shares * h.asset.price, 2)
            total_val += val
            user_holdings.append({
                'symbol': h.asset.symbol,
                'name': h.asset.name,
                'value': val,
                'price': round(h.asset.price, 2),
                'shares': h.shares,
            })

    if total_val > 0:
        for item in user_holdings:
            item['weight'] = round((item['value'] / total_val) * 100, 1)
    else:
        user_holdings = [
            {'symbol': 'AAPL', 'name': 'Apple Inc.', 'value': 40000, 'weight': 40.0, 'exp_return': 12.0, 'risk': 18.0},
            {'symbol': 'MSFT', 'name': 'Microsoft Corp.', 'value': 30000, 'weight': 30.0, 'exp_return': 14.0, 'risk': 20.0},
            {'symbol': 'JPM', 'name': 'JPMorgan Chase', 'value': 20000, 'weight': 20.0, 'exp_return': 9.0, 'risk': 14.0},
            {'symbol': 'XAU', 'name': 'Gold (Safe Haven)', 'value': 10000, 'weight': 10.0, 'exp_return': 5.0, 'risk': 8.0},
        ]
        total_val = 100000

    scatter_data = [
        {'symbol': 'Gold (XAU)', 'risk': 8.0, 'return': 5.0, 'sharpe': 0.38},
        {'symbol': 'JPM Bank', 'risk': 14.0, 'return': 9.0, 'sharpe': 0.50},
        {'symbol': 'AAPL Tech', 'risk': 18.0, 'return': 12.0, 'sharpe': 0.56},
        {'symbol': 'MSFT Tech', 'risk': 20.0, 'return': 14.0, 'sharpe': 0.60},
        {'symbol': 'NVDA Chip', 'risk': 34.0, 'return': 28.0, 'sharpe': 0.76},
        {'symbol': 'Crypto (BTC)', 'risk': 55.0, 'return': 35.0, 'sharpe': 0.58},
    ]

    return {
        'holdings': user_holdings,
        'total_portfolio_value': total_val,
        'scatter_data': scatter_data,
        'formulas': {
            'weight': 'Weight (W_i) = Asset Value_i ÷ Total Portfolio Value × 100',
            'weighted_return': 'Portfolio Return (R_p) = Σ (Weight_i × Return_i)',
            'sharpe_ratio': 'Sharpe Ratio = (Portfolio Return − Risk-Free Rate) ÷ Volatility',
        },
    }


def build_portfolio_lab_quiz(user):
    return [
        # Q1
        {
            'id': 'weight_calc',
            'type': 'multiple_choice',
            'question': 'You have $40,000 invested in Tech stock and $60,000 in Bonds in a $100,000 total portfolio. What is your Tech asset weight?',
            'options': ['20%', '40%', '60%', '80%'],
            'explanation': 'Weight = Asset Value ÷ Total Portfolio Value × 100 = 40,000 ÷ 100,000 × 100 = 40%.',
            '_answer': '40%',
        },
        # Q2
        {
            'id': 'weighted_return_calc',
            'type': 'multiple_choice',
            'question': 'Your portfolio has 50% in Stock A (returning +10%/yr) and 50% in Stock B (returning +20%/yr). What is your overall portfolio return?',
            'options': ['12.5%', '15.0%', '17.5%', '30.0%'],
            'explanation': 'Portfolio Return = (0.50 × 10%) + (0.50 × 20%) = 5% + 10% = 15.0%. Each asset\'s contribution = its weight × its individual return.',
            '_answer': '15.0%',
        },
        # Q3
        {
            'id': 'sharpe_concept',
            'type': 'multiple_choice',
            'question': 'What does the Sharpe Ratio measure in portfolio management?',
            'options': [
                'Total dollar amount of dividends paid out',
                'Risk-adjusted return — excess return earned per unit of volatility',
                'The exact date a stock will reach its peak price',
                'Company debt-to-equity ratio',
            ],
            'explanation': 'Sharpe Ratio = (Return − Risk-Free Rate) ÷ Volatility. A higher Sharpe = more return for every unit of risk you take on. It lets you fairly compare investments with different risk levels.',
            '_answer': 'Risk-adjusted return — excess return earned per unit of volatility',
        },
        # Q4
        {
            'id': 'risk_return_scatter',
            'type': 'multiple_choice',
            'question': 'On a risk-return scatter plot, assets positioned toward the TOP-LEFT quadrant represent:',
            'options': [
                'Low risk and low return',
                'High risk and high return',
                'High return for low risk — the most desirable location',
                'Negative returns with maximum volatility',
            ],
            'explanation': 'Top-left = high return (Y-axis) with low risk (X-axis). This is the ideal position — you want maximum return for minimum risk. Top-right is high return but with high risk.',
            '_answer': 'High return for low risk — the most desirable location',
        },
        # Q5
        {
            'id': 'rebalancing_concept',
            'type': 'multiple_choice',
            'question': 'What is portfolio rebalancing?',
            'options': [
                'Selling your entire portfolio and starting fresh each year',
                'Adjusting asset weights back to target allocations when they drift due to market movements',
                'Adding new stocks every single day',
                'Changing brokers to reduce fees',
            ],
            'explanation': 'Over time, some assets grow faster, causing weights to drift from your target. Rebalancing means selling overweight assets and buying underweight ones to restore your target allocation.',
            '_answer': 'Adjusting asset weights back to target allocations when they drift due to market movements',
        },
        # Q6
        {
            'id': 'three_asset_return',
            'type': 'multiple_choice',
            'question': 'Portfolio: 60% in Stock A (+15%/yr), 30% in Bonds (+4%/yr), 10% in Gold (+6%/yr). What is the weighted portfolio return?',
            'options': ['8.8%', '10.8%', '11.4%', '25.0%'],
            'explanation': 'Return = (0.60×15%) + (0.30×4%) + (0.10×6%) = 9.0% + 1.2% + 0.6% = 10.8%.',
            '_answer': '10.8%',
        },
        # Q7
        {
            'id': 'concentration_risk',
            'type': 'multiple_choice',
            'question': 'You have 90% of your portfolio in a single tech stock. What risk does this create?',
            'options': [
                'Concentration risk — a poor performance in one stock can devastate the whole portfolio',
                'No risk — putting all money in one stock maximises returns',
                'Currency risk only',
                'Interest rate risk only',
            ],
            'explanation': 'Concentration risk means your portfolio\'s fate is tied to one asset. If that stock drops 50%, you lose 45% of your entire portfolio. Diversification reduces this.',
            '_answer': 'Concentration risk — a poor performance in one stock can devastate the whole portfolio',
        },
        # Q8
        {
            'id': 'sharpe_compare',
            'type': 'multiple_choice',
            'question': 'Fund A returns 12%/yr with σ=20%. Fund B returns 10%/yr with σ=8%. Risk-free rate is 3%. Which fund has a better Sharpe Ratio?',
            'options': [
                'Fund A (Sharpe ≈ 0.45)',
                'Fund B (Sharpe ≈ 0.875)',
                'They are identical',
                'Fund A because it earns more in total',
            ],
            'explanation': 'Sharpe A = (12−3)÷20 = 0.45. Sharpe B = (10−3)÷8 = 0.875. Fund B has a much better risk-adjusted return even though its raw return is lower.',
            '_answer': 'Fund B (Sharpe ≈ 0.875)',
        },
        # Q9
        {
            'id': 'weight_formula',
            'type': 'multiple_choice',
            'question': 'An investor holds 200 shares of a $50 stock in a $20,000 total portfolio. What percentage weight does that holding represent?',
            'options': ['25%', '50%', '75%', '100%'],
            'explanation': 'Holding value = 200 × $50 = $10,000. Weight = $10,000 ÷ $20,000 × 100 = 50%.',
            '_answer': '50%',
        },
        # Q10
        {
            'id': 'portfolio_return_direction',
            'type': 'multiple_choice',
            'question': 'If you shift 20% of your portfolio allocation from a low-return bond (3%/yr) to a high-return stock (15%/yr), your overall portfolio return will:',
            'options': [
                'Increase, because you moved weight toward a higher-returning asset',
                'Decrease, because stocks are more volatile',
                'Stay exactly the same',
                'Become negative',
            ],
            'explanation': 'Weighted return = Σ(weight × return). Moving 20% from 3% to 15% increases the contribution of the higher-return asset by (0.20×12%) = +2.4% in the overall portfolio return.',
            '_answer': 'Increase, because you moved weight toward a higher-returning asset',
        },
    ]


def grade_portfolio_lab_quiz(user, submitted_answers):
    questions = build_portfolio_lab_quiz(user)
    score = 0
    results = []
    for q in questions:
        qid = q['id']
        expected = q['_answer']
        given = submitted_answers.get(qid, '')
        correct = str(given).strip() == str(expected).strip()
        if correct:
            score += 1
        results.append({
            'id': qid,
            'correct': correct,
            'expected': expected,
            'explanation': q['explanation'],
        })
    total = len(questions)
    passed = total > 0 and (score / total) >= 0.8
    return score, total, passed, results

