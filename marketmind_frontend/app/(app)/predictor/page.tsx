'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock, ShieldCheck, ArrowRight, Sparkles, TrendingUp } from 'lucide-react'
import { AIBuddyPortrait } from '@/components/marketmind/ai-buddy-portrait'
import { MarketPredictorGame } from '@/components/marketmind/market-predictor-game'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'

export default function PredictorPage() {
  const [holdingsCount, setHoldingsCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.portfolio()
      .then((data) => {
        setHoldingsCount(data?.holdings?.length || 0)
      })
      .catch(() => {
        setHoldingsCount(0)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="size-12 rounded-full border-4 border-[#00B4D8]/30 border-t-[#00B4D8] animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Loading Predictor Game...</p>
        </div>
      </div>
    )
  }

  // Lock gate — user has < 3 stocks
  if (holdingsCount !== null && holdingsCount < 3) {
    const stocksNeeded = 3 - holdingsCount

    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[65vh]">
          <Card className="relative max-w-xl w-full overflow-hidden rounded-3xl border border-[#00B4D8]/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-8 sm:p-10 text-white shadow-2xl">
            {/* Ambient glow effects */}
            <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[#00B4D8]/15 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 size-56 rounded-full bg-purple-500/10 blur-3xl" />

            <div className="relative flex flex-col items-center text-center space-y-6">
              {/* Lock icon with pulse animation */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
                <div className="relative flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/40">
                  <Lock className="size-10 text-amber-400" />
                </div>
              </div>

              {/* Prof Algo avatar */}
              <div className="flex flex-col items-center gap-2">
                <AIBuddyPortrait size={80} speaking={true} floating={true} />
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 bg-cyan-950/40 text-xs font-bold">
                  Prof. Algo • Your AI Mentor
                </Badge>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Predictor Game is Locked 🔒
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                  Before you can predict market movements, you need real portfolio experience! 
                  Buy at least <strong className="text-[#00E5FF]">3 different stocks</strong> on your Dashboard to unlock this game.
                </p>
              </div>

              {/* Progress indicator */}
              <div className="w-full max-w-xs space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Stocks Owned</span>
                  <span className="text-[#00E5FF]">{holdingsCount} / 3</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00B4D8] to-[#00E5FF] transition-all duration-700 ease-out"
                    style={{ width: `${Math.min((holdingsCount / 3) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  {stocksNeeded === 1
                    ? 'Just 1 more stock to go! 🔥'
                    : stocksNeeded === 2
                      ? '2 more stocks needed — you\'re getting closer!'
                      : 'Buy 3 stocks on your Dashboard to unlock the game!'}
                </p>
              </div>

              {/* Requirements */}
              <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <ShieldCheck className="size-4 text-[#00B4D8]" /> Unlock Requirements
                </div>
                <div className="space-y-2">
                  {[
                    { text: 'Buy your 1st stock', done: holdingsCount >= 1 },
                    { text: 'Buy your 2nd stock', done: holdingsCount >= 2 },
                    { text: 'Buy your 3rd stock to unlock!', done: holdingsCount >= 3 },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        req.done
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}>
                        {req.done ? '✓' : i + 1}
                      </div>
                      <span className={req.done ? 'text-emerald-400 line-through' : 'text-slate-300'}>{req.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] px-8 py-4 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all"
              >
                <TrendingUp className="size-4" />
                Go to Dashboard & Buy Stocks
                <ArrowRight className="size-4" />
              </Link>

              {/* Motivation footer */}
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                <Sparkles className="size-3 text-amber-400" />
                <span>Earn XP and tokens for every prediction you make!</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // User has ≥ 3 stocks — show the game
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <MarketPredictorGame />
    </div>
  )
}
