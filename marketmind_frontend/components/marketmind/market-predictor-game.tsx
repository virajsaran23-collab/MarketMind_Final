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
} from 'lucide-react'
import { AIBuddyPortrait } from './ai-buddy-portrait'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

/* ────────────────────────────────────── Assets ────────────────────────────── */
type GameAsset = {
  id: string
  symbol: string
  name: string
  icon: string
  category: string
  desc: string
}

const getAssetIcon = (symbol: string) => {
  const map: Record<string, string> = {
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
    AMD: '🧩',
    GOOG: '🔎',
  }

  return map[symbol.toUpperCase()] || '📈'
}

const GAME_ASSETS: GameAsset[] = [
  { id: 'aapl', symbol: 'AAPL', name: 'Apple Tech', icon: '📱', category: 'Tech', desc: 'Makes iPhones, iPads, and Mac computers.' },
  { id: 'dis', symbol: 'DIS', name: 'Disney Magic', icon: '🏰', category: 'Entertainment', desc: 'Theme parks, movies, and Disney+ streaming.' },
  { id: 'nke', symbol: 'NKE', name: 'Nike Sport', icon: '👟', category: 'Apparel', desc: 'Sneakers, athletic clothes, and sports gear.' },
  { id: 'tsla', symbol: 'TSLA', name: 'Tesla Motors', icon: '⚡', category: 'Auto & EV', desc: 'Electric cars, solar panels, and robot tech.' },
  { id: 'ko', symbol: 'KO', name: 'Coca-Cola', icon: '🥤', category: 'Food & Drink', desc: 'Drinks, juices, and soft drink beverages.' },
  { id: 'rblx', symbol: 'RBLX', name: 'Roblox Games', icon: '🎮', category: 'Gaming', desc: 'Online virtual playground where kids build games.' },
  { id: 'ntdoy', symbol: 'NTDOY', name: 'Nintendo', icon: '🍄', category: 'Gaming', desc: 'Switch video games, Mario, and Pokémon.' },
]

/* ────────────────────────────────────── Market Events ────────────────────────────── */
type ChartPoint = {
  label: string
  value: number
}

type MarketEvent = {
  id: string
  title: string
  emoji: string
  headline: string
  story: string
  winnerSymbol: string
  loserSymbol: string
  overallDirection: 'up' | 'flat' | 'down'
  portfolioChangePct: number
  explanation: string
  focusSymbols: string[]
  chartSeries: {
    predicted: ChartPoint[]
    actual: ChartPoint[]
  }
  choices: {
    question1: { symbol: string; label: string }[]
    question2: { direction: 'up' | 'flat' | 'down'; label: string }[]
    question3: { reasonId: string; text: string; isCorrect: boolean }[]
  }
}

const buildChartSeries = (direction: 'up' | 'flat' | 'down', offset: number) => {
  const base = direction === 'up' ? [2, 4, 7, 10, 12, 15] : direction === 'down' ? [8, 6, 4, 2, 1, -1] : [4, 4, 4, 5, 5, 5]
  const actual = direction === 'up'
    ? [1, 3, 6, 9, 13, 18]
    : direction === 'down'
      ? [9, 8, 6, 4, 2, -3]
      : [4, 4, 4, 5, 5, 5]

  const predicted = base.map((value, index) => ({ label: `T${index + 1}`, value: value + offset }))
  const actualSeries = actual.map((value, index) => ({ label: `T${index + 1}`, value: value + offset }))

  return { predicted, actual: actualSeries }
}

const normalizeSymbol = (symbol: string) => symbol?.toUpperCase() || ''

