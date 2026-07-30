'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AIBuddyPortrait } from './ai-buddy-portrait'
import { Sparkles, ChevronRight, Trophy, Star, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────── types ────────────────────────────── */
type DialogueLine = {
  speaker: 'algo' | 'narrator'
  text: string
  choices?: { label: string; value: string; score: number }[]
  /** If set, auto-advance after typing finishes (ms) */
  autoAdvance?: number
}

type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

/* ─────────────────────── useTypewriter hook ────────────────────────── */
function useTypewriter(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const idx = useRef(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Reset on new text
    setDisplayed('')
    setDone(false)
    idx.current = 0

    timer.current = setInterval(() => {
      idx.current += 1
      setDisplayed(text.slice(0, idx.current))
      if (idx.current >= text.length) {
        if (timer.current) clearInterval(timer.current)
        setDone(true)
      }
    }, speed)

    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [text, speed])

  const skip = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    setDisplayed(text)
    setDone(true)
  }, [text])

  return { displayed, done, skip }
}

/* ─────────────────────── dialogue script builder ──────────────────── */
function buildDialogue(name: string): DialogueLine[] {
  return [
    // --- Intro ---
    {
      speaker: 'narrator',
      text: '— SYSTEM BOOT —  Establishing neural link…',
      autoAdvance: 800,
    },
    {
      speaker: 'algo',
      text: `Bzzzt! Connection established! Well hello there, ${name || 'Trainer'}! I'm Prof. Algo — your AI Finance Buddy! 🤖`,
    },
    {
      speaker: 'algo',
      text: "I'm not a human advisor — I'm a purpose-built market intelligence engine. Think of me as your personal finance mentor that never sleeps, never panics, and always keeps learning!",
    },
    {
      speaker: 'algo',
      text: "Before we dive into the markets together, I need to run a quick diagnostic on YOUR financial knowledge circuits. Don't worry — there are no wrong answers, only data points! 📊",
    },

    // --- Question 1 ---
    {
      speaker: 'algo',
      text: "Question 1 of 3: When you hear 'stock market', what comes to mind first?",
      choices: [
        { label: "🤷 I'm not really sure what it is", value: 'q1_none', score: 0 },
        { label: '📈 A place where you buy and sell company shares', value: 'q1_basic', score: 1 },
        { label: '💹 An efficient market driven by supply, demand, and sentiment', value: 'q1_adv', score: 2 },
      ],
    },

    // --- React to Q1 ---
    {
      speaker: 'algo',
      text: "Interesting data point logged! My neural networks are already building your profile. Let's keep going…",
    },

    // --- Question 2 ---
    {
      speaker: 'algo',
      text: 'Question 2 of 3: If a company reports higher-than-expected earnings, what typically happens to its stock price?',
      choices: [
        { label: "🤔 I have no idea", value: 'q2_none', score: 0 },
        { label: '📈 It usually goes up!', value: 'q2_basic', score: 1 },
        { label: "📊 It depends — sometimes it's already priced in (buy the rumor, sell the news)", value: 'q2_adv', score: 2 },
      ],
    },

    // --- React to Q2 ---
    {
      speaker: 'algo',
      text: "Processing… processing… Your knowledge circuits are more interesting than most! One final scan…",
    },

    // --- Question 3 ---
    {
      speaker: 'algo',
      text: "Question 3 of 3: What does 'diversification' mean in investing?",
      choices: [
        { label: "❓ I've never heard of it", value: 'q3_none', score: 0 },
        { label: "🧺 Don't put all your eggs in one basket", value: 'q3_basic', score: 1 },
        { label: '📐 Strategically allocating across uncorrelated assets to optimize risk-adjusted returns', value: 'q3_adv', score: 2 },
      ],
    },

    // --- Result (placeholder — the component dynamically injects the correct one) ---
    {
      speaker: 'algo',
      text: '__RESULT__',
    },

    // --- Case study redirect ---
    {
      speaker: 'algo',
      text: "I've prepared a personalized learning path for you! Your first mission: complete a Case Study to earn XP and climb the ranks. Let's go! 🚀",
    },
  ]
}

/* ─────────────── rank title helpers ──────────────── */
const RANK_TITLES: Record<ExperienceLevel, string> = {
  beginner: '🌱 Market Seedling',
  intermediate: '📊 Market Analyst',
  advanced: '🧠 Market Quant',
}

const RANK_XP: Record<ExperienceLevel, number> = {
  beginner: 100,
  intermediate: 300,
  advanced: 500,
}

const RANK_POSITION: Record<ExperienceLevel, number> = {
  beginner: 42,
  intermediate: 21,
  advanced: 7,
}

