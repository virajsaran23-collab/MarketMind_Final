'use client'

import React from 'react'
import Link from 'next/link'
import {
  Lock,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
  Calculator,
  BookOpen,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ModuleCardProps {
  module: {
    slug: string
    title: string
    concept_summary: string
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string
    order: number
    badge_track: string
    token_reward: number
    status?: 'not_started' | 'in_progress' | 'complete' | string
    quiz_score?: number
    locked?: boolean
  }
}

const DIFF_COLOR: Record<string, string> = {
  Beginner: 'bg-green-500/15 text-green-400 border-green-500/20',
  Intermediate: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Advanced: 'bg-red-500/15 text-red-400 border-red-500/20',
}

export function ModuleCard({ module }: ModuleCardProps) {
  const isComplete = module.status === 'complete'
  const isLocked = module.locked && !isComplete

  const CardContent = (
    <Card
      className={cn(
        'group relative overflow-hidden border border-border/80 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 rounded-3xl flex flex-col justify-between h-full',
        isLocked
          ? 'opacity-65 cursor-not-allowed bg-muted/10'
          : 'hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
      )}
    >
      <div className="space-y-4">
        {/* Top Badges Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold border', DIFF_COLOR[module.difficulty] || DIFF_COLOR.Beginner)}>
              {module.difficulty}
            </span>
            <Badge variant="outline" className="text-[10px] bg-muted/40 font-semibold">
              Track: {module.badge_track || 'Quant Lab'}
            </Badge>
          </div>

          {isComplete ? (
            <Badge className="bg-green-500/15 text-green-400 border-green-500/20 gap-1 text-[10px] font-bold">
              <CheckCircle2 className="size-3" /> Completed
            </Badge>
          ) : isLocked ? (
            <Badge variant="muted" className="gap-1 text-[10px] font-bold bg-muted/60 text-muted-foreground">
              <Lock className="size-3" /> Locked
            </Badge>
          ) : (
            <Badge variant="default" className="gap-1 text-[10px] font-bold bg-primary/20 text-primary border-primary/30">
              <Sparkles className="size-3" /> Active
            </Badge>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-xl font-extrabold tracking-tight group-hover:text-primary transition-colors flex items-center gap-2">
            <Calculator className="size-5 text-primary shrink-0" />
            {module.title}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {module.concept_summary}
          </p>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-4 border-t border-border/40 mt-5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 font-bold text-green-400">
          <Sparkles className="size-3.5" /> +{module.token_reward} Tokens
        </div>

        {!isLocked ? (
          <span className="inline-flex items-center gap-1 font-bold text-primary group-hover:translate-x-1 transition-transform">
            Launch Lab <ArrowRight className="size-4" />
          </span>
        ) : (
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <Lock className="size-3" /> Complete previous lab
          </span>
        )}
      </div>
    </Card>
  )

  if (isLocked) {
    return <div>{CardContent}</div>
  }

  return (
    <Link href={`/market-math/${module.slug}`} className="block h-full">
      {CardContent}
    </Link>
  )
}

export default ModuleCard
