'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AIBuddyPortrait } from './ai-buddy-portrait'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lock,
  TrendingUp,
  BookOpen,
  LayoutDashboard,
  Trophy,
  Gamepad2,
  Check,
} from 'lucide-react'

export function ProfAlgoOnboardingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const router = useRouter()

  if (!isOpen) return null

  const handleFinishOnboarding = (destination: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('MM_FLOW_ONBOARDED', 'true')
    }
    onClose()
    router.push(destination)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <Card className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#00B4D8]/40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Glow ambient background */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#00B4D8]/20 blur-3xl" />

        {/* Top Step Progress Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#00B4D8] text-xs font-extrabold text-slate-950">
              {step}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              {step === 1 && 'Step 1 of 3: Welcome to MarketMind'}
              {step === 2 && "Step 2 of 3: Stock Market Basics (Do's & Don'ts)"}
              {step === 3 && 'Step 3 of 3: Ready to Buy Your First Stocks!'}
            </span>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-[#00B4D8]' : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: WELCOME & SITE OVERVIEW */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <AIBuddyPortrait size={90} speaking={true} />
              <div className="space-y-1.5">
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 bg-cyan-950/40">
                  Prof. Algo • Your AI Mentor
                </Badge>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Welcome to MarketMind! 🤖📈
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  I&apos;m Prof. Algo. I will help you master stock market investing step-by-step with zero financial risk! Here is how our platform works:
                </p>
              </div>
            </div>

            {/* Platform Feature Cards */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <LayoutDashboard className="size-4" /> 1. Dashboard & Trading
                </div>
                <p className="text-xs text-slate-400">
                  Start with $100,000 in virtual capital. Search and buy real stocks in real time.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <BookOpen className="size-4" /> 2. Market Basics & Cases
                </div>
                <p className="text-xs text-slate-400">
                  Interactive lessons explaining how stocks grow and fundamental Do&apos;s & Don&apos;ts.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Trophy className="size-4" /> 3. Live Leaderboard
                </div>
                <p className="text-xs text-slate-400">
                  Rank up alongside real active traders based on your net worth and accuracy score.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                  <Gamepad2 className="size-4" /> 4. Predictor Game <Lock className="size-3 text-amber-400" />
                </div>
                <p className="text-xs text-slate-400">
                  Locked until you buy <strong>at least 3 stocks</strong> in your portfolio!
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Next: Stock Market Basics <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BASICS OF STOCK MARKET (DO'S & DON'TS) */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <AIBuddyPortrait size={75} speaking={true} />
              <div>
                <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-950/40">
                  Stock Market 101 Primer
                </Badge>
                <h2 className="text-xl font-extrabold text-white mt-1">
                  How Stock Market Works & Essential Rules
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Before buying stocks, remember these golden rules of smart investing:
                </p>
              </div>
            </div>

            {/* Do's & Don'ts Grid */}
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              {/* DO's */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                  <CheckCircle2 className="size-4" /> What TO DO ✅
                </div>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Diversify</strong> across different industries (Tech, EV, Retail).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Buy & Hold</strong> quality companies with strong earnings over time.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Keep Cash Reserved</strong> to buy more shares when good stocks dip.</span>
                  </li>
                </ul>
              </div>

              {/* DON'Ts */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
                  <XCircle className="size-4" /> What NOT TO DO ❌
                </div>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span><strong>Don&apos;t Panic Sell</strong> on normal 1-day or 1-week market fluctuations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span><strong>Don&apos;t Put 100% Cash</strong> into a single speculative stock.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span><strong>Don&apos;t Buy Based on Hype</strong> without checking company earnings.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                ← Back
              </button>

              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Next: Dashboard & Buy Stocks <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DASHBOARD GUIDED BUY & HOLD TOUR */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <AIBuddyPortrait size={85} speaking={true} />
              <div className="space-y-1">
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-950/40">
                  Final Step • Mission Objective
                </Badge>
                <h2 className="text-xl font-extrabold text-white">
                  Buy 3 Stocks to Unlock the Predictor Game! 🚀
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your starting account has <strong>$100,000 in virtual cash</strong> waiting on your Dashboard.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                <Lock className="size-4 text-amber-400" /> Goal: Unlock Predictor Game
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. Head to your Dashboard market grid.<br />
                2. Click <strong>&ldquo;Buy&rdquo;</strong> on at least <strong>3 different stocks</strong> (e.g. Apple, Tesla, Nvidia).<br />
                3. Once you own 3 stocks, the <strong>Predictor Game</strong> will automatically UNLOCK!
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => setStep(2)}
                className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                ← Back
              </button>

              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('MM_FLOW_ONBOARDED', 'true')
                  }
                  onClose()
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Let&apos;s Start Trading! <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
