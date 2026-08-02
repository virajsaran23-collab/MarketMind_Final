'use client'

import { useState, useEffect } from 'react'
import {
  Sparkles,
  Trophy,
  Zap,
  TrendingUp,
  TrendingDown,
  Gamepad2,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Wallet,
  Target,
  Lightbulb,
  Clock3,
  HelpCircle,
  Award,
  Info,
  LineChart,
  Activity,
  ChevronRight,
  Play,
  Check,
  Building2,
  DollarSign,
  Layers,
  ShieldCheck,
  Brain,
  BarChart3,
  Compass,
} from 'lucide-react'
import { AIBuddyPortrait } from './ai-buddy-portrait'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

/* ────────────────────────────────────── Stock & Asset Types ────────────────────────────── */
export type PurchasedStock = {
  id: string
  symbol: string
  name: string
  icon: string
  category: string
  shares: number
  avgPrice: number
  currentPrice: number
  totalValue: number
  returnPct: number
  growthDriver: string
}

const STOCK_ICON_MAP: Record<string, string> = {
  AAPL: '📱',
  MSFT: '💻',
  TSLA: '⚡',
  NVDA: '🧠',
  AMZN: '📦',
  DIS: '🏰',
  NKE: '👟',
  KO: '🥤',
  NFLX: '🎬',
  AMD: '🧩',
  GOOG: '🔎',
  GOOGL: '🔎',
  META: '🌐',
  PYPL: '💳',
  COIN: '🪙',
}

const getAssetIcon = (symbol: string) => {
  return STOCK_ICON_MAP[symbol.toUpperCase()] || '📈'
}

const DEFAULT_PURCHASED_STOCKS: PurchasedStock[] = [
  {
    id: 'aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    icon: '📱',
    category: 'Technology',
    shares: 12,
    avgPrice: 172.5,
    currentPrice: 189.4,
    totalValue: 2272.8,
    returnPct: 9.8,
    growthDriver: 'Consumer product demand, App Store ecosystem, and AI integration across hardware.',
  },
  {
    id: 'nvda',
    symbol: 'NVDA',
    name: 'Nvidia Corp.',
    icon: '🧠',
    category: 'Semiconductors',
    shares: 8,
    avgPrice: 420.0,
    currentPrice: 495.2,
    totalValue: 3961.6,
    returnPct: 17.9,
    growthDriver: 'Data center AI chip demand, GPU dominance, and high gross margin growth.',
  },
  {
    id: 'tsla',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    icon: '⚡',
    category: 'Automotive & Energy',
    shares: 15,
    avgPrice: 215.0,
    currentPrice: 242.8,
    totalValue: 3642.0,
    returnPct: 12.9,
    growthDriver: 'EV vehicle deliveries, battery technology advances, and autonomous driving tech.',
  },
  {
    id: 'dis',
    symbol: 'DIS',
    name: 'Walt Disney Co.',
    icon: '🏰',
    category: 'Entertainment',
    shares: 20,
    avgPrice: 92.0,
    currentPrice: 104.5,
    totalValue: 2090.0,
    returnPct: 13.6,
    growthDriver: 'Theme park attendance, movie box office, and streaming subscriber growth.',
  },
  {
    id: 'nke',
    symbol: 'NKE',
    name: 'Nike Inc.',
    icon: '👟',
    category: 'Consumer Apparel',
    shares: 18,
    avgPrice: 98.2,
    currentPrice: 108.6,
    totalValue: 1954.8,
    returnPct: 10.6,
    growthDriver: 'Global brand strength, direct-to-consumer digital sales, and athlete endorsements.',
  },
  {
    id: 'msft',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    icon: '💻',
    category: 'Software & Cloud',
    shares: 10,
    avgPrice: 380.0,
    currentPrice: 412.5,
    totalValue: 4125.0,
    returnPct: 8.55,
    growthDriver: 'Azure cloud growth, enterprise software subscriptions, and Copilot AI tools.',
  },
]

/* ────────────────────────────────────── Game Scenario Templates ────────────────────────────── */
type ChartPoint = {
  day: string
  predicted: number
  actual: number
}

type SituationScenario = {
  id: string
  title: string
  emoji: string
  category: string
  headline: string
  story: string
  targetStockSymbol: string
  basicKnowledgeTip: string
  actualOutcomeDirection: 'up_strong' | 'up_moderate' | 'flat' | 'down'
  actualChangePct: number
  explanation: string
  chartData: ChartPoint[]
  q1: {
    question: string
    options: { id: string; text: string; isCorrect: boolean; explanation: string }[]
  }
  q2: {
    question: string
    options: { direction: 'up_strong' | 'up_moderate' | 'flat' | 'down'; label: string; range: string }[]
  }
  q3: {
    question: string
    options: { id: string; text: string; isCorrect: boolean; advice: string }[]
  }
}