const buildEventForPortfolio = (selectedSymbols: string[]): MarketEvent => {
  const symbols = selectedSymbols.map(normalizeSymbol).filter(Boolean)
  const techSymbols = ['AAPL', 'MSFT', 'NVDA', 'AMD', 'AMZN', 'GOOG', 'GOOGL']
  const consumerSymbols = ['DIS', 'NKE', 'KO', 'NFLX']
  const autoSymbols = ['TSLA', 'F', 'GM', 'LCID']

  const hasTech = symbols.some((sym) => techSymbols.includes(sym))
  const hasConsumer = symbols.some((sym) => consumerSymbols.includes(sym))
  const hasAuto = symbols.some((sym) => autoSymbols.includes(sym))

  if (hasTech) {
    const winner = symbols.find((sym) => techSymbols.includes(sym)) || 'NVDA'
    const loser = symbols.find((sym) => consumerSymbols.includes(sym)) || 'KO'
    const choiceSymbols = Array.from(new Set([winner, loser, ...symbols].slice(0, 4)))
    return {
      id: 'ai-infrastructure',
      title: `${winner} leads the AI infrastructure rush`,
      emoji: '🧠',
      headline: `Cloud and chip demand explodes as firms upgrade their AI stacks.`,
      story: `Your tech-heavy portfolio is in the middle of a major AI upgrade cycle. Analysts are watching ${winner} and its chip suppliers very closely.`,
      winnerSymbol: winner,
      loserSymbol: loser,
      overallDirection: 'up',
      portfolioChangePct: 18.4,
      explanation: `${winner} rises sharply as data-center spending and chip demand jump, while consumer names like ${loser} lag on the news.`,
      focusSymbols: choiceSymbols,
      chartSeries: buildChartSeries('up', 1),
      choices: {
        question1: choiceSymbols.map((symbol) => ({ symbol, label: `${symbol} is the stock most likely to outperform` })),
        question2: [
          { direction: 'up', label: '🚀 Portfolio climbs strongly (+12% to +20%)' },
          { direction: 'flat', label: '➡️ Portfolio stays steady' },
          { direction: 'down', label: '📉 Portfolio slips lower' },
        ],
        question3: [
          { reasonId: 'r1', text: `Because ${winner} is the clearest beneficiary of higher AI demand and spending.`, isCorrect: true },
          { reasonId: 'r2', text: 'Because the market always ignores strong growth stories.', isCorrect: false },
          { reasonId: 'r3', text: 'Because consumer staples always lead in a tech wave.', isCorrect: false },
        ],
      },
    }
  }

  if (hasAuto) {
    const winner = symbols.find((sym) => autoSymbols.includes(sym)) || 'TSLA'
    const loser = symbols.find((sym) => consumerSymbols.includes(sym)) || 'NKE'
    const choiceSymbols = Array.from(new Set([winner, loser, ...symbols].slice(0, 4)))
    return {
      id: 'battery-breakthrough',
      title: `Battery breakthrough lifts ${winner}`,
      emoji: '⚡',
      headline: 'A lower-cost battery design sends EV demand expectations higher.',
      story: `The market reacts quickly as investors rethink the economics of electric vehicles and charging. ${winner} is at the center of the move.`,
      winnerSymbol: winner,
      loserSymbol: loser,
      overallDirection: 'up',
      portfolioChangePct: 14.8,
      explanation: `Cheaper batteries improve margins and demand expectations for ${winner}, while more defensive consumer stocks drift.`,
      focusSymbols: choiceSymbols,
      chartSeries: buildChartSeries('up', 0),
      choices: {
        question1: choiceSymbols.map((symbol) => ({ symbol, label: `${symbol} should lead the next move` })),
        question2: [
          { direction: 'up', label: '🚀 Portfolio rallies on the news' },
          { direction: 'flat', label: '➡️ Portfolio remains mixed' },
          { direction: 'down', label: '📉 Portfolio falls on fear' },
        ],
        question3: [
          { reasonId: 'r1', text: `Because the event improves demand expectations for ${winner} and its sector.`, isCorrect: true },
          { reasonId: 'r2', text: 'Because batteries always hurt growth stocks.', isCorrect: false },
          { reasonId: 'r3', text: 'Because consumer brands never respond to technology news.', isCorrect: false },
        ],
      },
    }
  }

  if (hasConsumer) {
    const winner = symbols.find((sym) => consumerSymbols.includes(sym)) || 'DIS'
    const loser = symbols.find((sym) => techSymbols.includes(sym)) || 'AAPL'
    const choiceSymbols = Array.from(new Set([winner, loser, ...symbols].slice(0, 4)))
    return {
      id: 'holiday-consumer-rally',
      title: `Holiday demand lifts ${winner}`,
      emoji: '🎁',
      headline: 'Consumer spending surprises the market just before the holiday season.',
      story: `Shoppers return in force, and investors begin to price in stronger demand for brand names like ${winner}.`,
      winnerSymbol: winner,
      loserSymbol: loser,
      overallDirection: 'up',
      portfolioChangePct: 12.6,
      explanation: `${winner} leads the rebound as consumer spending improves, while growth tech names cool off a bit.`,
      focusSymbols: choiceSymbols,
      chartSeries: buildChartSeries('up', -1),
      choices: {
        question1: choiceSymbols.map((symbol) => ({ symbol, label: `${symbol} should be the strongest performer` })),
        question2: [
          { direction: 'up', label: '🚀 Portfolio gains on the rally' },
          { direction: 'flat', label: '➡️ Portfolio holds near current levels' },
          { direction: 'down', label: '📉 Portfolio weakens on rotation' },
        ],
        question3: [
          { reasonId: 'r1', text: `Because ${winner} benefits from stronger holiday demand and consumer confidence.`, isCorrect: true },
          { reasonId: 'r2', text: 'Because recessions always help consumer brands.', isCorrect: false },
          { reasonId: 'r3', text: 'Because tech news never affects consumer names.', isCorrect: false },
        ],
      },
    }
  }

  const fallbackWinner = symbols[0] || 'AAPL'
  const fallbackLoser = symbols[1] || 'KO'
  const choiceSymbols = Array.from(new Set([fallbackWinner, fallbackLoser, ...symbols].slice(0, 4)))
  return {
    id: 'mixed-market-shift',
    title: 'Mixed market shift creates new opportunities',
    emoji: '📈',
    headline: 'Rates and inflation chatter reshape the outlook for your portfolio.',
    story: `Markets are reacting to rate and inflation news, and your selected holdings are being repriced as investors revise their outlook.`,
    winnerSymbol: fallbackWinner,
    loserSymbol: fallbackLoser,
    overallDirection: 'flat',
    portfolioChangePct: 5.2,
    explanation: `The market is balancing growth and value. ${fallbackWinner} is the most sensitive to the new setup in your holdings.`,
    focusSymbols: choiceSymbols,
    chartSeries: buildChartSeries('flat', 0),
    choices: {
      question1: choiceSymbols.map((symbol) => ({ symbol, label: `${symbol} should lead the move` })),
      question2: [
        { direction: 'up', label: '🚀 Portfolio edges higher' },
        { direction: 'flat', label: '➡️ Portfolio stays flat' },
        { direction: 'down', label: '📉 Portfolio drops' },
      ],
      question3: [
        { reasonId: 'r1', text: `Because the event should benefit your strongest holding, ${fallbackWinner}.`, isCorrect: true },
        { reasonId: 'r2', text: 'Because the market always ignores your biggest positions.', isCorrect: false },
        { reasonId: 'r3', text: 'Because mixed signals never matter.', isCorrect: false },
      ],
    },
  }
}

