'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Shield,
  Layers,
  Lightbulb,
  AlertTriangle,
  PieChart,
  Activity,
  Target,
  Zap,
  Building2,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Sparkles,
  Trophy,
  Star,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AIBuddyPortrait } from '@/components/marketmind/ai-buddy-portrait'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { getUserScopedKey } from '@/lib/user-storage'
import { cn } from '@/lib/utils'

/* ─────────────────────────── Module Data ─────────────────────────── */

type LessonCard = {
  title: string
  content: string
  icon: string
  highlight?: string
}

type QuizQuestion = {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

type Module = {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  color: string
  bgGradient: string
  borderColor: string
  difficulty: 'Beginner' | 'Beginner+' | 'Intermediate'
  readTime: string
  lessons: LessonCard[]
  quiz: QuizQuestion[]
  keyTakeaways: string[]
}

const MODULES: Module[] = [
  {
    id: 'what-is-stock-market',
    title: 'What is the Stock Market?',
    subtitle: 'Understanding the marketplace where stocks are bought and sold',
    icon: <Building2 className="size-5" />,
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-500/10 to-blue-500/5',
    borderColor: 'border-cyan-500/30',
    difficulty: 'Beginner',
    readTime: '5 min',
    lessons: [
      {
        title: 'The Marketplace of Ownership',
        content: 'The stock market is like a giant marketplace where people buy and sell tiny pieces of companies called "shares" or "stocks." When you buy a share of a company like Apple, you literally become a part-owner of that company! The stock market connects buyers (people who want to invest) with sellers (people who want to cash out their investments).',
        icon: '🏪',
        highlight: 'Owning a stock = owning a tiny piece of a real company',
      },
      {
        title: 'Why Do Companies Sell Stocks?',
        content: 'Companies sell stocks to raise money for growth — building new products, hiring employees, expanding to new countries. Instead of borrowing from a bank, they sell ownership stakes to the public through an IPO (Initial Public Offering). In return, investors hope the company grows and their shares become more valuable over time.',
        icon: '🚀',
        highlight: 'IPO = a company\'s first time selling shares to the public',
      },
      {
        title: 'Major Stock Exchanges',
        content: 'In the US, the two biggest stock exchanges are the NYSE (New York Stock Exchange) and NASDAQ. The NYSE is the world\'s largest stock exchange and hosts companies like Coca-Cola and Disney. NASDAQ is known for tech companies like Apple, Google, and Tesla. India has BSE (Bombay Stock Exchange) and NSE (National Stock Exchange).',
        icon: '🌍',
      },
      {
        title: 'Market Hours & Trading',
        content: 'US stock markets are open Monday to Friday, 9:30 AM to 4:00 PM Eastern Time. When the market is "open," prices change every second based on buying and selling activity. When more people want to buy a stock than sell it, the price goes UP. When more people want to sell, the price goes DOWN.',
        icon: '⏰',
        highlight: 'Supply & Demand drives stock prices up and down',
      },
    ],
    quiz: [
      {
        question: 'What does owning a stock mean?',
        options: ['You loaned money to a company', 'You own a small piece of that company', 'You work for that company', 'You owe money to that company'],
        correctIndex: 1,
        explanation: 'When you buy a stock, you become a part-owner (shareholder) of that company. You don\'t work there or owe anything — you simply own a piece!',
      },
      {
        question: 'What is an IPO?',
        options: ['A type of stock chart', 'When a company goes bankrupt', 'A company\'s first public stock sale', 'A stock trading strategy'],
        correctIndex: 2,
        explanation: 'IPO stands for Initial Public Offering — it\'s when a company sells shares to the public for the very first time.',
      },
    ],
    keyTakeaways: [
      'The stock market is a marketplace for buying and selling company ownership',
      'Companies sell stocks to raise money for growth',
      'Stock prices move based on supply and demand',
      'Major US exchanges: NYSE and NASDAQ',
    ],
  },
  {
    id: 'how-stocks-work',
    title: 'How Stocks Work',
    subtitle: 'The mechanics of buying, holding, and selling shares',
    icon: <Activity className="size-5" />,
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/10 to-green-500/5',
    borderColor: 'border-emerald-500/30',
    difficulty: 'Beginner',
    readTime: '6 min',
    lessons: [
      {
        title: 'Buying Stocks (Going Long)',
        content: 'When you buy a stock, you\'re betting that the company will grow and the stock price will increase. This is called "going long." For example, if you buy 10 shares of Apple at $150 each, you invest $1,500. If Apple\'s price rises to $180, your 10 shares are now worth $1,800 — a profit of $300 (20% return)!',
        icon: '💰',
        highlight: 'Buy low, sell high = the core idea of stock investing',
      },
      {
        title: 'Selling Stocks',
        content: 'You can sell your stocks at any time during market hours. If the price is higher than what you paid, you make a profit (capital gain). If the price is lower, you take a loss (capital loss). You only "realize" the gain or loss when you actually sell — until then, it\'s just "on paper." This is why patience matters!',
        icon: '📊',
        highlight: 'You don\'t lose money until you actually sell at a loss',
      },
      {
        title: 'Shares & Fractional Shares',
        content: 'A "share" is one unit of stock. You can buy as many or as few shares as you want. Many brokers now offer "fractional shares" — meaning you can buy $50 worth of a $3,000 stock like Amazon. This makes investing accessible even with small amounts of money.',
        icon: '🧩',
      },
      {
        title: 'Market Orders vs Limit Orders',
        content: 'A Market Order buys/sells immediately at the current price. A Limit Order sets a specific price you\'re willing to buy or sell at — it only executes if the stock reaches your price. Limit orders give you more control, while market orders guarantee execution.',
        icon: '🎯',
        highlight: 'Market Order = speed; Limit Order = price control',
      },
    ],
    quiz: [
      {
        question: 'You buy 5 shares at $100 each. The price rises to $120. What\'s your profit if you sell?',
        options: ['$20', '$100', '$120', '$600'],
        correctIndex: 1,
        explanation: 'You bought 5 shares × $100 = $500. Now worth 5 × $120 = $600. Profit = $600 - $500 = $100.',
      },
      {
        question: 'What is a "limit order"?',
        options: ['An order with a time limit', 'An order that buys at the current price', 'An order that sets a specific buy/sell price', 'An order limited to one share'],
        correctIndex: 2,
        explanation: 'A limit order lets you set the exact price at which you want to buy or sell. It only executes if the stock reaches your specified price.',
      },
    ],
    keyTakeaways: [
      'Buy stocks when you believe the company will grow',
      'You only realize profits or losses when you sell',
      'Fractional shares let you invest with small amounts',
      'Market orders execute instantly; limit orders wait for your price',
    ],
  },
  {
    id: 'understanding-stock-prices',
    title: 'Understanding Stock Prices',
    subtitle: 'What makes a stock go up or down?',
    icon: <TrendingUp className="size-5" />,
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/10 to-yellow-500/5',
    borderColor: 'border-amber-500/30',
    difficulty: 'Beginner',
    readTime: '5 min',
    lessons: [
      {
        title: 'Supply & Demand',
        content: 'Stock prices are driven by supply and demand. If many people want to buy Apple stock (high demand), the price goes up. If many people want to sell (high supply), the price goes down. Think of it like an auction — the more bidders, the higher the price goes.',
        icon: '⚖️',
        highlight: 'More buyers than sellers = price goes UP',
      },
      {
        title: 'Company Earnings',
        content: 'Every quarter (3 months), companies report their earnings — how much money they made. If a company beats expectations (earned more than analysts predicted), the stock usually goes UP. If they miss expectations, the stock usually goes DOWN. Earnings are the #1 driver of long-term stock prices.',
        icon: '📈',
        highlight: 'Strong earnings = stock price typically rises',
      },
      {
        title: 'News & Sentiment',
        content: 'News events can dramatically move stock prices. A new product launch, CEO change, legal trouble, or global event can all impact how investors feel about a company. Positive news creates optimism (buying), negative news creates fear (selling). This emotional reaction is called "market sentiment."',
        icon: '📰',
      },
      {
        title: 'Economic Factors',
        content: 'Broader economic conditions affect all stocks. Interest rates (set by the Federal Reserve), inflation, unemployment, and GDP growth all play a role. When interest rates rise, stocks often fall because borrowing becomes more expensive for companies. When the economy is growing, stocks tend to rise.',
        icon: '🌐',
        highlight: 'Rising interest rates → stocks often decline',
      },
    ],
    quiz: [
      {
        question: 'What happens when more people want to buy a stock than sell it?',
        options: ['Price stays the same', 'Price goes down', 'Price goes up', 'Trading stops'],
        correctIndex: 2,
        explanation: 'When demand (buyers) exceeds supply (sellers), competition drives the price up. This is the basic law of supply and demand.',
      },
      {
        question: 'A company reports earnings ABOVE expectations. What usually happens?',
        options: ['Stock price drops', 'Stock price rises', 'Nothing changes', 'The company is delisted'],
        correctIndex: 1,
        explanation: 'When a company beats earnings expectations, investors become more optimistic about its future, driving the stock price higher.',
      },
    ],
    keyTakeaways: [
      'Stock prices are driven by supply and demand',
      'Company earnings are the biggest long-term price driver',
      'News and sentiment cause short-term price swings',
      'Economic factors like interest rates affect the entire market',
    ],
  },
  {
    id: 'types-of-stocks',
    title: 'Types of Stocks',
    subtitle: 'Growth stocks, value stocks, dividend stocks, and more',
    icon: <Layers className="size-5" />,
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/10 to-violet-500/5',
    borderColor: 'border-purple-500/30',
    difficulty: 'Beginner',
    readTime: '6 min',
    lessons: [
      {
        title: 'Growth Stocks',
        content: 'Growth stocks are companies growing their revenue and profits rapidly — think Tesla, Nvidia, or Amazon in their early days. These stocks can deliver huge returns but are also more volatile (price swings). Growth companies often reinvest profits instead of paying dividends, betting on future expansion.',
        icon: '🚀',
        highlight: 'High potential returns, but higher risk and volatility',
      },
      {
        title: 'Value Stocks',
        content: 'Value stocks are established companies trading below what they\'re "truly worth" based on fundamentals. Think Coca-Cola, Johnson & Johnson, or Procter & Gamble. They grow slower but are more stable and often pay dividends. Value investors look for bargains — great companies at discounted prices.',
        icon: '💎',
        highlight: 'Stable, established companies at "bargain" prices',
      },
      {
        title: 'Dividend Stocks',
        content: 'Dividend stocks pay you cash just for owning them! Companies share a portion of their profits with shareholders, usually quarterly. For example, if a stock pays a 3% annual dividend and you own $10,000 worth, you receive $300/year. Dividend stocks provide income even when stock prices aren\'t rising.',
        icon: '💵',
        highlight: 'Get paid cash just for holding these stocks!',
      },
      {
        title: 'Blue-Chip Stocks',
        content: 'Blue-chip stocks are large, well-known, financially stable companies with a long history of reliable performance. Examples: Apple, Microsoft, Google, Amazon. They\'re considered "safe" investments because they\'ve survived market crashes and recessions. Most portfolios should include blue-chip stocks as a foundation.',
        icon: '🏛️',
        highlight: 'The safest, most established companies in the market',
      },
      {
        title: 'Penny Stocks (Caution!)',
        content: 'Penny stocks are very cheap stocks (usually under $5) from small, unproven companies. While they can seem like "great deals," they\'re extremely risky. Many penny stocks go to zero. As a beginner, it\'s best to AVOID penny stocks and focus on established companies with real earnings.',
        icon: '⚠️',
        highlight: 'HIGH RISK — beginners should avoid penny stocks!',
      },
    ],
    quiz: [
      {
        question: 'Which type of stock pays you cash just for owning it?',
        options: ['Growth stock', 'Penny stock', 'Dividend stock', 'IPO stock'],
        correctIndex: 2,
        explanation: 'Dividend stocks distribute a portion of the company\'s profits to shareholders, typically as quarterly cash payments.',
      },
      {
        question: 'Why should beginners be cautious with penny stocks?',
        options: ['They\'re too expensive', 'They\'re extremely risky and many go to zero', 'They pay too many dividends', 'They\'re only for professionals by law'],
        correctIndex: 1,
        explanation: 'Penny stocks are from small, unproven companies. They\'re highly volatile and many lose all their value. Beginners should stick to established companies.',
      },
    ],
    keyTakeaways: [
      'Growth stocks: high potential, high risk (Tesla, Nvidia)',
      'Value stocks: stable, underpriced companies (Coca-Cola)',
      'Dividend stocks: pay you cash for holding them',
      'Blue-chips: safest, most established companies',
      'Avoid penny stocks as a beginner',
    ],
  },
  {
    id: 'reading-stock-charts',
    title: 'Reading Stock Charts',
    subtitle: 'How to interpret price charts and spot trends',
    icon: <BarChart3 className="size-5" />,
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/10 to-indigo-500/5',
    borderColor: 'border-blue-500/30',
    difficulty: 'Beginner+',
    readTime: '7 min',
    lessons: [
      {
        title: 'Line Charts & Candlestick Charts',
        content: 'A line chart connects closing prices over time — simple and easy to read. A candlestick chart shows more detail: each "candle" represents one time period and shows the Open, High, Low, and Close (OHLC) prices. Green/white candles mean the price went UP that period. Red/black candles mean the price went DOWN.',
        icon: '📊',
        highlight: 'Green candle = price went up; Red candle = price went down',
      },
      {
        title: 'Trends: Uptrend, Downtrend, Sideways',
        content: 'An uptrend is when a stock makes higher highs and higher lows over time — the overall direction is UP. A downtrend is the opposite — lower highs and lower lows. A sideways trend means the price bounces between support and resistance levels without a clear direction. Identifying the trend helps you make better decisions.',
        icon: '📈',
        highlight: 'The trend is your friend — trade with the trend, not against it',
      },
      {
        title: 'Support & Resistance Levels',
        content: 'Support is a price level where a stock tends to stop falling and bounces back up — think of it as a "floor." Resistance is where a stock tends to stop rising and pulls back — a "ceiling." When a stock breaks through resistance, it often signals a strong move higher. When it breaks support, it could signal further declines.',
        icon: '🧱',
        highlight: 'Support = floor (price bounces up); Resistance = ceiling (price bounces down)',
      },
      {
        title: 'Volume: The Hidden Signal',
        content: 'Volume shows how many shares were traded in a given period. High volume during a price increase confirms strong buying interest — the move is "real." Low volume during a move suggests weak conviction. Always check volume alongside price movements for better analysis.',
        icon: '📢',
        highlight: 'High volume + price increase = strong bullish signal',
      },
    ],
    quiz: [
      {
        question: 'What does a green candlestick indicate?',
        options: ['The stock lost value', 'The stock gained value in that period', 'The stock didn\'t trade', 'The market was closed'],
        correctIndex: 1,
        explanation: 'A green (or white) candlestick means the closing price was higher than the opening price — the stock gained value during that time period.',
      },
      {
        question: 'What is a "support level"?',
        options: ['A price ceiling', 'Customer support for brokers', 'A price floor where stocks tend to bounce up', 'The highest price ever reached'],
        correctIndex: 2,
        explanation: 'Support is a price level where buying pressure tends to prevent further decline — it acts as a "floor" for the stock price.',
      },
    ],
    keyTakeaways: [
      'Candlestick charts show Open, High, Low, Close prices',
      'Identify trends: uptrend, downtrend, or sideways',
      'Support = price floor; Resistance = price ceiling',
      'Volume confirms the strength of price movements',
    ],
  },
  {
    id: 'bull-bear-markets',
    title: 'Bull vs Bear Markets',
    subtitle: 'Understanding market cycles and what they mean for you',
    icon: <TrendingDown className="size-5" />,
    color: 'text-rose-400',
    bgGradient: 'from-rose-500/10 to-red-500/5',
    borderColor: 'border-rose-500/30',
    difficulty: 'Beginner',
    readTime: '5 min',
    lessons: [
      {
        title: 'Bull Market 🐂',
        content: 'A bull market is when stock prices are rising over a sustained period (typically 20%+ from recent lows). Investor confidence is high, the economy is usually growing, and there\'s an overall optimistic mood. The longest bull market in US history lasted from 2009 to 2020 — about 11 years! During bull markets, most stocks go up.',
        icon: '🐂',
        highlight: 'Bull market = prices rising, optimism, economic growth',
      },
      {
        title: 'Bear Market 🐻',
        content: 'A bear market is when stock prices fall 20% or more from recent highs. Investor confidence is low, fear dominates, and people rush to sell. Bear markets are scary but they\'re also NORMAL. Since 1928, there have been 26 bear markets — and the market has recovered from ALL of them. Bear markets create buying opportunities for patient investors.',
        icon: '🐻',
        highlight: 'Bear markets are temporary — the market ALWAYS recovers',
      },
      {
        title: 'Market Corrections',
        content: 'A correction is a 10-20% decline from recent highs. Corrections happen regularly (about once per year on average) and are completely normal. They\'re not as severe as bear markets. Smart investors use corrections as opportunities to buy great companies at lower prices, rather than panicking.',
        icon: '📉',
        highlight: 'Corrections (10-20% drops) happen about once per year — don\'t panic!',
      },
      {
        title: 'How to Survive Bear Markets',
        content: 'Rule #1: Don\'t panic sell. Rule #2: Keep investing regularly (dollar-cost averaging). Rule #3: Focus on quality companies with strong balance sheets. Rule #4: Remember that every bear market in history has eventually ended. The investors who stayed patient during 2008 and 2020 crashes made huge returns when the market recovered.',
        icon: '🛡️',
        highlight: 'Patience during bear markets = massive long-term gains',
      },
    ],
    quiz: [
      {
        question: 'What defines a bear market?',
        options: ['A 5% decline', 'A 10% decline', 'A 20%+ decline from highs', 'Any single bad trading day'],
        correctIndex: 2,
        explanation: 'A bear market is officially defined as a decline of 20% or more from recent market highs, typically sustained over weeks or months.',
      },
      {
        question: 'What should you do during a bear market?',
        options: ['Sell everything immediately', 'Stop looking at your portfolio forever', 'Stay patient and keep investing in quality companies', 'Only buy penny stocks'],
        correctIndex: 2,
        explanation: 'Bear markets are temporary. Staying patient and continuing to invest in quality companies at lower prices has historically been the best strategy.',
      },
    ],
    keyTakeaways: [
      'Bull market = 20%+ rise; Bear market = 20%+ decline',
      'Bear markets are scary but temporary — the market always recovers',
      'Corrections (10-20% drops) are normal and happen yearly',
      'Never panic sell — patience is rewarded in the long run',
    ],
  },
  {
    id: 'risk-diversification',
    title: 'Risk & Diversification',
    subtitle: 'How to protect your portfolio and manage risk like a pro',
    icon: <Shield className="size-5" />,
    color: 'text-teal-400',
    bgGradient: 'from-teal-500/10 to-cyan-500/5',
    borderColor: 'border-teal-500/30',
    difficulty: 'Beginner',
    readTime: '6 min',
    lessons: [
      {
        title: 'What is Investment Risk?',
        content: 'Risk is the possibility of losing some or all of your investment. All investments carry some risk — even "safe" ones. The key insight: higher potential returns usually come with higher risk. Growth stocks can 10x but can also crash 50%. Blue-chip stocks rarely crash but grow slower. Understanding your personal risk tolerance is critical.',
        icon: '⚡',
        highlight: 'Higher potential reward = higher risk (always!)',
      },
      {
        title: 'Diversification: Don\'t Put All Eggs in One Basket',
        content: 'Diversification means spreading your money across different stocks, industries, and asset types. If you put 100% of your money in one stock and it drops 50%, you lose half your portfolio. But if you own 10 stocks across different sectors, one bad stock has much less impact. Diversification is the #1 rule of risk management.',
        icon: '🥚',
        highlight: 'Own stocks in different industries to reduce risk',
      },
      {
        title: 'Sector Diversification',
        content: 'Don\'t just own tech stocks! Spread your investments across sectors: Technology (Apple, Nvidia), Healthcare (Johnson & Johnson), Consumer (Coca-Cola, Nike), Finance (JPMorgan), Energy (ExxonMobil), etc. When one sector struggles, others may thrive, balancing your portfolio.',
        icon: '🎨',
      },
      {
        title: 'Position Sizing',
        content: 'Position sizing means deciding how much money to put into each stock. A common rule: never put more than 5-10% of your total portfolio in a single stock. This way, even if one stock crashes, it won\'t destroy your portfolio. As a beginner, try equal-weighting your positions.',
        icon: '📐',
        highlight: 'Never invest more than 10% of your portfolio in one stock',
      },
    ],
    quiz: [
      {
        question: 'What is diversification?',
        options: ['Buying one stock you really believe in', 'Spreading investments across different stocks and sectors', 'Only investing in tech companies', 'Selling all your stocks'],
        correctIndex: 1,
        explanation: 'Diversification means spreading your investments across multiple stocks, industries, and asset types to reduce the impact of any single investment\'s poor performance.',
      },
      {
        question: 'What\'s a good rule for position sizing?',
        options: ['Put 100% in your favorite stock', 'Never more than 5-10% in one stock', 'Only buy penny stocks', 'Invest everything at once'],
        correctIndex: 1,
        explanation: 'Limiting each position to 5-10% of your portfolio ensures that no single stock can cause catastrophic losses to your overall investment.',
      },
    ],
    keyTakeaways: [
      'All investments carry risk — higher returns = higher risk',
      'Diversify across stocks and sectors to reduce risk',
      'Never put more than 5-10% of your portfolio in one stock',
      'Spread investments across tech, healthcare, consumer, finance, etc.',
    ],
  },
  {
    id: 'key-financial-terms',
    title: 'Key Financial Terms',
    subtitle: 'P/E Ratio, Market Cap, EPS, and other must-know metrics',
    icon: <DollarSign className="size-5" />,
    color: 'text-orange-400',
    bgGradient: 'from-orange-500/10 to-amber-500/5',
    borderColor: 'border-orange-500/30',
    difficulty: 'Beginner+',
    readTime: '8 min',
    lessons: [
      {
        title: 'Market Capitalization (Market Cap)',
        content: 'Market Cap = Stock Price × Total Shares Outstanding. It tells you the total value of a company. Large-cap ($10B+): Apple, Microsoft — stable and safe. Mid-cap ($2-10B): Growing companies with good potential. Small-cap (under $2B): Smaller companies with higher growth potential but more risk.',
        icon: '🏢',
        highlight: 'Market Cap = Price × Shares = total company value',
      },
      {
        title: 'P/E Ratio (Price-to-Earnings)',
        content: 'The P/E Ratio = Stock Price ÷ Earnings Per Share (EPS). It tells you how much investors are willing to pay for $1 of earnings. A P/E of 20 means investors pay $20 for every $1 of profit. Low P/E (under 15): potentially undervalued. High P/E (over 30): investors expect high future growth. Compare P/E within the same industry.',
        icon: '📊',
        highlight: 'Low P/E = possible bargain; High P/E = high growth expected',
      },
      {
        title: 'Earnings Per Share (EPS)',
        content: 'EPS = Company\'s Net Profit ÷ Total Shares Outstanding. It shows how much profit a company makes per share. Higher EPS = more profitable. If a company earns $1 billion and has 500 million shares, EPS = $2. Growing EPS over time is a strong bullish signal.',
        icon: '💹',
        highlight: 'Growing EPS = growing profits = healthy company',
      },
      {
        title: 'Dividend Yield',
        content: 'Dividend Yield = Annual Dividend ÷ Stock Price × 100. It tells you the percentage return you get from dividends alone. A 3% dividend yield on a $100 stock means you get $3/year per share. High dividend yields (4-6%) are attractive for income, but be cautious of extremely high yields — they might signal trouble.',
        icon: '💰',
      },
      {
        title: 'Volume & Liquidity',
        content: 'Volume is the number of shares traded per day. High volume means high liquidity — you can easily buy and sell without affecting the price. Low volume stocks are "illiquid" and harder to trade. As a beginner, stick to stocks with average daily volume of 1 million+ shares.',
        icon: '🌊',
        highlight: 'High volume = easy to buy/sell; Low volume = harder to trade',
      },
      {
        title: '52-Week High & Low',
        content: 'The 52-week high is the highest price a stock traded at in the past year. The 52-week low is the lowest. Stocks near their 52-week high might be in a strong uptrend. Stocks near their 52-week low could be bargains OR struggling companies — always investigate why before buying.',
        icon: '📏',
      },
    ],
    quiz: [
      {
        question: 'What does a P/E ratio of 25 mean?',
        options: ['The stock costs $25', 'The company has 25 employees', 'Investors pay $25 for every $1 of earnings', 'The stock is 25 years old'],
        correctIndex: 2,
        explanation: 'A P/E of 25 means investors are paying $25 for every $1 of the company\'s annual earnings. It reflects how much growth investors expect.',
      },
      {
        question: 'Which market cap is considered a "large-cap" company?',
        options: ['Under $500 million', '$1-2 billion', '$10 billion+', 'Over $1 million'],
        correctIndex: 2,
        explanation: 'Large-cap companies have market capitalizations of $10 billion or more. These are typically well-established, stable companies like Apple and Microsoft.',
      },
    ],
    keyTakeaways: [
      'Market Cap = total company value (price × shares)',
      'P/E Ratio shows how much you pay per $1 of earnings',
      'EPS growth over time signals a healthy company',
      'High volume stocks are easier to trade',
      'Compare metrics within the same industry, not across industries',
    ],
  },
  {
    id: 'researching-stocks',
    title: 'How to Research a Stock',
    subtitle: 'A step-by-step framework for evaluating any company',
    icon: <Target className="size-5" />,
    color: 'text-indigo-400',
    bgGradient: 'from-indigo-500/10 to-purple-500/5',
    borderColor: 'border-indigo-500/30',
    difficulty: 'Beginner+',
    readTime: '7 min',
    lessons: [
      {
        title: 'Step 1: Understand the Business',
        content: 'Before investing in any company, understand what it DOES. How does it make money? Who are its customers? What industry is it in? Can you explain the company in one sentence? If you can\'t understand the business, don\'t invest in it. Warren Buffett calls this your "circle of competence."',
        icon: '🔍',
        highlight: 'If you can\'t explain what the company does, don\'t invest',
      },
      {
        title: 'Step 2: Check Financial Health',
        content: 'Look at key metrics: Is revenue growing? Is the company profitable (positive EPS)? Does it have more cash than debt? Check the company\'s income statement (revenue, expenses, profit), balance sheet (assets vs liabilities), and cash flow statement (actual cash moving in and out).',
        icon: '🏥',
        highlight: 'Growing revenue + positive EPS + low debt = financially healthy',
      },
      {
        title: 'Step 3: Evaluate Competitive Advantage',
        content: 'Does the company have a "moat" — something that protects it from competitors? Apple has its ecosystem and brand loyalty. Google has its search dominance. Coca-Cola has its global brand. Companies with strong moats can maintain profits for decades. No moat = easily disrupted.',
        icon: '🏰',
        highlight: 'Strong moat = sustainable competitive advantage',
      },
      {
        title: 'Step 4: Check the Valuation',
        content: 'Is the stock overpriced or a bargain? Compare the P/E ratio to industry peers and the company\'s historical average. Look at the PEG ratio (P/E ÷ Growth Rate) — under 1.0 suggests the stock is undervalued relative to its growth. Don\'t overpay, even for great companies.',
        icon: '🏷️',
        highlight: 'PEG ratio under 1.0 = potentially undervalued',
      },
      {
        title: 'Step 5: Read the News & Analyst Reports',
        content: 'Check recent news for any red flags or positive catalysts. Read analyst price targets and ratings. Look at insider buying/selling — if company executives are buying their own stock, that\'s a bullish sign. If they\'re selling heavily, be cautious.',
        icon: '📰',
      },
    ],
    quiz: [
      {
        question: 'What is a company\'s "moat"?',
        options: ['A water feature at headquarters', 'A competitive advantage protecting profits', 'The company\'s stock price', 'A type of financial report'],
        correctIndex: 1,
        explanation: 'A "moat" is a sustainable competitive advantage that protects a company from competition — like a brand, patents, network effects, or cost advantages.',
      },
      {
        question: 'If company insiders are buying their own stock, what does it usually signal?',
        options: ['The company is failing', 'They\'re required by law', 'They believe the stock is undervalued', 'Nothing important'],
        correctIndex: 2,
        explanation: 'When company executives buy their own stock with personal money, it signals confidence that they believe the stock price will rise.',
      },
    ],
    keyTakeaways: [
      'Understand the business before investing',
      'Check revenue growth, profitability, and debt levels',
      'Look for companies with strong competitive moats',
      'Use P/E and PEG ratios to check if the price is fair',
      'Insider buying is a bullish signal',
    ],
  },
  {
    id: 'common-mistakes',
    title: 'Common Beginner Mistakes',
    subtitle: 'Avoid these costly errors that most new investors make',
    icon: <AlertTriangle className="size-5" />,
    color: 'text-red-400',
    bgGradient: 'from-red-500/10 to-rose-500/5',
    borderColor: 'border-red-500/30',
    difficulty: 'Beginner',
    readTime: '6 min',
    lessons: [
      {
        title: 'Mistake #1: Panic Selling',
        content: 'The #1 beginner mistake is selling stocks during market dips out of fear. When prices drop 10-20%, emotions scream "SELL!" But historically, every market drop has been followed by a recovery. If you panic sold during the 2020 COVID crash, you would have missed a 100%+ recovery. Lesson: volatility is normal, not dangerous.',
        icon: '😱',
        highlight: 'Panic selling locks in losses that would have recovered',
      },
      {
        title: 'Mistake #2: Chasing Hype',
        content: 'Buying a stock just because it\'s trending on social media or everyone is talking about it is a recipe for disaster. By the time a stock is "viral," the price has usually already skyrocketed. You end up buying at the peak right before it crashes. Always do your own research before investing.',
        icon: '📱',
        highlight: 'If everyone is talking about a stock, you\'re probably too late',
      },
      {
        title: 'Mistake #3: No Diversification',
        content: 'Putting all your money in one stock or one sector is extremely risky. If that stock crashes, you lose everything. Always spread your investments across at least 5-10 different stocks in different industries. Diversification won\'t prevent all losses, but it prevents catastrophic ones.',
        icon: '🥚',
      },
      {
        title: 'Mistake #4: Trying to Time the Market',
        content: 'Nobody can consistently predict market tops and bottoms — not even professional fund managers. Studies show that "time in the market" beats "timing the market." Invest regularly (monthly) regardless of what the market is doing. This strategy is called dollar-cost averaging.',
        icon: '⏱️',
        highlight: 'Time IN the market > timing the market',
      },
      {
        title: 'Mistake #5: Ignoring Fees & Taxes',
        content: 'Trading too frequently racks up fees and taxes. Short-term capital gains (held less than 1 year) are taxed at higher rates than long-term gains (held 1+ years). Frequent trading also increases brokerage fees. Buy quality stocks and hold them for the long term to minimize costs.',
        icon: '💸',
        highlight: 'Hold stocks 1+ year for lower tax rates',
      },
    ],
    quiz: [
      {
        question: 'Why is "timing the market" a bad strategy?',
        options: ['Because markets are closed on weekends', 'Because nobody can consistently predict tops and bottoms', 'Because you need special software', 'Because it\'s illegal'],
        correctIndex: 1,
        explanation: 'Even professional investors can\'t consistently predict market movements. Research shows that investing regularly over time (dollar-cost averaging) outperforms trying to time the market.',
      },
      {
        question: 'What is "dollar-cost averaging"?',
        options: ['Buying only stocks priced at $1', 'Investing the same amount at regular intervals', 'Averaging your portfolio value daily', 'Converting all investments to dollars'],
        correctIndex: 1,
        explanation: 'Dollar-cost averaging means investing a fixed amount at regular intervals (e.g., $500 every month), regardless of the stock price. This smooths out the impact of price volatility.',
      },
    ],
    keyTakeaways: [
      'Never panic sell during market dips',
      'Don\'t chase hyped stocks — do your own research',
      'Diversify across 5-10+ stocks in different sectors',
      'Time in the market beats timing the market',
      'Hold stocks 1+ year for better tax rates',
    ],
  },
  {
    id: 'building-portfolio',
    title: 'Building Your First Portfolio',
    subtitle: 'A practical guide to assembling your starter investment portfolio',
    icon: <PieChart className="size-5" />,
    color: 'text-sky-400',
    bgGradient: 'from-sky-500/10 to-blue-500/5',
    borderColor: 'border-sky-500/30',
    difficulty: 'Beginner+',
    readTime: '6 min',
    lessons: [
      {
        title: 'Start Small, Stay Consistent',
        content: 'You don\'t need $10,000 to start investing. Many successful investors started with just $100-$500. The key is consistency — invest a fixed amount every month regardless of market conditions. Even $100/month invested in the S&P 500 at 10% annual return becomes $77,000 in 20 years!',
        icon: '🌱',
        highlight: '$100/month × 20 years at 10% return = $77,000+',
      },
      {
        title: 'The Core-Satellite Strategy',
        content: 'Build your portfolio with a "core" of 3-5 stable blue-chip stocks (Apple, Microsoft, Google) that form 60-70% of your portfolio. Then add "satellite" positions — smaller allocations to growth stocks or exciting companies you believe in. This gives you stability AND growth potential.',
        icon: '🪐',
        highlight: 'Core (60-70% blue-chips) + Satellite (30-40% growth picks)',
      },
      {
        title: 'Rebalancing Your Portfolio',
        content: 'Over time, some stocks grow faster than others, throwing off your intended allocation. If one stock doubles while others stay flat, it becomes a bigger portion of your portfolio than planned. Rebalancing means periodically selling overweight positions and buying underweight ones to maintain your target mix.',
        icon: '⚖️',
      },
      {
        title: 'When to Sell (and When NOT to)',
        content: 'SELL when: the company\'s fundamentals deteriorate (declining revenue, losing market share), the original reason you bought no longer holds, or you need the money. DON\'T sell because: the stock dropped 10%, a social media influencer said so, or you\'re bored. Have a plan and stick to it.',
        icon: '🎯',
        highlight: 'Sell based on fundamentals, not emotions',
      },
    ],
    quiz: [
      {
        question: 'What is the "core-satellite" strategy?',
        options: ['Only buying tech stocks', 'A 60-70% stable core + 30-40% growth picks', 'Investing only in one stock', 'Trading every day'],
        correctIndex: 1,
        explanation: 'The core-satellite strategy uses stable blue-chip stocks as your foundation (core) and adds smaller growth positions (satellites) for upside potential.',
      },
      {
        question: 'When should you sell a stock?',
        options: ['When it drops 5%', 'When social media says to', 'When the company\'s fundamentals deteriorate', 'Every Monday'],
        correctIndex: 2,
        explanation: 'Sell when the company\'s business fundamentals worsen — declining revenue, increasing debt, or loss of competitive advantage. Don\'t sell based on short-term price drops or emotions.',
      },
    ],
    keyTakeaways: [
      'Start investing with whatever amount you can — consistency matters most',
      'Use the core-satellite strategy: stable core + growth picks',
      'Rebalance your portfolio periodically to maintain target allocations',
      'Sell based on fundamentals, not emotions or short-term price drops',
    ],
  },
]

const DIFF_BADGE: Record<string, string> = {
  'Beginner': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'Beginner+': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'Intermediate': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
}

const MODULE_VISUALS: Record<string, { emoji: string; title: string; subtitle: string }> = {
  'what-is-stock-market': { emoji: '🏪', title: 'Stock market marketplace', subtitle: 'Where companies meet investors' },
  'how-stocks-work': { emoji: '💹', title: 'Buying and selling shares', subtitle: 'How ownership changes hands' },
  'understanding-stock-prices': { emoji: '📈', title: 'Price movement lesson', subtitle: 'What pushes prices up or down' },
  'types-of-stocks': { emoji: '🧩', title: 'Different stock styles', subtitle: 'Growth, value, dividend, and more' },
  'reading-stock-charts': { emoji: '📊', title: 'Chart reading basics', subtitle: 'Patterns, trends, and signals' },
  'bull-bear-markets': { emoji: '🐂🐻', title: 'Market moods', subtitle: 'Bullish optimism vs bearish fear' },
  'risk-diversification': { emoji: '🛡️', title: 'Risk management', subtitle: 'Protecting your money with balance' },
  'key-financial-terms': { emoji: '🧮', title: 'Fundamental metrics', subtitle: 'Numbers every investor should know' },
  'researching-stocks': { emoji: '🔍', title: 'Smart research habits', subtitle: 'Investigate before you invest' },
  'common-mistakes': { emoji: '⚠️', title: 'Beginner pitfalls', subtitle: 'Avoid costly errors' },
  'building-portfolio': { emoji: '🧺', title: 'Portfolio building', subtitle: 'Creating a balanced starter plan' },
}

const MODULE_WHY_IT_MATTERS: Record<string, string[]> = {
  'what-is-stock-market': [
    'It helps you understand the basic arena where investing happens.',
    'You will see why companies issue shares and why people trade them.',
  ],
  'how-stocks-work': [
    'This teaches the mechanics of buying, holding, and selling shares.',
    'You will learn what profit and loss actually mean in practice.',
  ],
  'understanding-stock-prices': [
    'Prices move because of demand, company news, and macro conditions.',
    'Knowing the drivers helps you stay calm when markets swing.',
  ],
  'types-of-stocks': [
    'Different stocks fit different goals, timelines, and risk levels.',
    'This helps you choose investments that match your comfort level.',
  ],
  'reading-stock-charts': [
    'Charts help you spot trends and identify support or resistance.',
    'Even simple chart reading can improve your timing and confidence.',
  ],
  'bull-bear-markets': [
    'Markets move in cycles, and understanding them reduces panic.',
    'You will learn how to stay focused during both growth and decline.',
  ],
  'risk-diversification': [
    'Risk management protects you from one bad decision hurting everything.',
    'Diversification is one of the simplest ways to build resilience.',
  ],
  'key-financial-terms': [
    'Financial metrics turn confusing company stories into useful facts.',
    'They make it much easier to compare one stock with another.',
  ],
  'researching-stocks': [
    'Research helps you invest based on evidence rather than hype.',
    'The better your process, the lower the chance of regret later.',
  ],
  'common-mistakes': [
    'Most beginner losses come from emotions, not bad intentions.',
    'Learning these mistakes can save you money and stress.',
  ],
  'building-portfolio': [
    'A portfolio gives structure to your investing plan.',
    'Small thoughtful choices can create much better long-term results.',
  ],
}

function getModuleWhyItMatters(moduleId: string) {
  return MODULE_WHY_IT_MATTERS[moduleId] || [
    'This module helps you build confidence and make wiser investing choices.',
    'The ideas here form a strong base for future learning.',
  ]
}

function getLessonContext(moduleId: string, lessonIndex: number, lessonTitle: string) {
  const baseContext: Record<string, string[]> = {
    'what-is-stock-market': [
      'Think of the stock market as a public marketplace where ownership changes hands. It is one of the clearest ways for companies to raise money while giving everyday people a chance to participate.',
      'An IPO is a major milestone because it moves a company from private ownership into public ownership, which can bring in new capital and public attention.',
      'Different exchanges often attract different kinds of companies, so knowing where a stock trades can tell you something about its business and investor base.',
      'Market hours matter because that is when price discovery happens. When the market closes, the last price becomes the reference point until trading resumes.',
    ],
    'how-stocks-work': [
      'A simple way to understand this is to imagine buying a small slice of a business and hoping it becomes more valuable over time. The goal is to buy at a reasonable price and later sell at a higher one.',
      'A gain or loss is only truly realized when you sell the shares. Before that, the change is just a paper gain or paper loss.',
      'Fractional shares make investing more accessible because they let you start small instead of needing to buy whole shares.',
      'Market orders and limit orders solve different problems: one prioritizes speed, while the other prioritizes price control.',
    ],
    'understanding-stock-prices': [
      'Stock prices are not just random numbers; they are a real-time reflection of what buyers and sellers believe the company is worth right now.',
      'Earnings reports are important because they show whether the company is truly improving or merely getting attention for the wrong reasons.',
      'News can cause sharp moves because investors update their expectations quickly when new information arrives.',
      'The broader economy matters because high rates, inflation, and slow growth can change how investors value almost every stock.',
    ],
    'types-of-stocks': [
      'Growth stocks often feel expensive because investors are paying for future potential rather than current profits.',
      'Value stocks are often interesting when the market has overlooked a strong company that appears cheaper than its fundamentals suggest.',
      'Dividend stocks can offer both income and long-term ownership, which is why many investors like them for stability.',
      'Blue-chip stocks are often used as a foundation because they are established, well-known, and usually more dependable.',
      'Penny stocks can look attractive because they are cheap, but they are often highly risky and not a good fit for beginners.',
    ],
    'reading-stock-charts': [
      'Charts are useful because they help you see the story behind the price movement instead of reacting to every daily swing.',
      'A trend is usually more important than the day-to-day noise, especially when you are trying to understand the broader direction.',
      'Support and resistance are not guarantees, but they are helpful zones where price often reacts because many traders are watching them.',
      'Volume tells you whether a price move is strong or weak. A big move with little volume can be less reliable than one with strong participation.',
    ],
    'bull-bear-markets': [
      'Bull markets often feel exciting because rising prices create optimism, but they can also make people overly confident and careless.',
      'Bear markets are uncomfortable, but they are a natural part of investing and often create long-term opportunities for patient investors.',
      'Corrections are smaller pullbacks that happen regularly and are usually less severe than a full bear market.',
      'The strongest investors usually stay calm during downturns and focus on long-term goals rather than short-term fear.',
    ],
    'risk-diversification': [
      'Risk is not only the chance of losing money; it is also the chance that your assumptions about a company are wrong.',
      'Diversification lowers the impact of any one mistake, which is why it is one of the most important habits in investing.',
      'Different sectors often respond differently to the same economic event, so spreading investments can make your portfolio more resilient.',
      'Position sizing helps you protect your capital by making sure one bad decision cannot easily ruin your entire plan.',
    ],
    'key-financial-terms': [
      'Market cap gives you a quick sense of company size, which often correlates with stability and investor attention.',
      'The P/E ratio helps compare price to earnings, but it is most meaningful when you compare similar companies in the same industry.',
      'EPS tells you how much profit belongs to each share, which makes it easier to compare companies on a per-share basis.',
      'Dividend yield can be attractive for income investors, but an extremely high yield can also be a warning sign.',
      'Liquidity matters because a stock that is hard to trade can become frustrating and costly when you want to buy or sell.',
      'The 52-week range helps you see whether a stock is near a recent high, near a low, or still recovering from a downturn.',
    ],
    'researching-stocks': [
      'The best investing decisions usually begin with understanding what the business actually does and why customers choose it.',
      'Financial statements show whether a company is improving or just using clever storytelling to attract attention.',
      'A moat is valuable because it helps protect a company’s profits from competitors over the long term.',
      'Valuation matters because a great company can still be a bad buy if you pay too much for it.',
      'News and insider activity are useful clues, but they should support your own analysis rather than replace it.',
    ],
    'common-mistakes': [
      'Fear often causes beginners to sell at the worst possible moment, especially when headlines become dramatic.',
      'Hype is dangerous because by the time a stock is popular, the easy upside may already be gone.',
      'Diversification is important because a concentrated portfolio can be wiped out by one bad company or sector.',
      'The best long-term strategy is usually consistency, not trying to predict every movement in the market.',
      'Fees and taxes may seem small at first, but they can quietly reduce your returns over time.',
    ],
    'building-portfolio': [
      'You do not need a large amount of money to begin. What matters more is starting with a simple plan and staying consistent over time.',
      'A core-satellite approach gives you a stable foundation while still leaving room for growth-oriented positions.',
      'Rebalancing helps keep your portfolio aligned with your goals instead of letting one holding dominate your plan.',
      'The best sell rule is usually based on changes in the business, not on fear, headlines, or short-term price swings.',
    ],
  }

  return baseContext[moduleId]?.[lessonIndex] || `This lesson builds on the broader idea that ${lessonTitle.toLowerCase()} is an important part of becoming a more thoughtful investor.`
}

function getQuizQuestions(moduleId: string): QuizQuestion[] {
  const quizMap: Record<string, QuizQuestion[]> = {
    'what-is-stock-market': [
      { question: 'What is the stock market mainly used for?', options: ['Borrowing money', 'Buying and selling company ownership', 'Printing new currency', 'Selling homes'], correctIndex: 1, explanation: 'The stock market is where investors buy and sell shares of companies.' },
      { question: 'What does a stock represent?', options: ['A company loan', 'A tiny ownership stake', 'A government bond', 'A bank account'], correctIndex: 1, explanation: 'Buying a stock means owning a small part of the company.' },
      { question: 'Why do companies issue shares?', options: ['To reduce taxes', 'To raise money for growth', 'To avoid hiring employees', 'To lower employee salaries'], correctIndex: 1, explanation: 'Companies issue shares to raise capital for expansion and operations.' },
      { question: 'What is an IPO?', options: ['A stock price drop', 'A company’s first public share sale', 'A trader’s retirement plan', 'A market holiday'], correctIndex: 1, explanation: 'IPO stands for Initial Public Offering.' },
      { question: 'What makes stock prices rise?', options: ['More sellers than buyers', 'More buyers than sellers', 'Lower company profits', 'Reduced trading hours'], correctIndex: 1, explanation: 'High demand relative to supply generally pushes prices up.' },
      { question: 'Which exchange is known for many technology companies?', options: ['NASDAQ', 'NYSE', 'BSE', 'LSE'], correctIndex: 0, explanation: 'NASDAQ is well known for technology and growth companies.' },
      { question: 'What is a shareholder?', options: ['Someone who rents a company', 'Someone who owns part of a company', 'Someone who works at the company', 'Someone who issues debt'], correctIndex: 1, explanation: 'A shareholder owns shares in the company.' },
      { question: 'Why does the stock market matter to everyday people?', options: ['It only affects rich people', 'It gives regular people a way to build wealth over time', 'It is only for traders', 'It replaces savings accounts'], correctIndex: 1, explanation: 'Long-term investing can help ordinary people grow wealth.' },
    ],
    'how-stocks-work': [
      { question: 'What does “buying low and selling high” mean?', options: ['Sell before you buy', 'Buy at a low price and sell later at a higher price', 'Only buy during crashes', 'Avoid all stocks'], correctIndex: 1, explanation: 'That is the basic goal of stock investing.' },
      { question: 'What is a market order?', options: ['An order that waits for a price target', 'An order to buy or sell immediately at market price', 'An order for a company merger', 'An order to hold shares forever'], correctIndex: 1, explanation: 'A market order executes immediately at the best available price.' },
      { question: 'What does a limit order do?', options: ['It buys automatically at the best price', 'It sets a target price and waits', 'It doubles your position', 'It guarantees profit'], correctIndex: 1, explanation: 'A limit order only executes if your chosen price is reached.' },
      { question: 'What are fractional shares?', options: ['Shares from a bankrupt company', 'Small slices of a full share', 'Shares that cannot be sold', 'Shares with no value'], correctIndex: 1, explanation: 'Fractional shares let you invest with smaller amounts of money.' },
      { question: 'When do you realize a gain?', options: ['As soon as you buy', 'When you sell at a higher price', 'When the market opens', 'When a company releases news'], correctIndex: 1, explanation: 'A gain is realized only when the stock is sold.' },
      { question: 'What is going long?', options: ['Selling first and buying later', 'Buying shares with the expectation they will rise', 'Shorting a stock', 'Avoiding all risk'], correctIndex: 1, explanation: 'Going long means buying because you expect prices to go up.' },
      { question: 'Which is usually more flexible?', options: ['A market order', 'A limit order', 'A dividend', 'A bond'], correctIndex: 1, explanation: 'A limit order gives more control over the execution price.' },
      { question: 'Why might someone choose to sell a stock?', options: ['Because they need money or the thesis changed', 'Because the company is growing', 'Because the market is open', 'Because dividends are paid'], correctIndex: 0, explanation: 'Investors sell when the reason for owning no longer holds or they need cash.' },
    ],
    'understanding-stock-prices': [
      { question: 'What is the main idea behind supply and demand?', options: ['Prices only fall on weekends', 'More buyers than sellers pushes price up', 'All stocks have the same price', 'Markets never change'], correctIndex: 1, explanation: 'Price moves when buyers and sellers compete.' },
      { question: 'Which factor often moves prices in the short term?', options: ['Weather alone', 'Company news and investor sentiment', 'The color of the logo', 'The number of employees'], correctIndex: 1, explanation: 'News and mood can create quick price changes.' },
      { question: 'How do earnings reports affect stocks?', options: ['They are irrelevant', 'Strong results can lift a stock', 'They always reduce price', 'They only matter in Europe'], correctIndex: 1, explanation: 'Better-than-expected earnings often increase investor confidence.' },
      { question: 'What happens when interest rates rise?', options: ['Stocks usually become cheaper', 'Stocks often face pressure because borrowing gets more expensive', 'Stocks always rise', 'The market closes'], correctIndex: 1, explanation: 'Higher interest rates can reduce company profitability and investor appetite.' },
      { question: 'What is market sentiment?', options: ['The mood of investors', 'A specific stock ticker', 'A type of bond', 'A government report'], correctIndex: 0, explanation: 'Sentiment refers to the overall mood of the market.' },
      { question: 'Why do prices sometimes swing sharply?', options: ['Because charts are random', 'Because news, emotion, and trading volume can accelerate movement', 'Because the market is closed', 'Because companies stop making money'], correctIndex: 1, explanation: 'Short-term moves can be driven by emotion and reactions to information.' },
      { question: 'What is a key long-term driver of stock value?', options: ['The CEO’s haircut', 'Company earnings growth', 'The number of chart lines', 'The exchange logo'], correctIndex: 1, explanation: 'Strong earnings growth often supports higher long-term prices.' },
      { question: 'Which statement is most accurate?', options: ['Stock prices only change once a month', 'Stock prices can move every second during trading hours', 'Stocks never move during the day', 'Prices only rise on Mondays'], correctIndex: 1, explanation: 'Stock prices change continuously while markets are open.' },
    ],
    'types-of-stocks': [
      { question: 'What is a growth stock?', options: ['A stock that pays no dividend', 'A company expected to grow quickly', 'A stock that never moves', 'A stock from a bank'], correctIndex: 1, explanation: 'Growth stocks come from companies expected to expand rapidly.' },
      { question: 'What is a value stock?', options: ['A stock that is cheap relative to its fundamentals', 'A stock with no price history', 'A stock from a new company only', 'A stock that always pays high dividends'], correctIndex: 0, explanation: 'Value stocks are often seen as underpriced relative to their quality.' },
      { question: 'What do dividend stocks provide?', options: ['Free company products', 'Regular cash payments to shareholders', 'Guaranteed profits', 'No voting rights'], correctIndex: 1, explanation: 'Dividend stocks can distribute part of company profits to owners.' },
      { question: 'Why are blue-chip stocks popular?', options: ['They are very new', 'They are large and established companies', 'They pay no dividends', 'They are always cheap'], correctIndex: 1, explanation: 'Blue-chip stocks are known for stability and reputation.' },
      { question: 'Why should beginners avoid penny stocks?', options: ['They are too safe', 'They can be extremely risky and volatile', 'They always have strong dividends', 'They are government-backed'], correctIndex: 1, explanation: 'Penny stocks are often speculative and can lose most of their value.' },
      { question: 'Which stock type may offer the highest growth potential?', options: ['Dividend stock', 'Growth stock', 'Blue-chip stock', 'Bond'], correctIndex: 1, explanation: 'Growth stocks can climb quickly when the company expands.' },
      { question: 'What is a common trait of value stocks?', options: ['They are always risky', 'They often trade below what they seem worth', 'They never pay dividends', 'They are always new'], correctIndex: 1, explanation: 'Value investors look for companies that appear discounted.' },
      { question: 'Which stock type is usually best for a beginner wanting a more stable foundation?', options: ['Penny stock', 'Blue-chip stock', 'Speculative startup stock', 'Highly leveraged stock'], correctIndex: 1, explanation: 'Blue-chip stocks are often seen as stable starting points.' },
    ],
    'reading-stock-charts': [
      { question: 'What does a green candlestick usually mean?', options: ['The price fell', 'The price rose', 'The market closed', 'The stock split'], correctIndex: 1, explanation: 'Green candles often show the closing price was higher than the opening price.' },
      { question: 'What does a red candlestick usually mean?', options: ['The price rose', 'The price fell', 'The market opened', 'The stock was bought out'], correctIndex: 1, explanation: 'Red candles usually show the price fell during that period.' },
      { question: 'What is an uptrend?', options: ['Prices moving lower', 'Prices making higher highs and higher lows', 'Prices staying flat forever', 'Prices that never change'], correctIndex: 1, explanation: 'An uptrend means the overall direction is upward.' },
      { question: 'What is support?', options: ['A price ceiling', 'A price floor where buyers tend to appear', 'A stock dividend', 'A market close time'], correctIndex: 1, explanation: 'Support is a level where price tends to stop falling and bounce.' },
      { question: 'What is resistance?', options: ['A company’s profit target', 'A price level where selling often appears', 'A type of dividend', 'A government regulation'], correctIndex: 1, explanation: 'Resistance is a level where price often struggles to rise past.' },
      { question: 'Why is volume important?', options: ['It measures company profits', 'It shows how much interest there is in a move', 'It predicts interest rates', 'It changes company earnings'], correctIndex: 1, explanation: 'Volume helps confirm whether a price move has real momentum.' },
      { question: 'What does sideways movement mean?', options: ['Prices are crashing', 'Prices are ranging without a clear direction', 'Prices are doubling', 'Prices are unaffected'], correctIndex: 1, explanation: 'Sideways movement shows a lack of strong trend direction.' },
      { question: 'What should you look for first in a chart?', options: ['The company logo', 'The overall trend', 'The broker name', 'The CEO birth year'], correctIndex: 1, explanation: 'The trend is often the first thing investors try to identify.' },
    ],
    'bull-bear-markets': [
      { question: 'What is a bull market?', options: ['A market with falling prices', 'A market with rising prices and optimism', 'A market that never moves', 'A market with only one stock'], correctIndex: 1, explanation: 'Bull markets are periods of rising confidence and price appreciation.' },
      { question: 'What is a bear market?', options: ['A market with rising prices', 'A market with declining prices and fear', 'A market with no trading', 'A market with only dividends'], correctIndex: 1, explanation: 'Bear markets are periods of falling prices and negative sentiment.' },
      { question: 'What is a correction?', options: ['A small 10–20% pullback', 'A company earnings report', 'A stock split', 'An IPO announcement'], correctIndex: 0, explanation: 'A correction is a shorter, moderate decline from recent highs.' },
      { question: 'Why should investors avoid panic selling?', options: ['It guarantees profits', 'It can lock in losses', 'It helps diversify', 'It reduces taxes'], correctIndex: 1, explanation: 'Panic selling often turns temporary drops into permanent losses.' },
      { question: 'What can be a buying opportunity?', options: ['A correction or bear market decline', 'A dividend cut', 'A tax holiday', 'A market holiday'], correctIndex: 0, explanation: 'Price declines can offer attractive entry points for long-term investors.' },
      { question: 'What does staying patient usually do?', options: ['It guarantees quick profits', 'It allows recovery to happen over time', 'It increases fees', 'It creates more risk'], correctIndex: 1, explanation: 'Patience benefits long-term investors because recoveries often occur.' },
      { question: 'What usually happens during a bull market?', options: ['Most stocks decline', 'Most stocks rise', 'Companies stop investing', 'Interest rates always go up'], correctIndex: 1, explanation: 'Bull markets often lift many assets and sectors.' },
      { question: 'What is a normal part of investing?', options: ['Only one stock purchase', 'Market swings and pullbacks', 'No losses ever', 'Immediate riches'], correctIndex: 1, explanation: 'Volatility is normal and should be expected by investors.' },
    ],
    'risk-diversification': [
      { question: 'What is risk in investing?', options: ['The chance of losing money', 'The chance of earning more taxes', 'The chance of getting dividends', 'The chance of no market movement'], correctIndex: 0, explanation: 'Risk is the possibility of losing value or money.' },
      { question: 'What is diversification?', options: ['Putting all money into one stock', 'Spreading money across many investments', 'Avoiding all risk', 'Only buying blue chips'], correctIndex: 1, explanation: 'Diversification reduces the impact of one bad investment.' },
      { question: 'Why do investors diversify across sectors?', options: ['To increase losses', 'To reduce the impact of one sector falling', 'To avoid all dividends', 'To shorten the holding period'], correctIndex: 1, explanation: 'Sector diversification balances portfolio performance.' },
      { question: 'What is position sizing?', options: ['Choosing how much money to put in each investment', 'Choosing company colors', 'Choosing a broker name', 'Choosing an IPO date'], correctIndex: 0, explanation: 'Position sizing controls how much risk each investment carries.' },
      { question: 'What is a common beginner rule for single-stock exposure?', options: ['100% in one stock', '5–10% or less of a portfolio', 'No more than 1 share', 'No more than one sector'], correctIndex: 1, explanation: 'Smaller single-stock allocations help limit major damage.' },
      { question: 'Why is diversification helpful?', options: ['It guarantees gains', 'It lowers the risk of a single failure hurting everything', 'It eliminates risk forever', 'It makes all stocks identical'], correctIndex: 1, explanation: 'It spreads risk across many holdings.' },
      { question: 'What is one downside of too much concentration?', options: ['It makes your portfolio safer', 'One bad holding can hurt your whole portfolio', 'It reduces taxes', 'It makes buying easy'], correctIndex: 1, explanation: 'Concentration means one investment can dominate your outcome.' },
      { question: 'If one company falls sharply, what does diversification help with?', options: ['It removes all losses', 'It reduces the effect on your total portfolio', 'It guarantees recovery', 'It increases fees'], correctIndex: 1, explanation: 'Diversified portfolios are less dependent on one company’s performance.' },
    ],
    'key-financial-terms': [
      { question: 'What is market cap?', options: ['The number of shares sold today', 'The total value of a company based on share price and shares outstanding', 'The cost of dividends', 'The price you paid for a stock'], correctIndex: 1, explanation: 'Market cap gives a quick estimate of a company’s total size.' },
      { question: 'What does a P/E ratio show?', options: ['The age of the company', 'How much investors pay for each dollar of earnings', 'The dividend amount', 'The number of products sold'], correctIndex: 1, explanation: 'P/E tells you how expensive a stock is relative to earnings.' },
      { question: 'What does EPS mean?', options: ['Earnings per share', 'Equity percentage share', 'Expense projection score', 'Expected price increase'], correctIndex: 0, explanation: 'EPS measures profit per share.' },
      { question: 'What is dividend yield?', options: ['The company’s tax rate', 'The annual dividend as a percentage of stock price', 'The growth rate of the stock', 'The company’s debt level'], correctIndex: 1, explanation: 'Dividend yield shows income potential from dividends.' },
      { question: 'Why is volume useful?', options: ['It shows trading activity and liquidity', 'It replaces earnings data', 'It measures CEO confidence', 'It predicts interest rates'], correctIndex: 0, explanation: 'Volume indicates how easily a stock can be bought or sold.' },
      { question: 'What is a 52-week high?', options: ['The lowest price in a year', 'The highest price in the past year', 'The first price of the month', 'The dividend payment amount'], correctIndex: 1, explanation: 'The 52-week high shows the highest trade price over the last year.' },
      { question: 'Why compare ratios within the same industry?', options: ['Because every industry is the same', 'Because different industries have different normal ranges', 'Because only one ratio matters', 'Because stock prices are always equal'], correctIndex: 1, explanation: 'Valuation metrics are most useful when compared with similar companies.' },
      { question: 'What does a high P/E often suggest?', options: ['The company is definitely cheap', 'Investors expect strong future growth', 'The stock is always safe', 'The dividend is zero'], correctIndex: 1, explanation: 'High P/E ratios often reflect expectations of rapid growth.' },
    ],
    'researching-stocks': [
      { question: 'What should you understand before investing?', options: ['The company’s business model', 'Only the stock price', 'Only the ticker symbol', 'Only the news headline'], correctIndex: 0, explanation: 'You should understand what the company actually does.' },
      { question: 'Which financial statements help assess health?', options: ['Only the balance sheet', 'Income statement, balance sheet, and cash flow statement', 'Only the news', 'Only the dividend history'], correctIndex: 1, explanation: 'These statements provide a fuller picture of business health.' },
      { question: 'What is a moat?', options: ['A company’s debt load', 'A competitive advantage that protects profits', 'A stock price target', 'A type of chart'], correctIndex: 1, explanation: 'A moat is a competitive edge that helps a company stay strong.' },
      { question: 'Why is valuation important?', options: ['To see if a stock is fairly priced', 'To always buy the highest-priced stock', 'To avoid dividends', 'To eliminate risk'], correctIndex: 0, explanation: 'Valuation helps you avoid overpaying for a stock.' },
      { question: 'What does insider buying often signal?', options: ['The company is failing', 'Management believes the stock may be undervalued', 'The stock is overvalued', 'The company is closing'], correctIndex: 1, explanation: 'Insider buying can indicate optimism from company leadership.' },
      { question: 'What is a good first step in research?', options: ['Read the company’s earnings press release', 'Ignore the business model', 'Only follow social media', 'Buy immediately'], correctIndex: 0, explanation: 'A good first step is to understand what the company does and how it earns money.' },
      { question: 'What should you look for in a company’s financial health?', options: ['Only the stock price trend', 'Revenue growth, profitability, and debt levels', 'Only the social media buzz', 'Only the number of shares'], correctIndex: 1, explanation: 'Healthy companies usually show improving fundamentals.' },
      { question: 'What is the benefit of doing your own research?', options: ['It guarantees profits', 'It helps you avoid hype-driven decisions', 'It makes stock prices stable', 'It removes all losses'], correctIndex: 1, explanation: 'Independent research reduces the chance of buying for the wrong reasons.' },
    ],
    'common-mistakes': [
      { question: 'What is one of the biggest beginner mistakes?', options: ['Buying only blue chips', 'Panic selling during drops', 'Ignoring all news', 'Buying no stocks'], correctIndex: 1, explanation: 'Panic selling often turns temporary losses into lasting regret.' },
      { question: 'Why is chasing hype dangerous?', options: ['It always creates profits', 'You often buy after the price has already risen a lot', 'It is the best way to build a portfolio', 'It reduces risk'], correctIndex: 1, explanation: 'Hype often appears at the wrong time for investors.' },
      { question: 'What does diversification help prevent?', options: ['All gains', 'A single bad investment hurting everything', 'All market losses', 'Low dividend yields'], correctIndex: 1, explanation: 'Diversification reduces concentration risk.' },
      { question: 'What is dollar-cost averaging?', options: ['Investing a fixed amount regularly', 'Buying only once a year', 'Trading on every rumor', 'Selling everything in a panic'], correctIndex: 0, explanation: 'Dollar-cost averaging smooths out the impact of buy timing.' },
      { question: 'Why do frequent trades increase costs?', options: ['They reduce taxes', 'They can create fees and taxes', 'They always increase returns', 'They are free'], correctIndex: 1, explanation: 'Frequent trading can add commissions and taxable events.' },
      { question: 'What is “time in the market”?', options: ['Avoiding all stocks', 'Staying invested over time instead of trying to predict every move', 'Selling as soon as the price rises', 'Only trading once a month'], correctIndex: 1, explanation: 'Staying invested over time often outperforms frequent market timing.' },
      { question: 'What can emotional investing lead to?', options: ['Better long-term returns', 'Poor decisions and unnecessary losses', 'Higher dividends', 'Lower stock prices'], correctIndex: 1, explanation: 'Emotion often causes buying and selling at the worst times.' },
      { question: 'What should you do before buying a stock?', options: ['Buy based only on excitement', 'Do your own research', 'Buy all the popular stocks', 'Ignore the basics'], correctIndex: 1, explanation: 'Research helps prevent emotional or hype-driven mistakes.' },
    ],
    'building-portfolio': [
      { question: 'What is the best place to begin investing?', options: ['With a plan that fits your budget', 'With as much money as possible', 'With a single risky stock', 'With a margin account'], correctIndex: 0, explanation: 'Consistency and a realistic plan matter more than starting big.' },
      { question: 'What is the core-satellite strategy?', options: ['Only buying one stock', 'Using stable core holdings plus smaller growth positions', 'Only investing in bonds', 'Ignoring rebalancing'], correctIndex: 1, explanation: 'This strategy blends stability with upside potential.' },
      { question: 'Why rebalance a portfolio?', options: ['To ignore growth', 'To keep your desired mix of investments', 'To increase taxes', 'To make the portfolio smaller'], correctIndex: 1, explanation: 'Rebalancing helps maintain your intended allocation.' },
      { question: 'When should you sell a stock?', options: ['Only when it rises', 'When the company’s fundamentals change for the worse', 'Whenever you feel nervous', 'On every market drop'], correctIndex: 1, explanation: 'Fundamentals matter more than short-term emotion.' },
      { question: 'What matters more than a large starting amount?', options: ['A high-risk bet', 'Consistency over time', 'Frequent trading', 'Using borrowed money'], correctIndex: 1, explanation: 'Steady investing often beats trying to make a huge first move.' },
      { question: 'What is one benefit of a diversified portfolio?', options: ['It eliminates all losses', 'It reduces the impact of any one investment falling hard', 'It guarantees dividends', 'It removes taxes'], correctIndex: 1, explanation: 'Diversification smooths the effect of bad news in one position.' },
      { question: 'What is a good first goal for a beginner portfolio?', options: ['To get rich overnight', 'To build a simple, balanced plan you can maintain', 'To buy the most expensive stocks', 'To avoid all risks'], correctIndex: 1, explanation: 'A simple, maintainable plan is usually better than chasing quick wins.' },
      { question: 'What is one of the easiest ways to stay disciplined?', options: ['Trade every day', 'Follow a written plan and invest regularly', 'Ignore your goals', 'Panic during losses'], correctIndex: 1, explanation: 'A written plan helps you stick to your strategy through market noise.' },
    ],
  }

  return quizMap[moduleId] || [
    { question: 'What is one important idea from this module?', options: ['Learning the basics', 'Ignoring the topic', 'Skipping practice', 'Avoiding questions'], correctIndex: 0, explanation: 'This module is meant to build a strong foundation for future learning.' },
    { question: 'Why does this module matter?', options: ['It is optional only', 'It helps you build better investing habits', 'It is only for experts', 'It replaces all other study'], correctIndex: 1, explanation: 'Every module is designed to improve your confidence and decision-making.' },
    { question: 'How should you learn this topic?', options: ['By rushing through it', 'By taking your time and reviewing the lessons', 'By avoiding practice', 'By ignoring examples'], correctIndex: 1, explanation: 'Steady review and reflection improve understanding.' },
    { question: 'What is a good next step?', options: ['Stop learning', 'Apply one idea from the module to your plan', 'Buy a random stock', 'Ignore the quiz'], correctIndex: 1, explanation: 'Applying what you learn makes the ideas stick.' },
    { question: 'Which habit helps build knowledge?', options: ['Skipping notes', 'Reviewing important concepts', 'Trading blindly', 'Panic selling'], correctIndex: 1, explanation: 'Review reinforces your understanding of the key ideas.' },
    { question: 'Why are examples useful?', options: ['They make learning less practical', 'They connect ideas to real-world situations', 'They create confusion', 'They increase fear'], correctIndex: 1, explanation: 'Examples make abstract concepts easier to understand.' },
    { question: 'How should you approach the module?', options: ['As a checklist of things to memorize only', 'As a foundation for future decisions', 'As a reason to rush', 'As a way to avoid asking questions'], correctIndex: 1, explanation: 'This module is meant to support long-term financial growth and confidence.' },
    { question: 'What should you remember?', options: ['You can learn step by step', 'You must know everything immediately', 'You should ignore the basics', 'You should only follow hype'], correctIndex: 0, explanation: 'Investing becomes easier when you learn gradually and consistently.' },
  ]
}

function ModuleIllustration({ moduleId }: { moduleId: string }) {
  const visual = MODULE_VISUALS[moduleId] || MODULE_VISUALS['building-portfolio']

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-[#00B4D8]/10 to-purple-500/10 p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-white/80 text-2xl shadow-sm">
          {visual.emoji}
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">{visual.title}</h4>
          <p className="text-xs text-muted-foreground">{visual.subtitle}</p>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── Module Component ─────────────────────────── */

function ModuleCard({
  module,
  index,
  onModuleComplete,
  userId,
}: {
  module: Module
  index: number
  onModuleComplete?: () => void
  userId?: number | null
}) {
  const [expanded, setExpanded] = useState(false)
  const [currentLesson, setCurrentLesson] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [completed, setCompleted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(getUserScopedKey(userId, `MM_LEARN_${module.id}`)) === 'true'
    }
    return false
  })

  const quizQuestions = getQuizQuestions(module.id)
  const whyItMatters = getModuleWhyItMatters(module.id)
  const progressKey = getUserScopedKey(userId, `MM_LEARN_${module.id}`)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setCompleted(localStorage.getItem(progressKey) === 'true')
  }, [progressKey])

  const handleQuizAnswer = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return
    setQuizAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }))
  }

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true)
    const correctCount = quizQuestions.reduce((acc, q, i) => {
      return acc + (quizAnswers[i] === q.correctIndex ? 1 : 0)
    }, 0)
    if (correctCount >= Math.ceil(quizQuestions.length / 2)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(progressKey, 'true')
        localStorage.setItem(getUserScopedKey(userId, 'MM_BASICS_COMPLETED'), 'true')
      }
      setCompleted(true)
      onModuleComplete?.()
    }
  }

  const resetQuiz = () => {
    setQuizAnswers({})
    setQuizSubmitted(false)
  }

  const quizScore = quizQuestions.reduce((acc, q, i) => {
    return acc + (quizAnswers[i] === q.correctIndex ? 1 : 0)
  }, 0)

  const allQuizAnswered = Object.keys(quizAnswers).length === quizQuestions.length

  return (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-2xl border transition-all duration-300',
        expanded ? `${module.borderColor} shadow-lg` : 'border-border/60 hover:border-border hover:shadow-md',
        completed && !expanded && 'border-emerald-500/30 bg-emerald-50/5'
      )}
    >
      {/* Module Header (always visible) */}
      <button
        onClick={() => { setExpanded(!expanded); setQuizStarted(false); setQuizSubmitted(false); setQuizAnswers({}); setCurrentLesson(0) }}
        className="w-full text-left p-5 sm:p-6 flex items-start gap-4 cursor-pointer"
      >
        {/* Module number + icon */}
        <div className={cn(
          'relative shrink-0 flex size-12 items-center justify-center rounded-2xl border bg-gradient-to-br transition-all duration-300',
          module.bgGradient, module.borderColor,
          expanded && 'scale-110'
        )}>
          <span className={module.color}>{module.icon}</span>
          {completed && (
            <div className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
              <CheckCircle2 className="size-3" />
            </div>
          )}
        </div>

        {/* Title & meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold text-muted-foreground">MODULE {index + 1}</span>
            <Badge variant="outline" className={cn('text-[10px] px-2 py-0 font-bold', DIFF_BADGE[module.difficulty])}>
              {module.difficulty}
            </Badge>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" /> {module.readTime}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight">{module.title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">{module.subtitle}</p>
        </div>

        {/* Expand arrow */}
        <div className={cn(
          'shrink-0 flex size-8 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-transform duration-300',
          expanded && 'rotate-180'
        )}>
          <ChevronDown className="size-4" />
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border/60 animate-in slide-in-from-top-2 duration-300">

          {/* Module intro card */}
          {!quizStarted && (
            <div className="px-5 sm:px-6 pt-4 space-y-3">
              <ModuleIllustration moduleId={module.id} />
              <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
                <h4 className="text-sm font-bold text-foreground mb-2">Why this matters</h4>
                <ul className="space-y-1.5">
                  {whyItMatters.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Lesson Navigation Tabs */}
          {!quizStarted && (
            <div className="px-5 sm:px-6 pt-4 pb-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
                {module.lessons.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentLesson(i)}
                    className={cn(
                      'shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                      i === currentLesson
                        ? `${module.bgGradient} ${module.color} border ${module.borderColor} shadow-sm`
                        : 'text-muted-foreground hover:bg-secondary'
                    )}
                  >
                    <span>{module.lessons[i].icon}</span>
                    <span className="hidden sm:inline">Lesson {i + 1}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </button>
                ))}
                <button
                  onClick={() => setQuizStarted(true)}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 transition-all ml-auto cursor-pointer"
                >
                  <Brain className="size-3.5" /> Quiz
                </button>
              </div>
            </div>
          )}

          {/* Lesson Content */}
          {!quizStarted && (
            <div className="px-5 sm:px-6 pb-5 sm:pb-6">
              <div className="rounded-2xl border border-border/60 bg-secondary/30 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{module.lessons[currentLesson].icon}</span>
                  <div className="space-y-2 flex-1">
                    <h4 className="text-sm sm:text-base font-bold text-foreground">{module.lessons[currentLesson].title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{module.lessons[currentLesson].content}</p>
                    <div className="rounded-xl border border-border/40 bg-white/70 p-3 text-[11px] leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground">Context:</span>{' '}
                      {getLessonContext(module.id, currentLesson, module.lessons[currentLesson].title)}
                    </div>
                    <div className="rounded-xl border border-border/40 bg-white/70 p-3 text-[11px] leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground">Deep dive:</span>{' '}
                      {module.lessons[currentLesson].highlight
                        ? `${module.lessons[currentLesson].highlight} `
                        : ''}
                      Think of this idea as a core building block for the rest of your investing journey. The clearer you understand it, the easier later topics like valuation, risk control, and portfolio building will feel.
                    </div>
                    {module.lessons[currentLesson].highlight && (
                      <div className={cn('rounded-xl border p-3 text-xs font-bold flex items-start gap-2', module.bgGradient, module.borderColor)}>
                        <Lightbulb className={cn('size-4 shrink-0 mt-0.5', module.color)} />
                        <span className={module.color}>{module.lessons[currentLesson].highlight}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prev / Next buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <button
                    onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
                    disabled={currentLesson === 0}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {currentLesson + 1} / {module.lessons.length}
                  </span>
                  {currentLesson < module.lessons.length - 1 ? (
                    <button
                      onClick={() => setCurrentLesson(currentLesson + 1)}
                      className={cn('text-xs font-bold cursor-pointer flex items-center gap-1', module.color)}
                    >
                      Next <ChevronRight className="size-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setQuizStarted(true)}
                      className="text-xs font-bold text-amber-400 cursor-pointer flex items-center gap-1"
                    >
                      Take Quiz <Brain className="size-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Key Takeaways */}
              <div className="mt-4 rounded-2xl border border-border/60 bg-secondary/20 p-4">
                <h5 className="text-xs font-bold text-foreground flex items-center gap-2 mb-2.5">
                  <Star className="size-3.5 text-amber-400" /> Key Takeaways
                </h5>
                <ul className="space-y-1.5">
                  {module.keyTakeaways.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Quiz Section */}
          {quizStarted && (
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="size-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-foreground">Knowledge Check</h4>
                </div>
                <button
                  onClick={() => { setQuizStarted(false); resetQuiz() }}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ← Back to Lessons
                </button>
              </div>

              {quizQuestions.map((q, qi) => (
                <div key={qi} className="rounded-2xl border border-border/60 bg-secondary/30 p-4 space-y-3">
                  <p className="text-sm font-bold text-foreground">
                    <span className="text-muted-foreground mr-2">Q{qi + 1}.</span> {q.question}
                  </p>
                  <div className="grid gap-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = quizAnswers[qi] === oi
                      const isCorrect = q.correctIndex === oi
                      const showResult = quizSubmitted

                      return (
                        <button
                          key={oi}
                          onClick={() => handleQuizAnswer(qi, oi)}
                          disabled={quizSubmitted}
                          className={cn(
                            'flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-xs font-medium transition-all cursor-pointer disabled:cursor-default',
                            !showResult && isSelected && 'border-[#00B4D8] bg-[#00B4D8]/10 text-foreground',
                            !showResult && !isSelected && 'border-border/60 hover:border-border hover:bg-secondary/50 text-muted-foreground',
                            showResult && isCorrect && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
                            showResult && isSelected && !isCorrect && 'border-red-500/40 bg-red-500/10 text-red-400',
                            showResult && !isSelected && !isCorrect && 'border-border/40 text-muted-foreground/50',
                          )}
                        >
                          <span className={cn(
                            'flex size-6 items-center justify-center rounded-full border text-[10px] font-bold shrink-0',
                            !showResult && isSelected && 'border-[#00B4D8] bg-[#00B4D8] text-white',
                            !showResult && !isSelected && 'border-border',
                            showResult && isCorrect && 'border-emerald-500 bg-emerald-500 text-white',
                            showResult && isSelected && !isCorrect && 'border-red-500 bg-red-500 text-white',
                          )}>
                            {showResult && isCorrect ? '✓' : showResult && isSelected && !isCorrect ? '✕' : String.fromCharCode(65 + oi)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      )
                    })}
                  </div>
                  {quizSubmitted && (
                    <div className={cn(
                      'rounded-xl border p-3 text-xs',
                      quizAnswers[qi] === q.correctIndex
                        ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
                        : 'border-amber-500/30 bg-amber-500/5 text-amber-400'
                    )}>
                      <span className="font-bold">{quizAnswers[qi] === q.correctIndex ? '✅ Correct!' : '💡 Explanation:'}</span>{' '}
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}

              {/* Quiz Actions */}
              <div className="flex items-center justify-between pt-2">
                {!quizSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={!allQuizAnswered}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition-all cursor-pointer',
                      allQuizAnswered
                        ? 'bg-gradient-to-r from-[#00B4D8] to-[#0891b2] text-white shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5'
                        : 'bg-secondary text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    <Zap className="size-4" /> Submit Answers
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'rounded-xl px-4 py-2 text-sm font-bold',
                      quizScore === quizQuestions.length
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : quizScore >= Math.ceil(quizQuestions.length / 2)
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-red-500/15 text-red-400'
                    )}>
                      {quizScore === quizQuestions.length ? '🏆' : quizScore >= Math.ceil(quizQuestions.length / 2) ? '👍' : '📚'}{' '}
                      {quizScore}/{quizQuestions.length} correct
                    </div>
                    {quizScore < quizQuestions.length && (
                      <button
                        onClick={resetQuiz}
                        className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                )}
                {quizSubmitted && completed && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="size-4" /> Module Complete!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

/* ─────────────────────────── Prof Algo Basics Modal ─────────────────────────── */

function ProfAlgoBasicsGuideModal({
  isOpen,
  mode,
  onClose,
  onContinue,
}: {
  isOpen: boolean
  mode: 'welcome' | 'completed'
  onClose: () => void
  onContinue?: () => void
}) {
  if (!isOpen) return null

  const isWelcome = mode === 'welcome'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-4 border-[#0F172A] bg-card p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-6 animate-pop">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <AIBuddyPortrait size={64} speaking={true} floating={true} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#00B4D8] px-3 py-0.5 text-[10px] font-extrabold uppercase text-white border border-[#0F172A] shadow-sm">
              <Sparkles className="size-3 fill-yellow-200" />
              Prof. Algo
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground mt-1">
              {isWelcome ? 'Welcome to MarketMind! 🚀' : 'Basics Mastered! 🎉'}
            </h2>
          </div>
        </div>

        {/* Speech Card */}
        <div className="rounded-2xl border-2 border-[#0F172A] bg-[#ECFEFF] p-5 text-slate-800 font-bold leading-relaxed space-y-3 shadow-inner">
          <p className="text-sm md:text-base">
            {isWelcome ? (
              <>
                Bzzzt! Connection active! Welcome to <strong>MarketMind</strong>! 🧠 I&apos;m Prof. Algo, your personal market mentor.
                <br /><br />
                Before diving into real-world case studies and trading, let&apos;s complete the <strong>Market Basics</strong> lessons right here! Master these fundamentals so you can analyze stocks and market trends like a veteran.
              </>
            ) : (
              <>
                Phenomenal work! 🌟 You have successfully completed the <strong>Market Basics</strong>! Your financial knowledge circuits are now fully powered up.
                <br /><br />
                Now, let&apos;s continue with your <strong>First Case Study</strong> to apply your learning to real-world market scenarios!
              </>
            )}
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              onClose()
              if (!isWelcome && onContinue) {
                onContinue()
              }
            }}
            className="w-full rounded-2xl bg-[#00E5FF] hover:bg-[#00B4D8] text-[#0F172A] text-base md:text-lg font-black px-6 py-4 border-4 border-[#0F172A] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[-2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="size-5 fill-yellow-200" />
            {isWelcome ? "Let's Learn the Basics! 📖" : "Continue to First Case Study 🚀"}
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── Main Page ─────────────────────────── */

export default function LearningBasicsPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const [modalMode, setModalMode] = useState<'welcome' | 'completed' | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const welcomeSeen = localStorage.getItem(getUserScopedKey(user?.id, 'MM_LEARN_WELCOME_SEEN')) === 'true'
    if (!welcomeSeen) {
      setModalMode('welcome')
      localStorage.setItem(getUserScopedKey(user?.id, 'MM_LEARN_WELCOME_SEEN'), 'true')
    }
  }, [user?.id])

  const handleModuleComplete = () => {
    if (typeof window === 'undefined') return
    const completedFlashKey = getUserScopedKey(user?.id, 'MM_LEARN_COMPLETED_FLASH_SEEN')
    const basicsCompletedKey = getUserScopedKey(user?.id, 'MM_BASICS_COMPLETED')
    const completedFlashSeen = localStorage.getItem(completedFlashKey) === 'true'
    if (!completedFlashSeen) {
      localStorage.setItem(completedFlashKey, 'true')
      localStorage.setItem(basicsCompletedKey, 'true')
      setModalMode('completed')
    }
  }

  const completedCount = MODULES.reduce((acc, m) => {
    if (typeof window !== 'undefined' && localStorage.getItem(getUserScopedKey(user?.id, `MM_LEARN_${m.id}`)) === 'true') {
      return acc + 1
    }
    return acc
  }, 0)

  const progressPct = Math.round((completedCount / MODULES.length) * 100)

  return (
    <>
      <ProfAlgoBasicsGuideModal
        isOpen={modalMode !== null}
        mode={modalMode || 'welcome'}
        onClose={() => setModalMode(null)}
        onContinue={() => router.push('/case-studies')}
      />

      <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <AIBuddyPortrait size={70} speaking={false} floating={true} />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#00B4D8] text-white border border-[#0F172A] px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shadow-sm whitespace-nowrap">
                  Prof. Algo
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="size-5 text-[#00B4D8]" />
                  <h1 className="text-2xl font-bold tracking-tight">
                    {t('Learning the basics', 'बेसिक्स सीखें')}
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground max-w-lg">
                  {t(
                    'Master the fundamentals of investing and the stock market through interactive lessons and quizzes. Complete all modules to become a confident investor!',
                    'इंटरैक्टिव पाठों और क्विज़ के माध्यम से निवेश और शेयर बाजार की बुनियादी बातें सीखें। एक आत्मविश्वासी निवेशक बनने के लिए सभी मॉड्यूल पूरे करें!'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-amber-400" />
                <span className="text-sm font-bold text-foreground">
                  {t('Your Progress', 'आपकी प्रगति')}
                </span>
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                {completedCount}/{MODULES.length} {t('modules', 'मॉड्यूल')}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00B4D8] to-emerald-500 transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-muted-foreground">
                {progressPct === 100 ? '🎉 All modules completed!' : `${progressPct}% complete`}
              </span>
              {progressPct === 100 && (
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px]">
                  <Sparkles className="size-3 mr-1" /> Investment Basics Mastered
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Module List */}
        <div className="space-y-4">
          {MODULES.map((module, i) => (
            <ModuleCard
              key={module.id}
              module={module}
              index={i}
              onModuleComplete={handleModuleComplete}
              userId={user?.id ?? null}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-[#00B4D8]/5 to-purple-500/5 p-6 text-center space-y-3">
          <h3 className="text-lg font-bold text-foreground">
            {t('Ready to Apply Your Knowledge?', 'अपना ज्ञान लागू करने के लिए तैयार?')}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t(
              'Head to the Dashboard to buy your first stocks, or try the Case Studies for real-world market scenarios!',
              'अपने पहले शेयर खरीदने के लिए डैशबोर्ड पर जाएं, या वास्तविक बाज़ार परिदृश्यों के लिए केस स्टडीज़ आज़माएं!'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5 transition-all"
            >
              <TrendingUp className="size-4" /> {t('Go to Dashboard', 'डैशबोर्ड पर जाएं')}
            </a>
            <a
              href="/case-studies"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-6 py-3 text-sm font-bold text-foreground hover:bg-secondary transition-all"
            >
              <BookOpen className="size-4" /> {t('Case Studies', 'केस स्टडीज़')}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
