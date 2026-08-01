'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  BrainCircuit, 
  Sparkles, 
  Trophy, 
  Flame, 
  Award, 
  ChevronRight, 
  Clock, 
  ShieldAlert, 
  Zap, 
  TrendingUp, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AIBuddyPortrait } from '@/components/marketmind/ai-buddy-portrait'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

interface Calamity {
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
  completed: boolean
  locked: boolean
}

interface AlgoMemory {
  trader_persona: string
  memory_notes: string[]
  strengths: string[]
  weaknesses: string[]
  calamities_completed: string[]
  total_story_xp: number
}

const DIFF_COLOR: Record<string, string> = {
  Beginner: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  Intermediate: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  Advanced: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
}

export default function StoryModePage() {
  const { profile, refresh: refreshAuth } = useAuth()
  const [calamities, setCalamities] = useState<Calamity[]>([])
  const [algoMemory, setAlgoMemory] = useState<AlgoMemory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.storyMode()
      .then((data) => {
        setCalamities(data.calamities || [])
        setAlgoMemory(data.algo_memory || null)
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="size-12 animate-spin rounded-full border-4 border-[#00B4D8] border-t-transparent"></div>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading Story Time Game & Prof Algo Memory...</p>
      </div>
    )
  }

  const completedCount = calamities.filter(c => c.completed).length
  const totalXP = algoMemory?.total_story_xp || 0

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-10 text-white shadow-2xl border border-indigo-500/20">
        <div className="absolute -right-16 -top-16 size-80 rounded-full bg-[#00B4D8]/10 blur-3xl" />
        <div className="absolute right-32 -bottom-16 size-64 rounded-full bg-purple-500/10 blur-3xl" />
        
        <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Sparkles className="size-3.5 text-[#00B4D8]" />
              <span>Interactive Story Time Mode</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white">
              The Great Calamities <span className="bg-gradient-to-r from-[#00B4D8] via-cyan-300 to-blue-400 bg-clip-text text-transparent">Story Game</span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Journey through the 7 most cataclysmic market events in history. Study the mechanics under <strong className="text-cyan-300">Prof Algo</strong>, simulate crisis trading in real-time with your <strong className="text-emerald-400">fake cash</strong> ($100k+ balance), and climb the live Leaderboard!
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md">
                <Trophy className="size-4 text-amber-400" />
                <span>Story XP: <strong className="text-amber-300">{totalXP.toLocaleString()} XP</strong></span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>Calamities Cleared: <strong className="text-emerald-300">{completedCount} / {calamities.length}</strong></span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md">
                <Zap className="size-4 text-[#00B4D8]" />
                <span>Leaderboard Rank: <strong className="text-cyan-300">#{profile?.global_rank || 'N/A'}</strong></span>
              </div>
            </div>
          </div>

          {/* Prof Algo Memory Dossier Card */}
          <div className="lg:col-span-4">
            <Card className="relative overflow-hidden border border-indigo-400/30 bg-slate-900/80 p-5 text-white shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <AIBuddyPortrait size={64} floating={false} />
                  <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow">
                    ✓
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    <BrainCircuit className="size-3.5" />
                    <span>Prof Algo Memory</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {algoMemory?.trader_persona || 'Market Apprentice'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Remembers {algoMemory?.memory_notes.length || 0} trading decisions
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-800 pt-3 text-xs">
                {algoMemory?.memory_notes && algoMemory.memory_notes.length > 0 ? (
                  <div>
                    <span className="font-semibold text-slate-400">Latest Memory Note:</span>
                    <p className="mt-1 rounded-xl bg-slate-950/80 p-2.5 italic text-slate-300 border border-slate-800">
                      "{algoMemory.memory_notes[algoMemory.memory_notes.length - 1]}"
                    </p>
                  </div>
                ) : (
                  <p className="italic text-slate-400">
                    "Welcome! Complete your first story calamity simulation so I can analyze your trading habits and risk tendencies."
                  </p>
                )}

                {algoMemory?.strengths && algoMemory.strengths.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[11px] text-emerald-400 font-semibold">Strengths:</span>
                    {algoMemory.strengths.slice(0, 2).map((s) => (
                      <Badge key={s} variant="success" className="text-[10px] py-0">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Calamity Chapter Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              The 7 Great Market Calamities 📜
            </h2>
            <p className="text-sm text-slate-500">
              Select a historic crisis, study with Prof Algo, and simulate trading live tick-by-tick with fake cash.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {calamities.map((c, index) => (
            <Card 
              key={c.id}
              className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                c.completed ? 'border-emerald-500/40 bg-emerald-50/20' : 'border-slate-200/80 bg-white'
              }`}
            >
              {/* Image & Overlay */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img 
                  src={c.image} 
                  alt={c.title}
                  className="size-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <Badge className={`border text-xs font-semibold backdrop-blur-md ${DIFF_COLOR[c.difficulty]}`}>
                    {c.difficulty}
                  </Badge>
                  <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-xs font-bold text-cyan-300 backdrop-blur-md border border-slate-700">
                    {c.era}
                  </span>
                </div>

                {c.completed && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    <CheckCircle2 className="size-3.5" />
                    <span>Cleared</span>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-extrabold text-white leading-snug drop-shadow-md">
                    Chapter {index + 1}: {c.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">
                  {c.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {c.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Trophy className="size-3.5" />
                    <span>+{c.reward_xp} XP</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <Clock className="size-3.5" />
                    <span>{c.read_time}</span>
                  </div>
                </div>

                {/* CTA Action */}
                <Link
                  href={`/story/${c.id}`}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all shadow-md ${
                    c.completed
                      ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      : 'bg-gradient-to-r from-[#00B4D8] to-[#0077B6] text-white hover:opacity-95 hover:shadow-cyan-500/25'
                  }`}
                >
                  {c.completed ? (
                    <>
                      <RotateCcw className="size-3.5" />
                      <span>Replay Chapter</span>
                    </>
                  ) : (
                    <>
                      <span>Begin Chapter</span>
                      <ChevronRight className="size-4" />
                    </>
                  )}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