function PortfolioTrendChart({ predicted, actual }: { predicted: ChartPoint[]; actual: ChartPoint[] }) {
  const width = 340
  const height = 180
  const padding = 24
  const allValues = [...predicted.map((point) => point.value), ...actual.map((point) => point.value)]
  const min = Math.min(...allValues) - 2
  const max = Math.max(...allValues) + 2

  const toPoint = (value: number, index: number, values: ChartPoint[]) => {
    const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / Math.max(max - min, 1)) * (height - padding * 2)
    return `${x},${y}`
  }

  const predictedPoints = predicted.map((point, index) => toPoint(point.value, index, predicted)).join(' ')
  const actualPoints = actual.map((point, index) => toPoint(point.value, index, actual)).join(' ')

  return (
    <div className="rounded-2xl border border-border bg-slate-950/95 p-4 text-white">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Predicted vs actual</div>
          <div className="text-sm font-semibold">Your portfolio path under this event</div>
        </div>
        <div className="flex gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-cyan-400" /> Predicted</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-400" /> Actual</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {[0, 1, 2, 3].map((line) => (
          <line key={line} x1={padding} x2={width - padding} y1={padding + line * 35} y2={padding + line * 35} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
        ))}
        <polyline fill="none" stroke="#22d3ee" strokeWidth="3" points={predictedPoints} />
        <polyline fill="none" stroke="#fbbf24" strokeWidth="3" points={actualPoints} />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-slate-400">
        {predicted.map((point) => <span key={point.label}>{point.label}</span>)}
      </div>
    </div>
  )
}

