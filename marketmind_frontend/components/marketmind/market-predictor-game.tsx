'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Trophy,
  Zap,
  TrendingUp,
  TrendingDown,
  Gamepad2,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Award,
  Play,
  RotateCcw,
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
  choices: {
    question1: { symbol: string; label: string }[]
    question2: { direction: 'up' | 'flat' | 'down'; label: string }[]
    question3: { reasonId: string; text: string; isCorrect: boolean }[]
  }
}

const MARKET_EVENTS: MarketEvent[] = [
  {
    id: 'gaming-boom',
    title: 'The Holiday Video Game Boom! 🎮',
    emoji: '🎁',
    headline: 'Record Switch & Roblox Sales Expected This Christmas!',
    story: 'A brand-new handheld gaming device and viral multiplayer game release right before the holidays! Kids around the world add them to their Christmas wishlists.',
    winnerSymbol: 'NTDOY',
    loserSymbol: 'KO',
    overallDirection: 'up',
    portfolioChangePct: 18.5,
    explanation: 'Gaming companies like Nintendo and Roblox surged because millions of families purchased new games during the holidays! Consumer drinks like Coca-Cola stayed steady.',
    choices: {
      question1: [
        { symbol: 'NTDOY', label: '🍄 Nintendo & Roblox (Gaming Sector)' },
        { symbol: 'KO', label: '🥤 Coca-Cola (Drink Sector)' },
        { symbol: 'NKE', label: '👟 Nike (Sneakers)' },
      ],
      question2: [
        { direction: 'up', label: '🚀 Big Increase (+15% to +20%)' },
        { direction: 'flat', label: '➡️ Stay Flat (0%)' },
        { direction: 'down', label: '📉 Drop Down (-10%)' },
      ],
      question3: [
        { reasonId: 'r1', text: 'Because millions of kids are buying new video games for the holidays!', isCorrect: true },
        { reasonId: 'r2', text: 'Because nobody plays games in the winter', isCorrect: false },
        { reasonId: 'r3', text: 'Because smartphones were banned', isCorrect: false },
      ],
    },
  },
  {
    id: 'cocoa-shortage',
    title: 'Global Chocolate & Sugar Shortage! 🍫',
    emoji: '🌧️',
    headline: 'Extreme Drought Hits Cocoa & Sugar Cane Farms!',
    story: 'Heavy rain shortages in South America and Africa double the cost of sugar and cocoa ingredients for soda and candy makers!',
    winnerSymbol: 'TSLA',
    loserSymbol: 'KO',
    overallDirection: 'flat',
    portfolioChangePct: 2.1,
    explanation: 'Food & beverage companies faced higher ingredient costs, lowering their short-term profits. Meanwhile, tech and EV stocks were unaffected, keeping your overall portfolio balanced!',
    choices: {
      question1: [
        { symbol: 'KO', label: '🥤 Coca-Cola (Soda & Beverage)' },
        { symbol: 'TSLA', label: '⚡ Tesla & Tech (Not related to sugar)' },
        { symbol: 'dis', label: '🏰 Disney Parks' },
      ],
      question2: [
        { direction: 'up', label: '🚀 Big Surge (+25%)' },
        { direction: 'flat', label: '➡️ Stay Balanced / Flat (+2%)' },
        { direction: 'down', label: '📉 Crash Hard (-30%)' },
      ],
      question3: [
        { reasonId: 'r1', text: 'Higher sugar costs hurt soda profits, but tech stocks cushion the impact (Diversification)!', isCorrect: true },
        { reasonId: 'r2', text: 'Sugar shortages make cars go faster', isCorrect: false },
        { reasonId: 'r3', text: 'Everyone stops drinking liquid forever', isCorrect: false },
      ],
    },
  },
  {
    id: 'battery-breakthrough',
    title: 'Super Battery Invention! 🔋',
    emoji: '⚡',
    headline: 'Scientists Invent 5-Minute Fast-Charging Battery!',
    story: 'A revolutionary new battery tech makes electric cars travel 1,000 miles on a 5-minute charge, lowering manufacturing costs by 40%!',
    winnerSymbol: 'TSLA',
    loserSymbol: 'NKE',
    overallDirection: 'up',
    portfolioChangePct: 24.0,
    explanation: 'Tesla and tech stocks skyrocketed on massive electric car demand and cheaper manufacturing costs!',
    choices: {
      question1: [
        { symbol: 'TSLA', label: '⚡ Tesla Motors (EV & Battery Tech)' },
        { symbol: 'NKE', label: '👟 Nike (Sport Shoes)' },
        { symbol: 'KO', label: '🥤 Coca-Cola' },
      ],
      question2: [
        { direction: 'up', label: '🚀 Big Increase (+20% to +30%)' },
        { direction: 'flat', label: '➡️ Stay Same' },
        { direction: 'down', label: '📉 Drop Down' },
      ],
      question3: [
        { reasonId: 'r1', text: 'Cheaper, faster batteries make electric cars way more attractive to millions of buyers!', isCorrect: true },
        { reasonId: 'r2', text: 'Batteries are used to power shoes', isCorrect: false },
        { reasonId: 'r3', text: 'Car prices always go up when batteries get cheaper', isCorrect: false },
      ],
    },
  },
]

