'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Brain, Gauge, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/marketmind/stat-card'
import { ProgressRing } from '@/components/marketmind/progress-ring'
import { RiskMeter } from '@/components/marketmind/risk-meter'
import { PerformanceCompareChart, SectorPreferenceChart } from '@/components/marketmind/analytics-charts'
import { api } from '@/lib/api'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    api.analytics().then(setData).catch(() => {})
  }, [])

  const stats = data || {
    simulations_completed: 0,
    learning_score: 0,
    risk_score: 50,
    best_decision: { label: '—', value: '0%' },
    worst_decision: { label: '—', value: '0%' },
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Your learning analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Insights into how your decisions stack up against the market.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Simulations completed" value={String(stats.simulations_completed)} icon={Trophy} />
        <StatCard label="Learning score" value={stats.learning_score.toLocaleString()} icon={Brain} />
        <StatCard label="Best decision" value={stats.best_decision.value} hint={stats.best_decision.label} accent="success" icon={TrendingUp} />
        <StatCard label="Worst decision" value={stats.worst_decision.value} hint={stats.worst_decision.label} accent="danger" icon={TrendingDown} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Performance vs. market</CardTitle></CardHeader>
          <CardContent><PerformanceCompareChart /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Risk profile</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-4">
            <ProgressRing value={stats.risk_score} sublabel="Risk score" />
            <RiskMeter value={stats.risk_score} />
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Gauge className="size-4" />
              Balanced risk appetite with measured aggression.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Sector preference</CardTitle></CardHeader>
          <CardContent><SectorPreferenceChart /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>What this means</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>You tend to allocate heavily toward technology, which boosts returns in growth regimes but increases drawdowns during rate shocks.</p>
            <p>Your strongest edge is reacting early to geopolitical events, where you outperformed the simulated market by a wide margin.</p>
            <p>Consider diversifying into defensive sectors to smooth volatility and lift your risk-adjusted score.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
