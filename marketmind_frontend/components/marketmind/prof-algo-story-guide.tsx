'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  BrainCircuit, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  TrendingUp, 
  BookOpen, 
  Award,
  ShieldAlert,
  ArrowRight
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AIBuddyPortrait } from './ai-buddy-portrait'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'

interface Quest {
  id: string
  title: string
  description: string
  xp: number
  completed: boolean
  actionUrl?: string
  actionLabel?: string
}

export function ProfAlgoStoryGuide({ holdingsCount = 0, portfolioValue = 100000 }: { holdingsCount?: number; portfolioValue?: number }) {
  const { profile, user, refresh: refreshAuth } = useAuth()
  const [algoMemory, setAlgoMemory] = useState<any>(null)
  const [storyQuests, setStoryQuests] = useState<Quest[]>([])
  const [currentNarrative, setCurrentNarrative] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch Prof Algo's persistent memory & progress
    api.storyMode()
      .then((data) => {
        const mem = data.algo_memory || {}
        setAlgoMemory(mem)

        // Generate dynamic story quests based on user progress
        const completedCalamities = mem.calamities_completed || []
        const quests: Quest[] = [
          {
            id: 'quest-first-trade',
            title: '1. Place Your First Trade',
            description: 'Buy your first stock in the Markets using your $100,000 virtual cash balance.',
            xp: 150,
            completed: holdingsCount > 0,
            actionUrl: '/markets',
            actionLabel: 'Trade Markets',
          },
          {
            id: 'quest-diversify',
            title: '2. Build a Diversified Portfolio',
            description: 'Own at least 3 different stocks to protect your capital against sector shocks.',
            xp: 250,
            completed: holdingsCount >= 3,
            actionUrl: '/markets',
            actionLabel: 'Explore Stocks',
          },
          {
            id: 'quest-calamity-study',
            title: '3. Master Great Calamities',
            description: 'Learn how historic crashes (1929, 2008, 2020) impact the market and survive crises.',
            xp: 350,
            completed: completedCalamities.length >= 1,
            actionUrl: '/case-studies',
            actionLabel: 'Study Lessons',
          },
          {
            id: 'quest-portfolio-growth',
            title: '4. Grow Portfolio Value',
            description: 'Achieve a positive return on your fake cash portfolio and climb the Leaderboard.',
            xp: 500,
            completed: portfolioValue > 100500,
            actionUrl: '/leaderboard',
            actionLabel: 'View Leaderboard',
          },
        ]
        setStoryQuests(quests)

        // Craft Prof Algo's contextual live narrative speech
        if (holdingsCount === 0) {
          setCurrentNarrative(
            `Welcome ${user?.first_name || user?.username || 'Trader'}! I am Prof Algo, your in-game market mentor. Your story begins today with $100,000 in virtual cash. Make your first trade in Markets to unlock your initial Story XP!`
          )
        } else if (holdingsCount < 3) {
          setCurrentNarrative(
            `Great progress ${user?.first_name || user?.username || 'Trader'}! You've made your first trade. Your persona is currently "${mem.trader_persona || 'Market Apprentice'}". Now, let's diversify across 3+ stocks so inflation and supply shocks don't wipe out your gains!`
          )
        } else if (completedCalamities.length === 0) {
          setCurrentNarrative(
            `Phenomenal trading! You hold ${holdingsCount} stock positions. But remember: markets aren't always smooth sailing! Head to Case Studies to learn how the 1929 Crash & 2008 Crisis impacted investors.`
          )
        } else {
          setCurrentNarrative(
            `Sensational performance! You are currently ranked #${profile?.global_rank || 'N/A'} globally on the Leaderboard with ${mem.total_story_xp || 0} Story XP! Keep monitoring your thesis and compounding your fake cash!`
          )
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [holdingsCount, portfolioValue, user, profile])

  if (loading) return null

  const completedQuestsCount = storyQuests.filter(q => q.completed).length

  return (
    <Card className="relative overflow-hidden border-2 border-indigo-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl">
      {/* Background Glow Effects */}
      <div className="absolute -right-16 -top-16 size-80 rounded-full bg-[#00B4D8]/10 blur-3xl pointer-events-none" />
      <div className="absolute right-32 -bottom-16 size-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Header & Prof Algo Speech */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8 flex items-start gap-4">
            <div className="relative shrink-0">
              <AIBuddyPortrait size={80} floating={true} speaking={true} />
              <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow">
                ✓
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-0.5 text-xs font-extrabold text-cyan-300 border border-indigo-500/30">
                  <BrainCircuit className="size-3.5" />
                  <span>Prof Algo In-Game Guide</span>
                </span>

                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-extrabold">
                  {algoMemory?.trader_persona || 'Market Apprentice'}
                </Badge>
              </div>

              <p className="text-sm font-medium leading-relaxed text-slate-200">
                "{currentNarrative}"
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <span className="text-slate-400 font-medium">Story XP: <strong className="text-amber-300 font-extrabold">+{algoMemory?.total_story_xp || 0} XP</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 font-medium">Leaderboard Rank: <strong className="text-cyan-300 font-extrabold">#{profile?.global_rank || 'N/A'}</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 font-medium">Story Quests: <strong className="text-emerald-400 font-extrabold">{completedQuestsCount} / {storyQuests.length} Cleared</strong></span>
              </div>
            </div>
          </div>

          {/* Leaderboard Rank Card Badge */}
          <div className="lg:col-span-4 rounded-2xl bg-slate-900/80 p-4 border border-cyan-500/30 text-center space-y-2 backdrop-blur-md">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">
              Live Leaderboard Standing
            </span>
            <div className="flex items-center justify-center gap-2 text-2xl font-black text-white">
              <Trophy className="size-6 text-amber-400" />
              <span>Rank #{profile?.global_rank || 'N/A'}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Badge: <span className="text-emerald-400 font-bold">{profile?.badge || 'Market Rookie'}</span>
            </p>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#00B4D8] hover:underline pt-1"
            >
              <span>View Full Leaderboard</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Story Quests Bar */}
        <div className="space-y-3 border-t border-slate-800/80 pt-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              <span>In-Game Story Quests & Learning Milestones</span>
            </h4>
            <span className="text-xs font-bold text-slate-400">
              {Math.round((completedQuestsCount / storyQuests.length) * 100)}% Complete
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {storyQuests.map((quest) => (
              <div 
                key={quest.id}
                className={`flex flex-col justify-between rounded-2xl border p-3.5 text-xs transition-all ${
                  quest.completed 
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-100' 
                    : 'border-slate-800 bg-slate-900/60 text-slate-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white line-clamp-1">{quest.title}</span>
                    {quest.completed ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400">+{quest.xp} XP</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                    {quest.description}
                  </p>
                </div>

                {!quest.completed && quest.actionUrl && (
                  <div className="pt-3">
                    <Link
                      href={quest.actionUrl}
                      className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-[#00B4D8] py-1.5 text-[11px] font-bold text-white hover:bg-[#0077B6] transition-all shadow-sm"
                    >
                      <span>{quest.actionLabel}</span>
                      <ChevronRight className="size-3" />
                    </Link>
                  </div>
                )}
                {quest.completed && (
                  <div className="pt-2 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <span>✓ Milestone Achieved</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