export function MarketPredictorGame() {
  const { showToast } = useAuth()
  const [selectedAssets, setSelectedAssets] = useState<string[]>(['AAPL', 'DIS', 'TSLA'])
  const [gameState, setGameState] = useState<'build' | 'event' | 'predict' | 'result'>('build')
  const [currentEvent, setCurrentEvent] = useState<MarketEvent>(buildEventForPortfolio(['AAPL', 'DIS', 'TSLA']))
  const [portfolioValue, setPortfolioValue] = useState(100000)
  const [availableAssets, setAvailableAssets] = useState<GameAsset[]>(GAME_ASSETS)
  const [portfolioHoldings, setPortfolioHoldings] = useState<any[]>([])
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true)

  const [predWinner, setPredWinner] = useState<string>('')
  const [predDirection, setPredDirection] = useState<'up' | 'flat' | 'down' | ''>('')
  const [predReason, setPredReason] = useState<string>('')
  const [score, setScore] = useState<number>(0)
  const [tokensEarned, setTokensEarned] = useState<number>(0)
  const [dialogueText, setDialogueText] = useState('')

  useEffect(() => {
    let ignored = false

    const loadPortfolio = async () => {
      try {
        const data = await api.portfolio()
        if (ignored) return

        const holdings = data?.holdings || []
        setPortfolioHoldings(holdings)

        const mappedAssets = holdings
          .map((holding: any) => {
            const symbol = holding.asset?.symbol || ''
            if (!symbol) return null
            return {
              id: symbol,
              symbol,
              name: holding.asset?.name || symbol,
              icon: getAssetIcon(symbol),
              category: holding.asset?.category || 'Portfolio',
              desc: `Your live portfolio position in ${holding.asset?.name || symbol}`,
            } as GameAsset
          })
          .filter(Boolean) as GameAsset[]

        if (mappedAssets.length > 0) {
          setAvailableAssets(mappedAssets)
          setSelectedAssets(mappedAssets.slice(0, Math.min(4, mappedAssets.length)).map((asset) => asset.symbol))
          setPortfolioValue(holdings.reduce((sum: number, holding: any) => sum + Number(holding.value || 0), 0))
        } else {
          setAvailableAssets(GAME_ASSETS)
          setSelectedAssets(['AAPL', 'DIS', 'TSLA'])
          setPortfolioValue(100000)
        }
      } catch {
        if (!ignored) {
          setAvailableAssets(GAME_ASSETS)
          setSelectedAssets(['AAPL', 'DIS', 'TSLA'])
          setPortfolioValue(100000)
        }
      } finally {
        if (!ignored) setIsPortfolioLoading(false)
      }
    }

    loadPortfolio()
    return () => {
      ignored = true
    }
  }, [])

  useEffect(() => {
    if (portfolioHoldings.length > 0) {
      const nextValue = portfolioHoldings.reduce((sum: number, holding: any) => sum + Number(holding.value || 0), 0)
      setPortfolioValue(nextValue)
    }
  }, [portfolioHoldings])

  const toggleAsset = (symbol: string) => {
    if (selectedAssets.includes(symbol)) {
      if (selectedAssets.length <= 2) {
        showToast('Keep at least 2 stocks!', 'A good portfolio has a few different stocks.', 'info')
        return
      }
      setSelectedAssets((prev) => prev.filter((a) => a !== symbol))
    } else {
      if (selectedAssets.length >= 4) {
        showToast('Portfolio Full!', 'Pick up to 4 stocks for your game portfolio.', 'info')
        return
      }
      setSelectedAssets((prev) => [...prev, symbol])
    }
  }

  const startEventStep = () => {
    const nextEvent = buildEventForPortfolio(selectedAssets)
    setCurrentEvent(nextEvent)
    setGameState('event')
    setDialogueText(`A new market event tailored to your portfolio has arrived: "${nextEvent.title}". Review the story, then choose the stock and direction that best fit your holdings.`)
  }

  const startPredictStep = () => {
    setGameState('predict')
    setDialogueText(`Your portfolio is now under pressure. Choose the stock that should rise the most, the likely direction of the whole portfolio, and the reason behind it.`)
  }

  const calculateResult = async () => {
    let earned = 0
    // Check Q1
    if (predWinner === currentEvent.winnerSymbol) earned += 40
    else earned += 15

    // Check Q2
    if (predDirection === currentEvent.overallDirection) earned += 40
    else earned += 15

    // Check Q3
    const correctReason = currentEvent.choices.question3.find((r) => r.isCorrect)
    if (predReason === correctReason?.reasonId) earned += 40
    else earned += 10

    setScore(earned)
    const bonusTokens = Math.max(10, Math.floor(earned / 4))
    setTokensEarned(bonusTokens)

    setGameState('result')
    setDialogueText(`Diagnostic Outcome complete! 🎉 ${currentEvent.explanation} You earned +${bonusTokens} Tokens and +${earned} XP!`)

    // Submit to backend simulation endpoint
    try {
      await api.completeSimulation(earned)
    } catch {}
  }

  const restartGame = () => {
    setGameState('build')
    setPredWinner('')
    setPredDirection('')
    setPredReason('')
  }

  const displayAssets = availableAssets.length > 0 ? availableAssets : GAME_ASSETS
  const predictionChoices = selectedAssets
    .map((symbol) => {
      const asset = displayAssets.find((entry) => entry.symbol === symbol)
      return {
        symbol,
        label: asset ? `${asset.icon} ${asset.name}` : symbol,
      }
    })
    .slice(0, 4)

  if (!predictionChoices.some((choice) => choice.symbol === currentEvent.winnerSymbol)) {
    predictionChoices.push({
      symbol: currentEvent.winnerSymbol,
      label: `${currentEvent.emoji} ${currentEvent.winnerSymbol} (event favorite)`,
    })
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#00B4D8]/30 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 shadow-2xl text-white">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#00B4D8]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-5">
          <AIBuddyPortrait size={110} speaking={gameState === 'event' || gameState === 'result'} />
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00B4D8]/40 bg-[#00B4D8]/10 px-3 py-1 text-xs font-bold text-[#00B4D8]">
              <Gamepad2 className="size-4" /> Market Event Predictor Game 🎮
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Build a Portfolio & Predict Market Events!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pick your favorite stocks, draw real-world market events, and predict how your portfolio reacts to earn bonus tokens and rank up!
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-800/80 px-4 py-3 shadow-inner shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
              <Zap className="size-4 text-amber-400" /> Reward Multiplier
            </div>
            <div className="text-xl font-extrabold text-[#00B4D8] mt-0.5">
              +25 Tokens / Event
            </div>
          </div>
        </div>
      </div>

      {gameState === 'build' && (
        <Card className="p-6 sm:p-8 space-y-6 rounded-3xl border-border/80 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <span className="text-xs font-extrabold text-[#00B4D8] uppercase tracking-wider">Your live portfolio</span>
              <h2 className="text-xl font-bold text-foreground">Use the holdings from your dashboard in the game</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                These are your current portfolio positions. Choose which ones should be part of today’s prediction challenge.
              </p>
            </div>
            <Badge variant="default" className="text-xs px-3 py-1 font-bold">{selectedAssets.length} / 4 selected</Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-[#00B4D8]/20 bg-[#00B4D8]/10 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#00B4D8]"><Wallet className="size-4" /> Your current portfolio</div>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                {isPortfolioLoading ? (
                  <div className="rounded-xl border border-border bg-white/80 px-3 py-2">Loading your holdings…</div>
                ) : (
                  selectedAssets.map((symbol) => {
                    const asset = displayAssets.find((entry) => entry.symbol === symbol)
                    if (!asset) return null
                    return (
                      <div key={symbol} className="flex items-center justify-between rounded-xl border border-border bg-white/80 px-3 py-2">
                        <span>{asset.name}</span>
                        <span className="font-semibold">{asset.symbol}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/70 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Target className="size-4" /> Pick your game portfolio</div>
              <p className="mt-2 text-sm text-muted-foreground">Choose up to 4 holdings from your dashboard portfolio to bring into the event quiz.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {displayAssets.map((asset) => {
                  const isSelected = selectedAssets.includes(asset.symbol)
                  return (
                    <button
                      key={asset.symbol}
                      onClick={() => toggleAsset(asset.symbol)}
                      className={cn(
                        'group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer',
                        isSelected ? 'border-[#00B4D8] bg-[#00B4D8]/10 shadow-md shadow-cyan-500/10' : 'border-border bg-card/60 hover:border-primary/40 hover:bg-muted/40'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-3xl mb-2">{asset.icon}</span>
                        {isSelected && <span className="flex size-6 items-center justify-center rounded-full bg-[#00B4D8] text-white"><CheckCircle2 className="size-4" /></span>}
                      </div>
                      <div>
                        <div className="flex items-center gap-2"><span className="font-extrabold text-foreground text-sm">{asset.name}</span><span className="text-[10px] font-mono text-muted-foreground uppercase">{asset.symbol}</span></div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{asset.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <div>
              <div className="text-sm font-semibold text-foreground">Live portfolio value</div>
              <div className="text-xl font-extrabold text-foreground">${portfolioValue.toLocaleString()}</div>
            </div>
            <button onClick={startEventStep} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:-translate-y-0.5 transition-all">
              Start the event quiz <ArrowRight className="size-4" />
            </button>
          </div>
        </Card>
      )}

      {/* STEP 2: DRAW EVENT */}
      {gameState === 'event' && (
        <Card className="p-6 sm:p-8 space-y-6 rounded-3xl border-border/80 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <span className="text-xs font-extrabold text-[#00B4D8] uppercase tracking-wider">Step 2 of 3</span>
              <h2 className="text-xl font-bold text-foreground">Market Event Discovered! 📰</h2>
            </div>
            <button onClick={startEventStep} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00B4D8] hover:underline"><RefreshCw className="size-3.5" /> Draw New Event</button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 dark:bg-amber-500/15">
              <div className="flex items-start gap-4">
                <span className="text-5xl">{currentEvent.emoji}</span>
                <div className="space-y-1">
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">{currentEvent.title}</span>
                  <h3 className="text-lg font-extrabold text-foreground mt-1">"{currentEvent.headline}"</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">{currentEvent.story}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Clock3 className="size-4" /> Event timeline</div>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <div className="rounded-xl border border-border bg-white/70 p-3">1. The event becomes public.</div>
                <div className="rounded-xl border border-border bg-white/70 p-3">2. Traders react and prices move.</div>
                <div className="rounded-xl border border-border bg-white/70 p-3">3. Your portfolio may gain or lose value.</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Your portfolio snapshot</h4>
            <div className="flex flex-wrap gap-2">
              {selectedAssets.map((symbol) => {
                const asset = displayAssets.find((entry) => entry.symbol === symbol)
                if (!asset) return null
                return (
                  <div key={symbol} className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground">
                    <span>{asset.icon}</span><span>{asset.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#00B4D8]/20 bg-[#00B4D8]/10 p-4">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#00B4D8]">What the chart says</div>
            <PortfolioTrendChart predicted={currentEvent.chartSeries.predicted} actual={currentEvent.chartSeries.actual} />
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={startPredictStep} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:-translate-y-0.5 transition-all">
              Make your predictions <ArrowRight className="size-4" />
            </button>
          </div>
        </Card>
      )}

      {/* STEP 3: PREDICT */}
      {gameState === 'predict' && (
        <Card className="p-6 sm:p-8 space-y-6 rounded-3xl border-border/80 shadow-lg">
          <div className="border-b border-border/60 pb-4">
            <span className="text-xs font-extrabold text-[#00B4D8] uppercase tracking-wider">Step 3 of 3</span>
            <h2 className="text-xl font-bold text-foreground">Make Your Market Predictions 🎯</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Answer the 3 prediction questions based on the event: "{currentEvent.headline}"</p>
          </div>

          <div className="rounded-2xl border border-[#00B4D8]/20 bg-[#00B4D8]/10 p-4 text-sm text-slate-700">
            <div className="flex items-center gap-2 font-semibold text-[#00B4D8]"><Lightbulb className="size-4" /> Use your portfolio knowledge</div>
            <p className="mt-1">Think about which stock in your portfolio is most exposed, how the event changes demand, and whether the whole portfolio should rise or fall.</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-foreground">1. Which asset in your portfolio should gain the MOST?</h3>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {predictionChoices.map((choice) => (
                <button key={choice.symbol} onClick={() => setPredWinner(choice.symbol)} className={cn('rounded-xl border p-3 text-left text-xs font-semibold transition-all cursor-pointer', predWinner === choice.symbol ? 'border-[#00B4D8] bg-[#00B4D8]/15 text-[#00B4D8] shadow-sm' : 'border-border bg-card hover:bg-muted/40 text-muted-foreground')}>{choice.label}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-extrabold text-foreground">2. What happens to your total portfolio value over the next 6 months?</h3>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {currentEvent.choices.question2.map((c) => (
                <button key={c.direction} onClick={() => setPredDirection(c.direction)} className={cn('rounded-xl border p-3 text-left text-xs font-semibold transition-all cursor-pointer', predDirection === c.direction ? 'border-[#00B4D8] bg-[#00B4D8]/15 text-[#00B4D8] shadow-sm' : 'border-border bg-card hover:bg-muted/40 text-muted-foreground')}>{c.label}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-extrabold text-foreground">3. What is the strongest reason behind your prediction?</h3>
            <div className="space-y-2">
              {currentEvent.choices.question3.map((c) => (
                <button key={c.reasonId} onClick={() => setPredReason(c.reasonId)} className={cn('w-full rounded-xl border p-3 text-left text-xs font-semibold transition-all cursor-pointer', predReason === c.reasonId ? 'border-[#00B4D8] bg-[#00B4D8]/15 text-[#00B4D8] shadow-sm' : 'border-border bg-card hover:bg-muted/40 text-muted-foreground')}>{c.text}</button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={calculateResult} disabled={!predWinner || !predDirection || !predReason} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 disabled:opacity-50 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all">Reveal results & score points 🏆</button>
          </div>
        </Card>
      )}

      {/* STEP 4: RESULT */}
      {gameState === 'result' && (
        <Card className="p-6 sm:p-8 space-y-6 rounded-3xl border-border/80 shadow-xl bg-gradient-to-b from-card to-muted/20">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30"><Trophy className="size-8" /></div>
            <div>
              <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success border border-success/30">Prediction complete! 🎉</span>
              <h2 className="text-2xl font-extrabold text-foreground mt-2">You earned +{tokensEarned} bonus tokens and +{score} XP!</h2>
            </div>
          </div>

          <div className="rounded-2xl border border-[#00B4D8]/30 bg-[#00B4D8]/10 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00B4D8]"><Sparkles className="size-4" /> Prof. Algo&apos;s event analysis</div>
            <p className="text-xs sm:text-sm text-foreground leading-relaxed">{currentEvent.explanation}</p>
          </div>

          <PortfolioTrendChart predicted={currentEvent.chartSeries.predicted} actual={currentEvent.chartSeries.actual} />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <div className="text-[11px] font-semibold text-muted-foreground">Top winner stock</div>
              <div className="text-sm font-extrabold text-foreground mt-1">{currentEvent.winnerSymbol}</div>
              <div className="text-[10px] text-success font-bold mt-0.5">{predWinner === currentEvent.winnerSymbol ? '✓ Correct guess!' : 'Nice try!'}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <div className="text-[11px] font-semibold text-muted-foreground">Portfolio impact</div>
              <div className="text-sm font-extrabold text-foreground mt-1">+{currentEvent.portfolioChangePct}%</div>
              <div className="text-[10px] text-success font-bold mt-0.5">{predDirection === currentEvent.overallDirection ? '✓ Correct direction!' : 'Good insight!'}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <div className="text-[11px] font-semibold text-muted-foreground">Reasoning level</div>
              <div className="text-sm font-extrabold text-foreground mt-1">{score >= 100 ? 'Mastermind 🧠' : 'Learner 🌱'}</div>
              <div className="text-[10px] text-primary font-bold mt-0.5">+150 learning score</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
            <button onClick={restartGame} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all"><RotateCcw className="size-4" /> Play another event</button>
            <a href="/case-studies" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all">Explore case studies <ArrowRight className="size-4" /></a>
          </div>
        </Card>
      )}
    </div>
  )
}