/* ────────────────────────────── OnboardingGame ──────────────────────────── */
export function OnboardingGame({
  userName,
  onComplete,
}: {
  userName: string
  onComplete: (level: ExperienceLevel) => void
}) {
  const router = useRouter()
  const dialogue = useRef(buildDialogue(userName))
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [showChoices, setShowChoices] = useState(false)
  const [level, setLevel] = useState<ExperienceLevel | null>(null)
  const [showRankReveal, setShowRankReveal] = useState(false)
  const [showFinalCTA, setShowFinalCTA] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const current = dialogue.current[step]

  // Resolve the __RESULT__ placeholder line with actual result text
  const resolvedText = (() => {
    if (current?.text !== '__RESULT__') return current?.text ?? ''
    const exp = score >= 4 ? 'advanced' : score >= 2 ? 'intermediate' : 'beginner'
    const title = RANK_TITLES[exp]
    const xp = RANK_XP[exp]
    return `Diagnostic complete! 🎉 Based on my analysis, I'm classifying you as: ${title}! You start with ${xp} XP and your initial Leaderboard Rank is #${RANK_POSITION[exp]}. Impressive stuff!`
  })()

  const isLastStep = step >= dialogue.current.length - 1

  const { displayed, done, skip } = useTypewriter(resolvedText, 24)

  // When typing finishes and we're on a RESULT step, trigger rank reveal animation
  useEffect(() => {
    if (done && current?.text === '__RESULT__' && !level) {
      const exp: ExperienceLevel = score >= 4 ? 'advanced' : score >= 2 ? 'intermediate' : 'beginner'
      setLevel(exp)
      setTimeout(() => setShowRankReveal(true), 400)
    }
  }, [done, current?.text, score, level])

  // When typing finishes and we are on the last step
  useEffect(() => {
    if (done && isLastStep) {
      setTimeout(() => setShowFinalCTA(true), 600)
    }
  }, [done, isLastStep])

  // Show choices after typewriter finishes (only for choice steps)
  useEffect(() => {
    if (done && current?.choices && !showChoices) {
      setTimeout(() => setShowChoices(true), 200)
    }
  }, [done, current?.choices, showChoices])

  // Auto-advance for narrator lines
  useEffect(() => {
    if (done && current?.autoAdvance && !current?.choices) {
      const t = setTimeout(() => advance(), current.autoAdvance)
      return () => clearTimeout(t)
    }
  }, [done, current?.autoAdvance, current?.choices])

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [displayed])

  const advance = () => {
    if (step < dialogue.current.length - 1) {
      setStep((s) => s + 1)
      setShowChoices(false)
    }
  }

  const handleChoice = (choice: { label: string; value: string; score: number }) => {
    setScore((s) => s + choice.score)
    setShowChoices(false)
    advance()
  }

  const handleComplete = () => {
    const exp: ExperienceLevel = score >= 4 ? 'advanced' : score >= 2 ? 'intermediate' : 'beginner'
    onComplete(exp)
    router.push('/case-studies')
  }

  const handleTap = () => {
    if (!done) {
      skip()
    } else if (!current?.choices && !isLastStep && !current?.autoAdvance) {
      advance()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-md">
      {/* Top status bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[#00B4D8]" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">MarketMind Onboarding</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#00B4D8]">
            <Zap className="size-3.5" />
            <span>{score * 50} XP</span>
          </div>
          <div className="h-1.5 w-24 rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00B4D8] to-[#38bdf8] transition-all duration-500"
              style={{ width: `${Math.min(100, ((step + 1) / dialogue.current.length) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scene area */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Background ambience */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00B4D8]/8 blur-3xl" />

        {/* Avatar */}
        <div className={cn(
          'mb-6 transition-transform duration-500',
          !done ? 'scale-105' : 'scale-100'
        )}>
          <AIBuddyPortrait size={140} speaking={!done && current?.speaker === 'algo'} />
        </div>

        {/* Rank Reveal Animation */}
        {showRankReveal && level && (
          <div className="mb-6 animate-in zoom-in-50 fade-in duration-700 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8]/20 to-[#38bdf8]/20 border border-[#00B4D8]/30 px-5 py-3 shadow-lg shadow-cyan-500/10">
              <Trophy className="size-6 text-yellow-400" />
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Rank</div>
                <div className="text-lg font-extrabold text-white">{RANK_TITLES[level]}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-1">
              <span className="flex items-center gap-1"><Star className="size-3 text-yellow-400" /> {RANK_XP[level]} XP</span>
              <span>Rank #{RANK_POSITION[level]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Dialogue box at bottom */}
      <div
        className="relative border-t border-slate-800/60 bg-slate-900/80 backdrop-blur-sm px-4 py-5 sm:px-8 max-h-[45vh] overflow-y-auto"
        onClick={handleTap}
      >
        <div ref={scrollRef}>
          {/* Speaker label */}
          {current?.speaker === 'algo' && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#00B4D8] uppercase tracking-widest">Prof. Algo</span>
              <span className="size-2 rounded-full bg-[#00B4D8] animate-pulse" />
            </div>
          )}
          {current?.speaker === 'narrator' && (
            <div className="mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System</span>
            </div>
          )}

          {/* Typewriter text */}
          <p className={cn(
            'text-sm sm:text-base leading-relaxed font-normal min-h-[3rem]',
            current?.speaker === 'narrator' ? 'text-slate-400 italic font-mono text-xs' : 'text-slate-200'
          )}>
            {displayed}
            {!done && <span className="inline-block w-0.5 h-4 bg-[#00B4D8] ml-0.5 animate-pulse" />}
          </p>

          {/* Choices */}
          {showChoices && current?.choices && (
            <div className="mt-5 flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-400">
              {current.choices.map((choice) => (
                <button
                  key={choice.value}
                  onClick={(e) => { e.stopPropagation(); handleChoice(choice) }}
                  className="w-full text-left rounded-xl border border-slate-700/80 bg-slate-800/60 px-4 py-3 text-sm font-medium text-slate-200 hover:border-[#00B4D8]/60 hover:bg-[#00B4D8]/10 hover:text-white transition-all duration-200 group"
                >
                  <span className="group-hover:translate-x-1 inline-block transition-transform">{choice.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Tap to continue indicator */}
          {done && !current?.choices && !isLastStep && !current?.autoAdvance && (
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 animate-pulse">
              <ChevronRight className="size-3.5" />
              <span>Tap to continue…</span>
            </div>
          )}

          {/* Final CTA */}
          {showFinalCTA && (
            <div className="mt-5 animate-in fade-in zoom-in-95 duration-500">
              <button
                onClick={(e) => { e.stopPropagation(); handleComplete() }}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Sparkles className="size-4" />
                Begin My First Case Study
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
