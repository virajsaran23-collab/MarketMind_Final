'use client'

import React, { useEffect, useState } from 'react'
import {
  Calculator,
  Sparkles,
  Award,
  BookOpen,
  HelpCircle,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ModuleCard } from '@/components/marketmind/market-math/module-card'
import { useLanguage } from '@/lib/language-context'
import { api } from '@/lib/api'

export default function MarketMathPage() {
  const { t } = useLanguage()
  const [modules, setModules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    api
      .mathModules()
      .then((data) => {
        if (Array.isArray(data)) setModules(data)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const completedCount = modules.filter((m) => m.status === 'complete').length
  const totalTokensAvailable = modules.reduce((acc, m) => acc + (m.token_reward || 0), 0)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Header section with Stats Card */}
      <div className="relative rounded-3xl overflow-hidden border border-border bg-card/20 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl opacity-50" />

        <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center relative z-10">
          <div className="max-w-2xl">
            <Badge variant="default" className="mb-4 gap-1.5 px-3 py-1 font-semibold text-xs border border-primary/20">
              <Calculator className="size-3 mr-1" /> {t('Bloomberg Market Concepts (BMC) Style', 'ब्लूमबर्ग मार्केट कॉन्सेप्ट्स स्टाइल')}
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t('Market Math', 'मार्केट गणित')}
            </h1>
            <p className="mt-2 text-muted-foreground text-sm sm:text-base leading-relaxed">
              {t(
                'Short interactive modules that teach financial and statistical concepts using your OWN live portfolio and trade data — not static textbook numbers.',
                'इंटरएक्टिव मॉड्यूल जो आपकी अपनी लाइव पोर्टफोलियो जानकारी का उपयोग करके वित्तीय अवधारणाएं सिखाते हैं।'
              )}
            </p>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="flex gap-4 shrink-0 bg-muted/40 p-4 rounded-2xl border border-border/60">
            <div className="text-center px-3 border-r border-border/80">
              <div className="text-2xl font-extrabold text-foreground">{modules.length || 4}</div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">{t('Modules', 'मॉड्यूल')}</div>
            </div>
            <div className="text-center px-3 border-r border-border/80">
              <div className="text-2xl font-extrabold text-green-400">{completedCount}</div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">{t('Completed', 'पूर्ण')}</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-extrabold text-primary">+{totalTokensAvailable}</div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">{t('Tokens', 'टोकन')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 rounded-3xl bg-muted/30 border border-border/50" />
          ))}
        </div>
      ) : modules.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border/80 bg-card/10 rounded-3xl max-w-xl mx-auto">
          <HelpCircle className="size-12 mx-auto text-muted-foreground/60 mb-4 stroke-1 animate-pulse" />
          <h3 className="text-lg font-bold">{t('No Math Modules Available', 'कोई गणित मॉड्यूल उपलब्ध नहीं')}</h3>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between pl-1">
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">
              {t('Interactive Modules', 'इंटरएक्टिव मॉड्यूल')}
            </h2>
            <Badge variant="outline" className="text-[10px]">
              Module 1 Unlocked • Pass Quiz (≥80%) to Unlock Badges
            </Badge>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {modules.map((module) => (
              <ModuleCard key={module.slug} module={module} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