const GENERATE_SCENARIOS_FOR_STOCK = (stock: PurchasedStock): SituationScenario[] => {
  const sym = stock.symbol
  const name = stock.name

  return [
    {
      id: `${sym}-earnings-beat`,
      title: `${name} Reports Q3 Earnings Beat!`,
      emoji: '📊',
      category: 'Earnings & Profit',
      headline: `${sym} crushes Wall Street profit estimates by 22% with record revenue.`,
      story: `Quarterly earnings show exploding sales figures. Financial analysts are upgrading their price targets as cash flow hits an all-time high.`,
      targetStockSymbol: sym,
      basicKnowledgeTip: `💡 Basic Stock Concept: When a company earns higher profits (earnings per share) than expected, investors see the stock as more valuable, driving stock price UP!`,
      actualOutcomeDirection: 'up_strong',
      actualChangePct: 18.5,
      explanation: `Strong earnings beat directly boosts valuation ratios (P/E ratio), causing heavy institutional buying in ${sym}.`,
      chartData: [
        { day: 'Day 0', predicted: stock.currentPrice, actual: stock.currentPrice },
        { day: 'Day 7', predicted: stock.currentPrice * 1.05, actual: stock.currentPrice * 1.07 },
        { day: 'Day 14', predicted: stock.currentPrice * 1.1, actual: stock.currentPrice * 1.12 },
        { day: 'Day 21', predicted: stock.currentPrice * 1.14, actual: stock.currentPrice * 1.15 },
        { day: 'Day 30', predicted: stock.currentPrice * 1.18, actual: stock.currentPrice * 1.185 },
      ],
      q1: {
        question: `Why does a higher profit report cause ${sym}'s stock price to grow?`,
        options: [
          {
            id: 'a',
            text: `Higher profits prove the business model is making more money per share, making investors willing to pay more.`,
            isCorrect: true,
            explanation: `Correct! Stock price is closely tied to earnings. Higher earnings = higher intrinsic value.`,
          },
          {
            id: 'b',
            text: `High earnings cause the company to issue free money to random buyers.`,
            isCorrect: false,
            explanation: `Incorrect. Profits belong to shareholders and fund growth or dividends, not random handouts.`,
          },
          {
            id: 'c',
            text: `Earnings reports have no effect on stock prices; only luck determines price.`,
            isCorrect: false,
            explanation: `Incorrect. Fundamentals like revenue and profit are the primary long-term drivers of stock value.`,
          },
        ],
      },
      q2: {
        question: `Based on this strong earnings beat, predict ${sym}'s price movement over 30 days:`,
        options: [
          { direction: 'up_strong', label: '🚀 Strong Rally (+15% to +22%)', range: '+15% to +22%' },
          { direction: 'up_moderate', label: '📈 Slight Growth (+4% to +8%)', range: '+4% to +8%' },
          { direction: 'flat', label: '➡️ Flat / No Change (0%)', range: '0%' },
          { direction: 'down', label: '📉 Pullback / Decline (-10%)', range: '-10%' },
        ],
      },
      q3: {
        question: `What is the smartest investment strategy for a long-term holder of ${sym} during an earnings surge?`,
        options: [
          {
            id: 'hold_compound',
            text: `Hold your position to let long-term compound growth take effect, or buy more on minor dips.`,
            isCorrect: true,
            advice: `Excellent! Panic selling after good news cuts off long-term compounding benefits.`,
          },
          {
            id: 'sell_all',
            text: `Immediately sell all your shares in fear that the company will go out of business tomorrow.`,
            isCorrect: false,
            advice: `Selling quality companies right after strong earnings beat often forfeits multi-year gains.`,
          },
          {
            id: 'ignore',
            text: `Never look at your portfolio and check back in 50 years.`,
            isCorrect: false,
            advice: `Monitoring fundamental news periodically helps you stay informed without emotional overreaction.`,
          },
        ],
      },
    },
    {
      id: `${sym}-product-breakthrough`,
      title: `Next-Gen Breakthrough Unveiled by ${sym}`,
      emoji: '🚀',
      category: 'Innovation & Demand',
      headline: `${sym} announces revolutionary technology, capturing massive customer pre-orders!`,
      story: `${sym} held a global product keynote revealing a brand new product line. Customer pre-orders shattered historical records within 24 hours.`,
      targetStockSymbol: sym,
      basicKnowledgeTip: `💡 Basic Stock Concept: New innovative products create fresh revenue streams and customer demand. Anticipated future profits push the stock price higher!`,
      actualOutcomeDirection: 'up_strong',
      actualChangePct: 14.2,
      explanation: `Record pre-orders indicate strong future revenue growth for ${sym}, inspiring investor confidence across Wall Street.`,
      chartData: [
        { day: 'Day 0', predicted: stock.currentPrice, actual: stock.currentPrice },
        { day: 'Day 7', predicted: stock.currentPrice * 1.04, actual: stock.currentPrice * 1.06 },
        { day: 'Day 14', predicted: stock.currentPrice * 1.08, actual: stock.currentPrice * 1.09 },
        { day: 'Day 21', predicted: stock.currentPrice * 1.11, actual: stock.currentPrice * 1.12 },
        { day: 'Day 30', predicted: stock.currentPrice * 1.14, actual: stock.currentPrice * 1.142 },
      ],
      q1: {
        question: `How does product innovation lead to stock price expansion for ${sym}?`,
        options: [
          {
            id: 'a',
            text: `Innovative products attract new customers, expanding future market share and projected profit growth.`,
            isCorrect: true,
            explanation: `Spot on! Demand drives future sales expectations, which investors price in immediately.`,
          },
          {
            id: 'b',
            text: `Product innovation forces the government to buy all stocks.`,
            isCorrect: false,
            explanation: `Incorrect. Stock price moves because private & institutional investors buy shares.`,
          },
          {
            id: 'c',
            text: `Innovations lower stock prices because new products cost money to build.`,
            isCorrect: false,
            explanation: `R&D costs money, but successful innovation yields far higher long-term return on investment.`,
          },
        ],
      },
      q2: {
        question: `Predict ${sym}'s stock price trend following record pre-orders:`,
        options: [
          { direction: 'up_strong', label: '🚀 Strong Growth (+12% to +18%)', range: '+12% to +18%' },
          { direction: 'up_moderate', label: '📈 Moderate Gain (+3% to +7%)', range: '+3% to +7%' },
          { direction: 'flat', label: '➡️ Stagnant (0%)', range: '0%' },
          { direction: 'down', label: '📉 Sharp Drop (-12%)', range: '-12%' },
        ],
      },
      q3: {
        question: `How does product success affect ${sym}'s competitive advantage (moat)?`,
        options: [
          {
            id: 'moat_strong',
            text: `It strengthens ${sym}'s market position, making it harder for competitors to steal customers.`,
            isCorrect: true,
            advice: `Spot on! An economic moat protects pricing power and profit margins.`,
          },
          {
            id: 'moat_weak',
            text: `It destroys the business because customers hate new technology.`,
            isCorrect: false,
            advice: `Record pre-orders prove high consumer appetite for the innovation.`,
          },
          {
            id: 'no_effect',
            text: `Competitive advantage does not matter in investing.`,
            isCorrect: false,
            advice: `Competitive advantages (moats) are key to durable long-term stock returns.`,
          },
        ],
      },
    },
    {
      id: `${sym}-supply-chain-delay`,
      title: `Global Component Bottleneck Hits ${sym}`,
      emoji: '📦',
      category: 'Supply & Operations',
      headline: `Key supplier delays delivery of essential components to ${sym} manufacturing plants.`,
      story: `Shipping delays and raw material shortages are slowing down ${sym}'s production lines. Analysts warn that quarterly sales might temporarily drop by 5-8%.`,
      targetStockSymbol: sym,
      basicKnowledgeTip: `💡 Basic Stock Concept: If a company cannot manufacture enough products to satisfy demand, near-term revenue falls, causing a temporary dip in stock price.`,
      actualOutcomeDirection: 'down',
      actualChangePct: -9.4,
      explanation: `Short-term supply shortages reduce expected quarterly revenue, causing short-term investors to take profits.`,
      chartData: [
        { day: 'Day 0', predicted: stock.currentPrice, actual: stock.currentPrice },
        { day: 'Day 7', predicted: stock.currentPrice * 0.97, actual: stock.currentPrice * 0.96 },
        { day: 'Day 14', predicted: stock.currentPrice * 0.94, actual: stock.currentPrice * 0.93 },
        { day: 'Day 21', predicted: stock.currentPrice * 0.92, actual: stock.currentPrice * 0.91 },
        { day: 'Day 30', predicted: stock.currentPrice * 0.91, actual: stock.currentPrice * 0.906 },
      ],
      q1: {
        question: `Why does a temporary supply delay cause a short-term stock price decline?`,
        options: [
          {
            id: 'a',
            text: `Lower product output means lower short-term sales and earnings, reducing quarterly guidance.`,
            isCorrect: true,
            explanation: `Correct! Reduced product supply translates directly into lower sales receipts for the quarter.`,
          },
          {
            id: 'b',
            text: `Supply chain issues mean the stock exchange deletes the stock forever.`,
            isCorrect: false,
            explanation: `Incorrect. Temporary operational hurdles don't destroy solvent companies.`,
          },
          {
            id: 'c',
            text: `Investors always prefer companies that cannot make products.`,
            isCorrect: false,
            explanation: `Incorrect. Unfulfilled demand frustrates buyers and delays revenue recognition.`,
          },
        ],
      },
      q2: {
        question: `Predict ${sym}'s price path over the next 30 days during this supply chain shock:`,
        options: [
          { direction: 'down', label: '📉 Moderate Dip (-6% to -12%)', range: '-6% to -12%' },
          { direction: 'flat', label: '➡️ Neutral / Side-ways (0%)', range: '0%' },
          { direction: 'up_moderate', label: '📈 Small Rise (+3% to +6%)', range: '+3% to +6%' },
          { direction: 'up_strong', label: '🚀 Huge Surge (+20%)', range: '+20%' },
        ],
      },
      q3: {
        question: `If ${sym}'s long-term business fundamentals remain strong despite the temporary supply bottleneck, what should a savvy investor do?`,
        options: [
          {
            id: 'buy_dip',
            text: `View temporary price dips as potential long-term buying opportunities if underlying demand is intact.`,
            isCorrect: true,
            advice: `Great strategy! Great investors look for temporary issues that don't damage long-term earning power.`,
          },
          {
            id: 'panic_sell',
            text: `Panic and sell at the lowest price possible.`,
            isCorrect: false,
            advice: `Selling on temporary bad news often lock in losses right before recovery.`,
          },
          {
            id: 'borrow_debt',
            text: `Borrow money from unverified sources to gamble on speculative options.`,
            isCorrect: false,
            advice: `Excessive leverage adds severe financial risk to your portfolio.`,
          },
        ],
      },
    },
    {
      id: `${sym}-interest-rate-cut`,
      title: `Central Bank Cuts Interest Rates!`,
      emoji: '🏛️',
      category: 'Macro Economy',
      headline: `Federal Reserve lowers benchmark interest rates, boosting market liquidity!`,
      story: `Lower interest rates make borrowing cheaper for companies like ${sym} to fund expansion, while making savings accounts pay lower returns, driving money into the stock market.`,
      targetStockSymbol: sym,
      basicKnowledgeTip: `💡 Basic Stock Concept: Lower interest rates reduce borrowing costs for growth companies and encourage investors to seek higher returns in stocks!`,
      actualOutcomeDirection: 'up_moderate',
      actualChangePct: 11.8,
      explanation: `Cheaper capital and broader market liquidity lift valuation multiples for quality stocks like ${sym}.`,
      chartData: [
        { day: 'Day 0', predicted: stock.currentPrice, actual: stock.currentPrice },
        { day: 'Day 7', predicted: stock.currentPrice * 1.03, actual: stock.currentPrice * 1.04 },
        { day: 'Day 14', predicted: stock.currentPrice * 1.06, actual: stock.currentPrice * 1.07 },
        { day: 'Day 21', predicted: stock.currentPrice * 1.09, actual: stock.currentPrice * 1.1 },
        { day: 'Day 30', predicted: stock.currentPrice * 1.11, actual: stock.currentPrice * 1.118 },
      ],
      q1: {
        question: `How do lower interest rates benefit companies like ${sym}?`,
        options: [
          {
            id: 'a',
            text: `Lower borrowing rates make it cheaper to finance R&D, factories, and expansion projects.`,
            isCorrect: true,
            explanation: `Correct! Reduced interest expense increases net profitability and fuels corporate growth.`,
          },
          {
            id: 'b',
            text: `Interest rates cuts mean stores give away products for $0.`,
            isCorrect: false,
            explanation: `Incorrect. Rates affect monetary borrowing costs, not retail price tags.`,
          },
          {
            id: 'c',
            text: `Central banks ban stocks when interest rates drop.`,
            isCorrect: false,
            explanation: `Incorrect. Rate cuts are designed to stimulate economy and asset investment.`,
          },
        ],
      },
      q2: {
        question: `Predict how ${sym}'s stock price will react to the rate cut environment:`,
        options: [
          { direction: 'up_moderate', label: '📈 Steady Climb (+8% to +14%)', range: '+8% to +14%' },
          { direction: 'up_strong', label: '🚀 Massive Spike (+30%)', range: '+30%' },
          { direction: 'flat', label: '➡️ No Reaction (0%)', range: '0%' },
          { direction: 'down', label: '📉 Sharp Crash (-15%)', range: '-15%' },
        ],
      },
      q3: {
        question: `Why do stock markets generally prefer low interest rate environments over high rate environments?`,
        options: [
          {
            id: 'return_yield',
            text: `Bonds and savings offer lower yields, pushing capital into equities for higher potential returns.`,
            isCorrect: true,
            advice: `Spot on! Investors compare expected returns across asset classes.`,
          },
          {
            id: 'no_taxes',
            text: `Low interest rates mean companies never pay taxes again.`,
            isCorrect: false,
            advice: `Tax law remains separate from central bank interest rates.`,
          },
          {
            id: 'banning',
            text: `High interest rates mean corporations close down completely.`,
            isCorrect: false,
            advice: `High rates slow down economic growth, but well-managed companies adapt.`,
          },
        ],
      },
    },
  ]
}

