'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  BrainCircuit, 
  Sparkles, 
  Clock, 
  Trophy, 
  CheckCircle2, 
  ChevronRight, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  RotateCcw,
  Zap,
  Info
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AIBuddyPortrait } from '@/components/marketmind/ai-buddy-portrait'
import { FinanceGlossaryModal } from '@/components/marketmind/finance-glossary-modal'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface KeyConcept {
  term: string
  definition: string
}

interface TickOption {
  id: string
  label: string
  description: string
  risk: number
  pnl_impact: number
  memory_tag: string
  prof_algo_reaction: string
}

interface SimTick {
  step: number
  date: string
  headline: string
  index_val: number
  pct_change: number
  market_sentiment: string
  prof_algo_comment: string
  options: TickOption[]
}

interface ChapterData {
  id: string
  title: string
  era: string
  difficulty: string
  read_time: string
  image: string
  tags: string[]
  reward_xp: number
  badge_reward: string
  summary: string
  study: {
    prof_algo_intro: string
    historical_background: string
    key_concepts: KeyConcept[]
    key_indicators: Record<string, any>
  }
  simulation: {
    initial_index: number
    starting_cash: number
    ticks: SimTick[]
  }
}

export default function StoryChapterPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { profile, refresh: refreshAuth } = useAuth()

  const [chapter, setChapter] = useState<ChapterData | null>(null)
  const [completed, setCompleted] = useState(false)
  const [userCash, setUserCash] = useState<number>(100000)
  const [traderPersona, setTraderPersona] = useState<string>('Market Apprentice')
  const [loading, setLoading] = useState(true)

  // Game state
  const [phase, setPhase] = useState<'study' | 'simulate' | 'complete'>('study')
  const [currentStepIdx, setCurrentStepIdx] = useState(0) // 0-based for ticks array
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [positionPct, setPositionPct] = useState<number>(0.5) // 50% cash allocation
  const [executing, setExecuting] = useState(false)
  const [stepResult, setStepResult] = useState<any | null>(null)
  const [glossaryOpen, setGlossaryOpen] = useState(false)

  // Chart data built dynamically from sim ticks
  const [chartPoints, setChartPoints] = useState<Array<{ name: string; value: number }>>([])

  useEffect(() => {
    if (id) {
      api.storyChapter(id)
        .then((data) => {
          setChapter(data.chapter)
          setCompleted(data.completed)
          setUserCash(data.user_cash || 100000)
          setTraderPersona(data.algo_memory?.trader_persona || 'Market Apprentice')

          // Build initial chart curve
          if (data.chapter?.simulation?.ticks) {
            const points = [
              { name: 'Start', value: data.chapter.simulation.initial_index },
              ...data.chapter.simulation.ticks.map((t: SimTick) => ({
                name: t.date.split(' ')[0],
                value: t.index_val
              }))
            ]
            setChartPoints(points)
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading || !chapter) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="size-12 animate-spin rounded-full border-4 border-[#00B4D8] border-t-transparent" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading Story Chapter & Prof Algo...</p>
      </div>
    )
  }

  const currentTick = chapter.simulation.ticks[currentStepIdx]
  const isLastTick = currentStepIdx >= chapter.simulation.ticks.length - 1

  const handleExecuteChoice = async () => {
    if (!selectedOptionId || executing) return
    setExecuting(true)

    try {
      const res = await api.storyExecute(id, {
        step_index: currentTick.step,
        option_id: selectedOptionId,
        position_pct: positionPct,
      })

      setStepResult(res)
      setUserCash(res.updated_cash)
      setTraderPersona(res.trader_persona)
      refreshAuth()
    } catch (err) {
      console.error(err)
    } finally {
      setExecuting(false)
    }
  }

  const handleNextTick = () => {
    setStepResult(null)
    setSelectedOptionId(null)
    if (isLastTick) {
      setPhase('complete')
    } else {
      setCurrentStepIdx(prev => prev + 1)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <FinanceGlossaryModal isOpen={glossaryOpen} onClose={() => setGlossaryOpen(false)} />

      {/* Top Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/story"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Calamities Map</span>
        </Link>

        <div className="flex items-center gap-3">
          <Badge variant="muted" className="text-xs">
            {chapter.era}
          </Badge>
          <button
            onClick={() => setGlossaryOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#00B4D8]/30 bg-[#00B4D8]/10 px-3 py-1 text-xs font-bold text-[#00B4D8] hover:bg-[#00B4D8]/20 transition-all"
          >
            <Info className="size-3.5" />
            <span>Dictionary 📖</span>
          </button>
        </div>
      </div>

      {/* Chapter Title Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>Chapter Experience</span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              {chapter.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-medium">Your Virtual Cash Balance</p>
              <p className="text-lg font-extrabold text-emerald-400 tabular-nums">
                ${userCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-medium">Prof Algo Persona</p>
              <p className="text-xs font-bold text-cyan-300">
                {traderPersona}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 1: STUDY PHASE */}
      {phase === 'study' && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Prof Algo Dialogue Banner */}
          <Card className="p-6 lg:col-span-8 space-y-6 border-slate-200/80">
            <div className="flex items-start gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-lg border border-indigo-500/20">
              <AIBuddyPortrait size={64} floating={false} speaking />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <BrainCircuit className="size-4" />
                  <span>Prof Algo Narrates:</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-200">
                  "{chapter.study.prof_algo_intro}"
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Historical Context & Background
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {chapter.study.historical_background}
              </p>
            </div>

            {/* Key Concepts List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Key Concepts to Master
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {chapter.study.key_concepts.map((kc) => (
                  <div key={kc.term} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1">
                    <span className="text-xs font-bold text-indigo-600">{kc.term}</span>
                    <p className="text-xs text-slate-600 leading-normal">{kc.definition}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Sim Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPhase('simulate')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#0077B6] px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                <span>Enter Live Calamity Simulator</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </Card>

          {/* Right Sidebar Key Indicators */}
          <Card className="p-5 lg:col-span-4 space-y-5 border-slate-200/80 h-fit">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="size-4 text-amber-500" />
              <span>Historical Indicators</span>
            </h3>

            <div className="space-y-3">
              {Object.entries(chapter.study.key_indicators).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between rounded-xl bg-slate-100/70 p-3 text-xs">
                  <span className="font-medium text-slate-600">{key}</span>
                  <span className="font-bold text-slate-900 tabular-nums">{val}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20 text-xs space-y-2 text-amber-900">
              <span className="font-bold flex items-center gap-1.5 text-amber-700">
                <AlertTriangle className="size-4" />
                <span>Simulation Rule</span>
              </span>
              <p className="leading-relaxed">
                Trades in this calamity simulation will affect your actual virtual cash balance ($100k+). Make decisions carefully!
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* PHASE 2: REAL FAKE CASH CALAMITY SIMULATOR */}
      {phase === 'simulate' && currentTick && (
        <div className="space-y-6">
          {/* Breaking News Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950 via-red-900 to-slate-950 p-4 text-white shadow-lg border border-rose-500/40">
            <div className="flex items-center gap-3">
              <span className="flex size-3 items-center justify-center rounded-full bg-rose-500 animate-ping" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  BREAKING NEWS ({currentTick.date})
                </span>
                <p className="text-xs font-bold text-rose-100 sm:text-sm">
                  {currentTick.headline}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left: Dynamic Crash & Rally Chart */}
            <Card className="p-5 lg:col-span-7 space-y-4 border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Market Movement</h3>
                  <p className="text-xs text-slate-500">
                    Historical Index Level — {currentTick.date}
                  </p>
                </div>
                <Badge variant={currentTick.pct_change >= 0 ? 'success' : 'danger'}>
                  {currentTick.pct_change >= 0 ? '+' : ''}{currentTick.pct_change.toFixed(1)}%
                </Badge>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartPoints} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="storyFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00B4D8" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#00B4D8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#00B4D8" strokeWidth={3} fill="url(#storyFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Prof Algo Guidance */}
              <div className="flex items-start gap-3 rounded-2xl bg-indigo-950 p-4 text-white border border-indigo-500/30">
                <AIBuddyPortrait size={40} floating={false} />
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-cyan-300">Prof Algo Advice:</span>
                  <p className="text-slate-200 leading-relaxed">
                    "{currentTick.prof_algo_comment}"
                  </p>
                </div>
              </div>
            </Card>

            {/* Right: Trading Terminal & Choices */}
            <Card className="p-5 lg:col-span-5 space-y-5 border-slate-200/80">
              <div>
                <h3 className="font-bold text-slate-900">Trading Terminal (Step {currentStepIdx + 1}/{chapter.simulation.ticks.length})</h3>
                <p className="text-xs text-slate-500">
                  Select your action and position size to trade through the crisis.
                </p>
              </div>

              {/* Cash Sizing Slider */}
              <div className="space-y-2 rounded-xl bg-slate-100/80 p-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Position Sizing:</span>
                  <span className="text-indigo-600 font-extrabold">{Math.round(positionPct * 100)}% of Fake Cash</span>
                </div>
                <div className="flex gap-1.5">
                  {[0.25, 0.50, 0.75, 1.0].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setPositionPct(pct)}
                      className={`flex-1 rounded-lg py-1 text-[11px] font-bold transition-all ${
                        positionPct === pct 
                          ? 'bg-[#00B4D8] text-white shadow-sm' 
                          : 'bg-white text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {pct * 100}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Options List */}
              <div className="space-y-2.5">
                {currentTick.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOptionId(opt.id)}
                    disabled={!!stepResult}
                    className={`w-full text-left rounded-2xl border p-4 text-xs transition-all ${
                      selectedOptionId === opt.id
                        ? 'border-[#00B4D8] bg-[#00B4D8]/10 ring-2 ring-[#00B4D8]/30 font-semibold'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between font-extrabold text-slate-900">
                      <span>{opt.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${opt.risk >= 70 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                        Risk: {opt.risk}%
                      </span>
                    </div>
                    <p className="mt-1 text-slate-500 font-normal leading-normal">
                      {opt.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Execute / Result View */}
              {!stepResult ? (
                <button
                  onClick={handleExecuteChoice}
                  disabled={!selectedOptionId || executing}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50 hover:shadow-emerald-500/25 transition-all"
                >
                  {executing ? 'Executing Fake Cash Trade...' : 'Confirm Action & Trade'}
                </button>
              ) : (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50/60 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-900">Trade Result:</span>
                    <span className={`text-sm ${stepResult.pnl_amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stepResult.pnl_amount >= 0 ? '+' : ''}${stepResult.pnl_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-900 p-3 text-white text-xs space-y-1">
                    <span className="text-cyan-300 font-bold">Prof Algo Memory Reaction:</span>
                    <p className="text-slate-200 italic leading-relaxed">
                      "{stepResult.prof_algo_reaction}"
                    </p>
                  </div>

                  <button
                    onClick={handleNextTick}
                    className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{isLastTick ? 'Complete Chapter & View Leaderboard' : 'Proceed to Next Crisis Tick'}</span>
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* PHASE 3: RETROSPECTIVE & LEADERBOARD RANK-UP */}
      {phase === 'complete' && stepResult && (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-8 text-center space-y-6 border-emerald-500/40 bg-gradient-to-b from-emerald-50/50 to-white shadow-2xl">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-white shadow-lg">
              <Trophy className="size-10" />
            </div>

            <div>
              <Badge variant="success" className="mb-2">Chapter Complete</Badge>
              <h2 className="text-3xl font-black text-slate-900">
                You Survived {chapter.title}!
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Your trades were persisted to your real portfolio cash balance.
              </p>
            </div>

            {/* Rank Shift Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl space-y-2 border border-cyan-500/30">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                🏆 Leaderboard Rank Update
              </span>
              <div className="flex items-center justify-center gap-4 text-2xl font-black">
                <span className="text-slate-400">Rank #{stepResult.old_rank || 'N/A'}</span>
                <ChevronRight className="size-6 text-[#00B4D8]" />
                <span className="text-emerald-400">Rank #{stepResult.new_rank}</span>
              </div>
              {stepResult.rank_change > 0 && (
                <p className="text-xs font-extrabold text-cyan-300">
                  🎉 You jumped +{stepResult.rank_change} places UP on the Global Leaderboard!
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500 font-semibold">Story XP Earned</p>
                <p className="text-xl font-extrabold text-amber-500">+{stepResult.xp_earned} XP</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500 font-semibold">Updated Trader Persona</p>
                <p className="text-sm font-bold text-slate-900">{stepResult.trader_persona}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/leaderboard"
                className="flex-1 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-all text-center"
              >
                View Global Leaderboard 🏆
              </Link>
              <Link
                href="/story"
                className="flex-1 rounded-xl bg-[#00B4D8] py-3 text-xs font-bold text-white hover:bg-[#0077B6] transition-all text-center"
              >
                Next Calamity Chapter 📜
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