export function MarketPredictorGame() {
  const { showToast } = useAuth()
  const [selectedAssets, setSelectedAssets] = useState<string[]>(['aapl', 'dis', 'ntdoy'])
  const [gameState, setGameState] = useState<'build' | 'event' | 'predict' | 'result'>('build')
  const [currentEvent, setCurrentEvent] = useState<MarketEvent>(MARKET_EVENTS[0])

  // User Predictions
  const [predWinner, setPredWinner] = useState<string>('')
  const [predDirection, setPredDirection] = useState<'up' | 'flat' | 'down' | ''>('')
  const [predReason, setPredReason] = useState<string>('')

  // Scoring
  const [score, setScore] = useState<number>(0)
  const [tokensEarned, setTokensEarned] = useState<number>(0)
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false)

  // Typewriter effect state
  const [dialogueText, setDialogueText] = useState('')
  const [displayedDialogue, setDisplayedDialogue] = useState('')

  const toggleAsset = (id: string) => {
    if (selectedAssets.includes(id)) {
      if (selectedAssets.length <= 2) {
        showToast('Keep at least 2 stocks!', 'A good portfolio has a few different stocks.', 'info')
        return
      }
      setSelectedAssets((prev) => prev.filter((a) => a !== id))
    } else {
      if (selectedAssets.length >= 4) {
        showToast('Portfolio Full!', 'Pick up to 4 stocks for your game portfolio.', 'info')
        return
      }
      setSelectedAssets((prev) => [...prev, id])
    }
  }

  const startEventStep = () => {
    const randomEvt = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)]
    setCurrentEvent(randomEvt)
    setGameState('event')
    setDialogueText(`Welcome to the Market Event Predictor! 🎲 An event has just occurred: "${randomEvt.title}". Read the headline and let\'s predict what happens!`)
  }

  const startPredictStep = () => {
    setGameState('predict')
    setDialogueText(`Look at your portfolio! 📊 Now choose your predictions: Which stock gains the most, what happens to total value, and why?`)
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
    setRewardClaimed(false)
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

      {/* STEP 1: BUILD PORTFOLIO */}
      {gameState === 'build' && (
        <Card className="p-6 sm:p-8 space-y-6 rounded-3xl border-border/80 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <span className="text-xs font-extrabold text-[#00B4D8] uppercase tracking-wider">Step 1 of 3</span>
              <h2 className="text-xl font-bold text-foreground">Pick 3 or 4 Stocks for Your Game Portfolio</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose companies you know to build a balanced mix of tech, entertainment, and drinks!
              </p>
            </div>
            <Badge variant="default" className="text-xs px-3 py-1 font-bold">
              {selectedAssets.length} / 4 Selected
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GAME_ASSETS.map((asset) => {
              const isSelected = selectedAssets.includes(asset.id)
              return (
                <button
                  key={asset.id}
                  onClick={() => toggleAsset(asset.id)}
                  className={cn(
                    'group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer',
                    isSelected
                      ? 'border-[#00B4D8] bg-[#00B4D8]/10 shadow-md shadow-cyan-500/10'
                      : 'border-border bg-card/60 hover:border-primary/40 hover:bg-muted/40'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl mb-2">{asset.icon}</span>
                    {isSelected && (
                      <span className="flex size-6 items-center justify-center rounded-full bg-[#00B4D8] text-white">
                        <CheckCircle2 className="size-4" />
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-foreground text-sm">{asset.name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">{asset.symbol}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{asset.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={startEventStep}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:-translate-y-0.5 transition-all"
            >
              Draw Market Event <ArrowRight className="size-4" />
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
            <button
              onClick={startEventStep}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00B4D8] hover:underline"
            >
              <RefreshCw className="size-3.5" /> Draw New Event
            </button>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 dark:bg-amber-500/15">
            <div className="flex items-start gap-4">
              <span className="text-5xl">{currentEvent.emoji}</span>
              <div className="space-y-1">
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  {currentEvent.title}
                </span>
                <h3 className="text-lg font-extrabold text-foreground mt-1">
                  "{currentEvent.headline}"
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  {currentEvent.story}
                </p>
              </div>
            </div>
          </div>

          {/* Current Portfolio Quick View */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Your Game Portfolio Assets
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedAssets.map((id) => {
                const asset = GAME_ASSETS.find((a) => a.id === id)
                if (!asset) return null
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground"
                  >
                    <span>{asset.icon}</span>
                    <span>{asset.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={startPredictStep}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:-translate-y-0.5 transition-all"
            >
              Make Your Predictions <ArrowRight className="size-4" />
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
            <p className="text-xs text-muted-foreground mt-0.5">
              Answer the 3 prediction questions based on the event: "{currentEvent.headline}"
            </p>
          </div>

          {/* Q1: Which Stock Gains Most */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-foreground">
              1. Which asset in your portfolio will gain the MOST from this event?
            </h3>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {currentEvent.choices.question1.map((c) => (
                <button
                  key={c.symbol}
                  onClick={() => setPredWinner(c.symbol)}
                  className={cn(
                    'rounded-xl border p-3 text-left text-xs font-semibold transition-all cursor-pointer',
                    predWinner === c.symbol
                      ? 'border-[#00B4D8] bg-[#00B4D8]/15 text-[#00B4D8] shadow-sm'
                      : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q2: Overall Portfolio Direction */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-extrabold text-foreground">
              2. What happens to your TOTAL portfolio value over the next 6 Months?
            </h3>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {currentEvent.choices.question2.map((c) => (
                <button
                  key={c.direction}
                  onClick={() => setPredDirection(c.direction)}
                  className={cn(
                    'rounded-xl border p-3 text-left text-xs font-semibold transition-all cursor-pointer',
                    predDirection === c.direction
                      ? 'border-[#00B4D8] bg-[#00B4D8]/15 text-[#00B4D8] shadow-sm'
                      : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q3: Why */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-extrabold text-foreground">
              3. What is the main financial reason behind your prediction?
            </h3>
            <div className="space-y-2">
              {currentEvent.choices.question3.map((c) => (
                <button
                  key={c.reasonId}
                  onClick={() => setPredReason(c.reasonId)}
                  className={cn(
                    'w-full rounded-xl border p-3 text-left text-xs font-semibold transition-all cursor-pointer',
                    predReason === c.reasonId
                      ? 'border-[#00B4D8] bg-[#00B4D8]/15 text-[#00B4D8] shadow-sm'
                      : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                  )}
                >
                  {c.text}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={calculateResult}
              disabled={!predWinner || !predDirection || !predReason}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 disabled:opacity-50 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all"
            >
              Reveal Results & Claim Tokens 🏆
            </button>
          </div>
        </Card>
      )}

      {/* STEP 4: RESULT */}
      {gameState === 'result' && (
        <Card className="p-6 sm:p-8 space-y-6 rounded-3xl border-border/80 shadow-xl bg-gradient-to-b from-card to-muted/20">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
              <Trophy className="size-8" />
            </div>

            <div>
              <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success border border-success/30">
                Prediction Completed! 🎉
              </span>
              <h2 className="text-2xl font-extrabold text-foreground mt-2">
                You Earned +{tokensEarned} Bonus Tokens & +{score} XP!
              </h2>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="rounded-2xl border border-[#00B4D8]/30 bg-[#00B4D8]/10 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00B4D8]">
              <Sparkles className="size-4" /> Prof. Algo&apos;s Event Analysis
            </div>
            <p className="text-xs sm:text-sm text-foreground leading-relaxed">
              {currentEvent.explanation}
            </p>
          </div>

          {/* Answers Breakdown */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <div className="text-[11px] font-semibold text-muted-foreground">Top Winner Stock</div>
              <div className="text-sm font-extrabold text-foreground mt-1">
                {currentEvent.winnerSymbol}
              </div>
              <div className="text-[10px] text-success font-bold mt-0.5">
                {predWinner === currentEvent.winnerSymbol ? '✓ Correct Guess!' : 'Nice try!'}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <div className="text-[11px] font-semibold text-muted-foreground">Portfolio Impact</div>
              <div className="text-sm font-extrabold text-foreground mt-1">
                +{currentEvent.portfolioChangePct}%
              </div>
              <div className="text-[10px] text-success font-bold mt-0.5">
                {predDirection === currentEvent.overallDirection ? '✓ Correct Direction!' : 'Good insight!'}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <div className="text-[11px] font-semibold text-muted-foreground">Economic Reasoning</div>
              <div className="text-sm font-extrabold text-foreground mt-1">
                {score >= 100 ? 'Mastermind 🧠' : 'Learner 🌱'}
              </div>
              <div className="text-[10px] text-primary font-bold mt-0.5">
                +150 Learning Score
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
            <button
              onClick={restartGame}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all"
            >
              <RotateCcw className="size-4" /> Play Another Event
            </button>

            <a
              href="/case-studies"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all"
            >
              Explore Case Studies <ArrowRight className="size-4" />
            </a>
          </div>
        </Card>
      )}
    </div>
  )
}