/* ────────────────────────────────────── Interactive Actual vs Predicted Chart ────────────────────────────── */
function InteractiveComparisonChart({
  chartData,
  userDirection,
  currentPrice,
}: {
  chartData: ChartPoint[]
  userDirection: 'up_strong' | 'up_moderate' | 'flat' | 'down' | ''
  currentPrice: number
}) {
  const width = 600
  const height = 240
  const padding = 35

  // Generate adjusted predicted curve based on user's choice
  const adjustedPredicted = chartData.map((pt, idx) => {
    let multiplier = 1
    if (userDirection === 'up_strong') multiplier = 1 + idx * 0.045
    else if (userDirection === 'up_moderate') multiplier = 1 + idx * 0.022
    else if (userDirection === 'flat') multiplier = 1 + (idx % 2 === 0 ? 0.005 : -0.005)
    else if (userDirection === 'down') multiplier = 1 - idx * 0.025
    else multiplier = pt.predicted / currentPrice

    return {
      day: pt.day,
      value: Number((currentPrice * multiplier).toFixed(2)),
    }
  })

  const actualPoints = chartData.map((pt) => ({
    day: pt.day,
    value: Number(pt.actual.toFixed(2)),
  }))

  const allVals = [...adjustedPredicted.map((p) => p.value), ...actualPoints.map((p) => p.value)]
  const minVal = Math.min(...allVals) * 0.97
  const maxVal = Math.max(...allVals) * 1.03

  const getSvgCoords = (val: number, index: number, total: number) => {
    const x = padding + (index / (total - 1)) * (width - padding * 2)
    const y = height - padding - ((val - minVal) / Math.max(maxVal - minVal, 1)) * (height - padding * 2)
    return { x, y }
  }

  const predCoords = adjustedPredicted.map((pt, i) => getSvgCoords(pt.value, i, adjustedPredicted.length))
  const actCoords = actualPoints.map((pt, i) => getSvgCoords(pt.value, i, actualPoints.length))

  const predPath = predCoords.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '')
  const actPath = actCoords.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '')

  const lastPred = adjustedPredicted[adjustedPredicted.length - 1].value
  const lastAct = actualPoints[actualPoints.length - 1].value
  const diffPct = Math.abs(((lastPred - lastAct) / lastAct) * 100).toFixed(1)
  const accuracyScore = Math.max(50, Math.min(100, Math.round(100 - Number(diffPct) * 2.5)))

  return (
    <div className="rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 text-white shadow-2xl space-y-4">
      {/* Chart Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <LineChart className="size-4" /> Trajectory Comparison Graph
          </div>
          <h4 className="text-base font-extrabold text-white mt-0.5">
            Your Prediction vs. Actual Market Outcome
          </h4>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-full text-cyan-300">
            <span className="size-2.5 rounded-full bg-cyan-400 animate-pulse" />
            Your Prediction
          </div>
          <div className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full text-amber-300">
            <span className="size-2.5 rounded-full bg-amber-400" />
            Actual Market Path
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="actGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          {[0, 1, 2, 3].map((i) => {
            const y = padding + i * ((height - padding * 2) / 3)
            return (
              <line
                key={i}
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="4 4"
              />
            )
          })}

          {/* User Prediction Line & Area */}
          <path
            d={`${predPath} L ${predCoords[predCoords.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`}
            fill="url(#predGradient)"
          />
          <path d={predPath} fill="none" stroke="#22d3ee" strokeWidth="3.5" strokeLinecap="round" />

          {/* Actual Market Path Line & Area */}
          <path
            d={`${actPath} L ${actCoords[actCoords.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`}
            fill="url(#actGradient)"
          />
          <path d={actPath} fill="none" stroke="#fbbf24" strokeWidth="3.5" strokeDasharray="6 3" strokeLinecap="round" />

          {/* Nodes */}
          {predCoords.map((pt, i) => (
            <g key={`pred-node-${i}`}>
              <circle cx={pt.x} cy={pt.y} r="5" fill="#0891b2" stroke="#22d3ee" strokeWidth="2" />
              <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#22d3ee" fontSize="10" fontWeight="bold">
                ${adjustedPredicted[i].value}
              </text>
            </g>
          ))}

          {actCoords.map((pt, i) => (
            <g key={`act-node-${i}`}>
              <circle cx={pt.x} cy={pt.y} r="5" fill="#b45309" stroke="#fbbf24" strokeWidth="2" />
              <text x={pt.x} y={pt.y + 18} textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">
                ${actualPoints[i].value}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Days Footer */}
      <div className="flex justify-between px-6 text-xs font-semibold text-slate-400 border-t border-slate-900 pt-2">
        {chartData.map((d) => (
          <span key={d.day}>{d.day}</span>
        ))}
      </div>

      {/* Accuracy & Variance Badge */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/40 p-3 text-center">
          <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Prediction Accuracy</div>
          <div className="text-xl font-extrabold text-cyan-200 mt-0.5">{accuracyScore}%</div>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/40 p-3 text-center">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Market Variance</div>
          <div className="text-xl font-extrabold text-amber-200 mt-0.5">±{diffPct}%</div>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-emerald-500/20 bg-emerald-950/40 p-3 text-center">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Final Price Hit</div>
          <div className="text-xl font-extrabold text-emerald-200 mt-0.5">${lastAct}</div>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────── Main Game Component ────────────────────────────── */
export function MarketPredictorGame() {
  const { showToast } = useAuth()

  // Purchased stocks state
  const [purchasedStocks, setPurchasedStocks] = useState<PurchasedStock[]>(DEFAULT_PURCHASED_STOCKS)
  const [isLivePortfolio, setIsLivePortfolio] = useState(false)
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true)
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>(DEFAULT_PURCHASED_STOCKS[0].symbol)

  // Beginner guide state
  const [showPrimer, setShowPrimer] = useState(true)

  // Game step state: 'select' | 'question' | 'result'
  const [gameState, setGameState] = useState<'select' | 'question' | 'result'>('select')

  // Scenarios pool & current scenario
  const [currentScenario, setCurrentScenario] = useState<SituationScenario | null>(null)
  const [scenarioIndex, setScenarioIndex] = useState(0)

  // Answers state
  const [ansQ1, setAnsQ1] = useState<string>('')
  const [ansQ2, setAnsQ2] = useState<'up_strong' | 'up_moderate' | 'flat' | 'down' | ''>('')
  const [ansQ3, setAnsQ3] = useState<string>('')

  // Scoring state
  const [earnedScore, setEarnedScore] = useState(0)
  const [earnedTokens, setEarnedTokens] = useState(0)
  const [totalXP, setTotalXP] = useState(150)
  const [streakCount, setStreakCount] = useState(1)

  // Dialogue assistant text
  const [dialogueText, setDialogueText] = useState('')

  // 1. Fetch user's purchased stocks from backend portfolio
  useEffect(() => {
    let active = true

    const loadPortfolio = async () => {
      try {
        const data = await api.portfolio()
        if (!active) return

        const holdings = data?.holdings || []
        if (holdings.length > 0) {
          const mapped: PurchasedStock[] = holdings.map((h: any) => {
            const sym = h.asset?.symbol || 'STOCK'
            const shares = Number(h.shares || 1)
            const currentPrice = Number(h.asset?.current_price || h.current_price || 100)
            const avgPrice = Number(h.avg_buy_price || currentPrice * 0.92)
            const totalValue = Number(h.value || shares * currentPrice)
            const returnPct = avgPrice > 0 ? Number((((currentPrice - avgPrice) / avgPrice) * 100).toFixed(1)) : 0

            return {
              id: sym.toLowerCase(),
              symbol: sym,
              name: h.asset?.name || `${sym} Corp`,
              icon: getAssetIcon(sym),
              category: h.asset?.category || 'Purchased Holding',
              shares,
              avgPrice,
              currentPrice,
              totalValue,
              returnPct,
              growthDriver: `Revenue expansion, market share growth, and product innovations in ${h.asset?.category || 'its sector'}.`,
            }
          })

          setPurchasedStocks(mapped)
          setIsLivePortfolio(true)
          setSelectedStockSymbol(mapped[0].symbol)
        } else {
          setPurchasedStocks(DEFAULT_PURCHASED_STOCKS)
          setIsLivePortfolio(false)
          setSelectedStockSymbol(DEFAULT_PURCHASED_STOCKS[0].symbol)
        }
      } catch (err) {
        if (active) {
          setPurchasedStocks(DEFAULT_PURCHASED_STOCKS)
          setIsLivePortfolio(false)
          setSelectedStockSymbol(DEFAULT_PURCHASED_STOCKS[0].symbol)
        }
      } finally {
        if (active) setIsLoadingPortfolio(false)
      }
    }

    loadPortfolio()
    return () => {
      active = false
    }
  }, [])

  // Start scenario for selected stock
  const startScenarioGame = (stockSym?: string) => {
    const sym = stockSym || selectedStockSymbol
    const stockObj = purchasedStocks.find((s) => s.symbol === sym) || purchasedStocks[0]
    const scenarios = GENERATE_SCENARIOS_FOR_STOCK(stockObj)

    // pick next scenario randomly or sequentially
    const nextIdx = (scenarioIndex + 1) % scenarios.length
    setScenarioIndex(nextIdx)
    const selectedScenario = scenarios[nextIdx]

    setCurrentScenario(selectedScenario)
    setAnsQ1('')
    setAnsQ2('')
    setAnsQ3('')
    setGameState('question')
    setDialogueText(
      `A new market situation has broken for ${stockObj.name} (${stockObj.symbol})! Review the situation, apply your basic stock knowledge, and make your price prediction!`
    )
  }

  // Calculate results when user submits answers
  const handleSubmitPrediction = async () => {
    if (!currentScenario) return

    let score = 0

    // Q1 score
    const q1Opt = currentScenario.q1.options.find((o) => o.id === ansQ1)
    if (q1Opt?.isCorrect) score += 40
    else score += 15

    // Q2 score (direction prediction match)
    if (ansQ2 === currentScenario.actualOutcomeDirection) score += 40
    else if (
      (ansQ2 === 'up_strong' && currentScenario.actualOutcomeDirection === 'up_moderate') ||
      (ansQ2 === 'up_moderate' && currentScenario.actualOutcomeDirection === 'up_strong')
    ) {
      score += 30
    } else {
      score += 15
    }

    // Q3 score
    const q3Opt = currentScenario.q3.options.find((o) => o.id === ansQ3)
    if (q3Opt?.isCorrect) score += 40
    else score += 15

    setEarnedScore(score)
    const bonusTokens = Math.max(15, Math.floor(score / 3))
    setEarnedTokens(bonusTokens)
    setTotalXP((prev) => prev + score)
    setStreakCount((prev) => prev + 1)

    setGameState('result')
    setDialogueText(
      `Prediction calculated! 🎉 ${currentScenario.explanation} You earned +${bonusTokens} Market Tokens and +${score} XP!`
    )

    // Log complete simulation on backend
    try {
      await api.completeSimulation(score)
    } catch {}
  }

  const selectedStockObj = purchasedStocks.find((s) => s.symbol === selectedStockSymbol) || purchasedStocks[0]

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12">
      {/* Top Banner & Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#00B4D8]/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#00B4D8]/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <AIBuddyPortrait size={110} speaking={gameState === 'question' || gameState === 'result'} />

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00B4D8]/40 bg-[#00B4D8]/10 px-3.5 py-1 text-xs font-bold text-[#00B4D8]">
              <Gamepad2 className="size-4" /> Stock Predictor Challenge 🎮
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Predict Market Situations for Your Stocks!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Test your knowledge on your purchased stocks. Analyze real-world market situations, predict stock growth trajectories, and see your predictions vs actual market graphs!
            </p>
          </div>

          {/* Reward Badges */}
          <div className="flex flex-row md:flex-col items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300">
              <Zap className="size-4 text-amber-400 fill-amber-400" />
              Streak: {streakCount} Fire 🔥
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-[#00B4D8]/30 bg-[#00B4D8]/10 px-4 py-2 text-xs font-bold text-[#00B4D8]">
              <Trophy className="size-4" />
              XP: {totalXP}
            </div>
          </div>
        </div>
      </div>

      {/* Beginner Knowledge Primer (Collapsible) */}
      <Card className="rounded-3xl border-border/80 p-5 shadow-sm bg-gradient-to-r from-cyan-950/20 via-background to-amber-950/10">
        <div
          onClick={() => setShowPrimer(!showPrimer)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-[#00B4D8]/15 text-[#00B4D8]">
              <Lightbulb className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Beginner Guide: Why Do Stocks Grow & Move?</h3>
              <p className="text-xs text-muted-foreground">Click to {showPrimer ? 'hide' : 'show'} basic stock growth fundamentals</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs px-3 py-1 font-semibold border-cyan-500/30 text-[#00B4D8]">
            {showPrimer ? 'Collapse ▲' : 'Expand Primer ▼'}
          </Badge>
        </div>

        {showPrimer && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 border-t border-border/50 pt-4">
            <div className="rounded-2xl border border-border/70 bg-card p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#00B4D8]">
                <DollarSign className="size-4" /> 1. Revenue & Earnings
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                As a company sells more products and increases profit, each share becomes fundamentally more valuable.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                <BarChart3 className="size-4" /> 2. Supply & Demand
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                When more investors want to buy a stock than sell it, buyers bid prices higher.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                <Sparkles className="size-4" /> 3. Product Innovation
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                New technological breakthroughs unlock new markets and boost long-term earnings expectations.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-500">
                <Compass className="size-4" /> 4. Economic News
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                Interest rates, inflation, and market trends shift how investors price risk across sectors.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* STATE 1: SELECT PURCHASED STOCK & START GAME */}
      {gameState === 'select' && (
        <Card className="p-6 sm:p-8 space-y-6 rounded-3xl border-border/80 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#00B4D8] uppercase tracking-wider">Step 1 of 3</span>
                {isLivePortfolio ? (
                  <Badge variant="default" className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5">
                    Live Portfolio Connected 🟢
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5">
                    Sample Portfolio (Buy stocks in Market to add live)
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-foreground mt-1">
                Your Purchased Stocks Dashboard 📈
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select one of your purchased stocks below to launch its tailored predictor situation challenge!
              </p>
            </div>

            <button
              onClick={() => startScenarioGame(selectedStockSymbol)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
            >
              Play Predictor Game <ArrowRight className="size-4" />
            </button>
          </div>

          {/* Purchased Stocks Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {purchasedStocks.map((stock) => {
              const isSelected = selectedStockSymbol === stock.symbol
              const isGain = stock.returnPct >= 0

              return (
                <div
                  key={stock.symbol}
                  onClick={() => setSelectedStockSymbol(stock.symbol)}
                  className={cn(
                    'group relative flex flex-col justify-between rounded-3xl border p-5 transition-all duration-200 cursor-pointer select-none',
                    isSelected
                      ? 'border-[#00B4D8] bg-[#00B4D8]/10 shadow-lg shadow-cyan-500/10 ring-2 ring-[#00B4D8]/40'
                      : 'border-border/80 bg-card/70 hover:border-[#00B4D8]/50 hover:bg-muted/30'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{stock.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-foreground text-base">{stock.symbol}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                            {stock.category}
                          </Badge>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground line-clamp-1">{stock.name}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="flex size-6 items-center justify-center rounded-full bg-[#00B4D8] text-white">
                        <Check className="size-4 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Holdings Breakdown */}
                  <div className="mt-4 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold">Shares Owned</span>
                      <div className="font-extrabold text-foreground">{stock.shares} shares</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold">Current Price</span>
                      <div className="font-extrabold text-foreground">${stock.currentPrice}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold">Total Value</span>
                      <div className="font-extrabold text-foreground">${stock.totalValue.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold">Return</span>
                      <div className={cn('font-extrabold flex items-center gap-0.5', isGain ? 'text-emerald-500' : 'text-red-500')}>
                        {isGain ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {isGain ? `+${stock.returnPct}%` : `${stock.returnPct}%`}
                      </div>
                    </div>
                  </div>

                  {/* Growth Driver Description */}
                  <div className="mt-3 rounded-xl bg-muted/40 p-2.5 text-[11px] text-muted-foreground line-clamp-2">
                    <span className="font-bold text-foreground">Why it grows: </span>
                    {stock.growthDriver}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedStockObj.icon}</span>
              <div>
                <div className="text-xs font-bold text-amber-700 dark:text-amber-300">Selected for Game Challenge</div>
                <div className="text-base font-extrabold text-foreground">{selectedStockObj.name} ({selectedStockObj.symbol})</div>
              </div>
            </div>
            <button
              onClick={() => startScenarioGame(selectedStockSymbol)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Start Situation Challenge <ArrowRight className="size-4" />
            </button>
          </div>
        </Card>
      )}

      {/* STATE 2: ANSWER SITUATION & QUESTION SCENARIO */}
      {gameState === 'question' && currentScenario && (
        <Card className="p-6 sm:p-8 space-y-6 rounded-3xl border-border/80 shadow-lg">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#00B4D8] uppercase tracking-wider">Step 2 of 3</span>
                <Badge variant="outline" className="text-[10px] font-bold text-[#00B4D8] border-[#00B4D8]/30">
                  Target Stock: {currentScenario.targetStockSymbol}
                </Badge>
              </div>
              <h2 className="text-xl font-extrabold text-foreground mt-1">Market Situation Discovered! 📰</h2>
            </div>

            <button
              onClick={() => startScenarioGame()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B4D8] hover:underline cursor-pointer"
            >
              <RefreshCw className="size-3.5" /> Draw New Situation
            </button>
          </div>

          {/* Scenario News Card */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-background to-amber-500/5 p-6 space-y-3">
            <div className="flex items-start gap-4">
              <span className="text-5xl shrink-0">{currentScenario.emoji}</span>
              <div className="space-y-1.5">
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                  {currentScenario.category} • {currentScenario.title}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-foreground mt-1.5">
                  &ldquo;{currentScenario.headline}&rdquo;
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {currentScenario.story}
                </p>
              </div>
            </div>

            {/* Basic Knowledge Tip Box */}
            <div className="rounded-2xl border border-[#00B4D8]/30 bg-[#00B4D8]/10 p-3.5 text-xs font-medium text-[#00B4D8]">
              {currentScenario.basicKnowledgeTip}
            </div>
          </div>

          {/* Question 1: Basic Concept */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-[#00B4D8] text-white text-xs font-bold">1</span>
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                {currentScenario.q1.question}
              </h3>
            </div>

            <div className="grid gap-2.5">
              {currentScenario.q1.options.map((opt) => {
                const isSelected = ansQ1 === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setAnsQ1(opt.id)}
                    className={cn(
                      'rounded-2xl border p-4 text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer',
                      isSelected
                        ? 'border-[#00B4D8] bg-[#00B4D8]/15 text-foreground shadow-md ring-1 ring-[#00B4D8]'
                        : 'border-border bg-card/60 hover:bg-muted/40 text-muted-foreground'
                    )}
                  >
                    {opt.text}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Question 2: Price Movement Trajectory */}
          <div className="space-y-3 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-[#00B4D8] text-white text-xs font-bold">2</span>
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                {currentScenario.q2.question}
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {currentScenario.q2.options.map((opt) => {
                const isSelected = ansQ2 === opt.direction
                return (
                  <button
                    key={opt.direction}
                    onClick={() => setAnsQ2(opt.direction)}
                    className={cn(
                      'flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer',
                      isSelected
                        ? 'border-[#00B4D8] bg-[#00B4D8]/15 text-foreground shadow-md ring-1 ring-[#00B4D8]'
                        : 'border-border bg-card/60 hover:bg-muted/40 text-muted-foreground'
                    )}
                  >
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className="text-[10px] font-mono text-muted-foreground mt-1">Target range: {opt.range}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Question 3: Strategic Portfolio Reaction */}
          <div className="space-y-3 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-[#00B4D8] text-white text-xs font-bold">3</span>
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                {currentScenario.q3.question}
              </h3>
            </div>

            <div className="grid gap-2.5">
              {currentScenario.q3.options.map((opt) => {
                const isSelected = ansQ3 === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setAnsQ3(opt.id)}
                    className={cn(
                      'rounded-2xl border p-4 text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer',
                      isSelected
                        ? 'border-[#00B4D8] bg-[#00B4D8]/15 text-foreground shadow-md ring-1 ring-[#00B4D8]'
                        : 'border-border bg-card/60 hover:bg-muted/40 text-muted-foreground'
                    )}
                  >
                    {opt.text}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <button
              onClick={() => setGameState('select')}
              className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              ← Back to Purchased Stocks
            </button>

            <button
              onClick={handleSubmitPrediction}
              disabled={!ansQ1 || !ansQ2 || !ansQ3}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 disabled:opacity-50 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Reveal Outcome & View Graph 🏆
            </button>
          </div>
        </Card>
      )}

      {/* STATE 3: RESULTS & GRAPH OF ACTUAL VS PREDICTION */}
      {gameState === 'result' && currentScenario && (
        <Card className="p-6 sm:p-8 space-y-6 rounded-3xl border-border/80 shadow-xl bg-gradient-to-b from-card to-muted/20">
          {/* Top Result Score Header */}
          <div className="flex flex-col items-center text-center space-y-3 border-b border-border/60 pb-6">
            <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40">
              <Trophy className="size-8" />
            </div>

            <div>
              <Badge variant="default" className="bg-emerald-500 text-white font-bold text-xs px-3 py-1">
                Prediction Evaluation Complete! 🎉
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
                You earned +{earnedTokens} Market Tokens & +{earnedScore} XP!
              </h2>
            </div>
          </div>

          {/* Expert Critique Card */}
          <div className="rounded-3xl border border-[#00B4D8]/30 bg-[#00B4D8]/10 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00B4D8]">
              <Sparkles className="size-4" /> Prof. Algo&apos;s Market Critique
            </div>
            <p className="text-xs sm:text-sm text-foreground leading-relaxed">
              {currentScenario.explanation}
            </p>
          </div>

          {/* Actual vs Prediction Graph */}
          <InteractiveComparisonChart
            chartData={currentScenario.chartData}
            userDirection={ansQ2}
            currentPrice={selectedStockObj.currentPrice}
          />

          {/* Score & Breakdown Cards */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <div className="text-[11px] font-semibold text-muted-foreground">Basic Concept Score</div>
              <div className="text-base font-extrabold text-foreground mt-1">
                {currentScenario.q1.options.find((o) => o.id === ansQ1)?.isCorrect ? '✓ Mastered (+40 XP)' : 'Partial (+15 XP)'}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {currentScenario.q1.options.find((o) => o.id === ansQ1)?.explanation}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <div className="text-[11px] font-semibold text-muted-foreground">Market Outcome Match</div>
              <div className="text-base font-extrabold text-foreground mt-1">
                {ansQ2 === currentScenario.actualOutcomeDirection ? '🎯 Exact Hit (+40 XP)' : 'Close Target (+25 XP)'}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Actual move: {currentScenario.actualChangePct > 0 ? `+${currentScenario.actualChangePct}%` : `${currentScenario.actualChangePct}%`}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <div className="text-[11px] font-semibold text-muted-foreground">Strategic Advice</div>
              <div className="text-base font-extrabold text-foreground mt-1">
                {currentScenario.q3.options.find((o) => o.id === ansQ3)?.isCorrect ? '💡 Optimal Strategy' : 'Learner Strategy'}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {currentScenario.q3.options.find((o) => o.id === ansQ3)?.advice}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
            <button
              onClick={() => startScenarioGame()}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-6 py-3 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all cursor-pointer"
            >
              <RotateCcw className="size-4" /> Next Situation for {selectedStockObj.symbol}
            </button>

            <button
              onClick={() => setGameState('select')}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-5 py-3 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              Choose Different Stock 📈
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}
