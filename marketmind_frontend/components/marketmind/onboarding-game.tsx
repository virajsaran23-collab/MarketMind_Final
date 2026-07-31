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
    <div 
      className="fixed inset-0 z-[100] flex flex-col bg-gradient-to-br from-[#E0F2FE] via-[#ECFDF5] to-[#FFF9C4] bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] [background-size:24px_24px] select-none overflow-hidden"
      onClick={handleTap}
    >
      <style>{`
        @keyframes algo-wiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-3deg) scale(1.02); }
          75% { transform: rotate(3deg) scale(1.02); }
        }
        .animate-wiggle {
          animation: algo-wiggle 0.5s ease-in-out;
        }
        .cartoon-bubble {
          border: 4px solid #0F172A;
          box-shadow: 8px 8px 0px 0px rgba(15,23,42,0.1);
        }
        .cartoon-btn {
          border: 3px solid #0F172A;
          box-shadow: 4px 4px 0px 0px rgba(15,23,42,0.1);
          transition: all 0.1s ease;
        }
        .cartoon-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px 0px rgba(15,23,42,0.1);
        }
        .cartoon-btn:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px 0px rgba(15,23,42,0.1);
        }
        @keyframes pop-in {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop {
          animation: pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Top status bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/75 backdrop-blur-md border-b-3 border-[#0F172A] relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-[#00B4D8]/20 p-1 rounded-lg border border-[#00B4D8]">
            <Sparkles className="size-4 text-[#00B4D8]" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-[#0F172A] uppercase tracking-wider">
            Prof. Algo's Finance Lab 🤖
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onComplete('beginner')
            }}
            className="text-xs font-black text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-2 border-[#0F172A] px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_0px_#0F172A] active:translate-y-0.5"
          >
            Skip ✕
          </button>
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-600 bg-amber-50 border-2 border-amber-200 px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_rgba(245,158,11,0.2)]">
            <Zap className="size-3.5 fill-amber-500 text-amber-500" />
            <span>{score * 50} XP</span>
          </div>
          <div className="h-3 w-16 sm:w-24 rounded-full bg-slate-100 border-2 border-[#0F172A] overflow-hidden">
            <div
              className="h-full bg-[#00B4D8] border-r-2 border-[#0F172A] transition-all duration-500"
              style={{ width: `${Math.min(100, ((step + 1) / dialogue.current.length) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scene Area / Main Content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 max-w-5xl mx-auto w-full px-4 py-4 md:py-8 overflow-y-auto relative z-10">
        
        {/* Robot Container on right (desktop) / top (mobile) */}
        <div className="w-40 h-40 md:w-56 md:h-56 flex flex-col items-center justify-center relative order-1 md:order-2 shrink-0">
          {/* Glowing Digital Pedestal */}
          <div className="absolute bottom-2 w-32 h-6 bg-[#00B4D8]/20 border-2 border-dashed border-[#00B4D8] rounded-full blur-[1px] animate-pulse" />
          
          {/* Wiggling Robot Portrait on dialogue change */}
          <div key={step} className="animate-wiggle z-10">
            <AIBuddyPortrait size={160} speaking={!done && current?.speaker === 'algo'} className="drop-shadow-[0_8px_16px_rgba(0,180,216,0.3)]" />
          </div>
        </div>

        {/* Cartoon Speech Bubble on left (desktop) / bottom (mobile) */}
        <div 
          className="relative flex-1 bg-white rounded-[2rem] p-6 md:p-8 cartoon-bubble max-w-2xl w-full order-2 md:order-1 animate-pop flex flex-col justify-between"
          onClick={(e) => {
            // Prevent overlay handleTap from firing twice when clicking bubble content
            e.stopPropagation();
            handleTap();
          }}
        >
          {/* Speech Bubble Tail pointing to robot */}
          {/* Desktop Tail (points right) */}
          <div className="hidden md:block absolute right-[-14px] top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-r-4 border-t-4 border-[#0F172A] rotate-45 z-0" />
          {/* Mobile Tail (points up) */}
          <div className="block md:hidden absolute left-1/2 -translate-x-1/2 top-[-14px] w-6 h-6 bg-white border-l-4 border-t-4 border-[#0F172A] rotate-45 z-0" />

          <div className="relative z-10">
            {/* Speaker Label */}
            {current?.speaker === 'algo' && (
              <div className="mb-3 inline-flex items-center gap-1.5 bg-[#00B4D8] text-white border-2 border-[#0F172A] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-[2px_2px_0px_0px_#0F172A]">
                <span>Prof. Algo</span>
                <span className="size-2 rounded-full bg-white animate-ping" />
              </div>
            )}
            {current?.speaker === 'narrator' && (
              <div className="mb-3 inline-flex items-center gap-1.5 bg-slate-500 text-white border-2 border-[#0F172A] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-[2px_2px_0px_0px_#0F172A]">
                <span>System</span>
              </div>
            )}

            {/* Typewriter Dialogue Text */}
            <p className={cn(
              'text-base md:text-lg leading-relaxed font-bold text-slate-800 min-h-[4.5rem]',
              current?.speaker === 'narrator' ? 'text-slate-500 italic font-mono text-sm' : 'text-slate-800'
            )}>
              {displayed}
              {!done && <span className="inline-block w-1 h-5 bg-[#00B4D8] ml-0.5 animate-pulse align-middle" />}
            </p>

            {/* Rank Reveal inside dialogue */}
            {showRankReveal && level && (
              <div className="mt-4 flex flex-col items-center gap-2.5 p-4 bg-amber-50 rounded-2xl border-3 border-[#0F172A] shadow-[4px_4px_0px_0px_rgba(15,23,42,0.1)] animate-pop">
                <div className="size-16 bg-yellow-400 rounded-full flex items-center justify-center border-3 border-[#0F172A] animate-bounce shadow-md">
                  <Trophy className="size-8 text-white fill-yellow-100" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Your Rank Assigned!</div>
                  <div className="text-xl font-black text-[#0F172A] mt-0.5">{RANK_TITLES[level]}</div>
                </div>
                <div className="flex items-center gap-5 text-xs font-bold text-slate-700 mt-1 font-mono">
                  <span className="flex items-center gap-1 bg-white border-2 border-slate-200 px-2 py-0.5 rounded-lg"><Star className="size-3.5 text-yellow-500 fill-yellow-500" /> {RANK_XP[level]} XP</span>
                  <span className="bg-white border-2 border-slate-200 px-2 py-0.5 rounded-lg">Rank #{RANK_POSITION[level]}</span>
                </div>
              </div>
            )}

            {/* Choices */}
            {showChoices && current?.choices && (
              <div className="mt-6 flex flex-col gap-3 animate-pop">
                {current.choices.map((choice, i) => (
                  <button
                    key={choice.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChoice(choice);
                    }}
                    className="w-full text-left rounded-2xl bg-[#ECFEFF] hover:bg-[#CFFAFE] text-slate-800 py-3.5 px-5 text-sm md:text-base font-bold cartoon-btn border-3 border-[#0F172A] flex items-center gap-3 group cursor-pointer"
                  >
                    <span className="size-7 rounded-full bg-[#00B4D8] border-2 border-[#0F172A] text-white flex items-center justify-center text-xs font-black group-hover:scale-110 transition-transform shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 leading-snug">{choice.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            {/* Tap to continue indicator */}
            {done && !current?.choices && !isLastStep && !current?.autoAdvance && (
              <div className="flex items-center gap-1.5 text-xs md:text-sm font-extrabold text-slate-500 animate-pulse cursor-pointer">
                <ChevronRight className="size-4 text-[#00B4D8]" />
                <span>Tap anywhere to continue...</span>
              </div>
            )}

            {/* Final CTA */}
            {showFinalCTA && (
              <div className="animate-pop">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComplete();
                  }}
                  className="w-full sm:w-auto rounded-2xl bg-[#00E5FF] hover:bg-[#00B4D8] text-[#0F172A] text-base md:text-lg font-black px-8 py-3.5 border-4 border-[#0F172A] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[-2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="size-5 fill-yellow-200" />
                  Begin My First Case Study
                  <ChevronRight className="size-5" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
