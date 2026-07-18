'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Wallet, Banknote, TrendingUp, Percent, ArrowRight } from 'lucide-react'
import { StatCard } from '@/components/marketmind/stat-card'
import { PortfolioChart } from '@/components/marketmind/portfolio-chart'
import { MarketGrid } from '@/components/marketmind/market-grid'
import { MarketBuddy } from '@/components/marketmind/market-buddy'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { formatCurrency, formatPct } from '@/lib/market-data'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const [portfolioData, setPortfolioData] = useState<any>(null)
  const [stocks, setStocks] = useState<any[]>([])

  const refreshPortfolio = useCallback(() => {
    api.portfolio().then(setPortfolioData).catch(() => {})
  }, [])

  const refreshStocks = useCallback(() => {
    api.assets('Stocks').then(setStocks).catch(() => {})
  }, [])

  useEffect(() => {
    refreshPortfolio()
    refreshStocks()
    const iv = setInterval(() => {
      refreshPortfolio()
      refreshStocks()
    }, 30000)
    return () => clearInterval(iv)
  }, [refreshPortfolio, refreshStocks])

  const stats = portfolioData || { value: 0, cash: 0, day_change: 0, day_change_pct: 0, return_pct: 0, holdings: [] }
  const watchlist = stocks.slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <Link href="/markets" className={cn(buttonVariants(), 'h-10 px-4')}>
          Trade Markets
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Portfolio Value" value={formatCurrency(stats.value)} change={stats.day_change_pct} icon={Wallet} />
        <StatCard label="Cash Available" value={formatCurrency(stats.cash)} hint="Ready to invest" icon={Banknote} />
        <StatCard label="Today's Gain / Loss" value={formatCurrency(stats.day_change)} change={stats.day_change_pct} icon={TrendingUp} accent="success" />
        <StatCard label="Portfolio Return" value={formatPct(stats.return_pct)} hint="All time" icon={Percent} accent="success" />
      </div>

      <MarketBuddy assets={stocks} holdings={stats.holdings} portfolioValue={stats.value} cash={stats.cash} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PortfolioChart value={stats.value} returnPct={stats.return_pct} />
        </div>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Your Holdings</h2>
            <Link href="/portfolio" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-1">
            {(stats.holdings || []).map((h: any) => (
              <div key={h.id} className="flex items-center justify-between rounded-xl px-2 py-2.5 transition-colors hover:bg-secondary">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-xs font-semibold">
                    {h.asset.symbol.slice(0, 2)}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{h.asset.name}</div>
                    <div className="text-xs text-muted-foreground">{h.shares} shares</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium tabular-nums">{formatCurrency(h.value)}</div>
                  <div className={cn('text-xs font-medium', h.change >= 0 ? 'text-success' : 'text-destructive')}>
                    {formatPct(h.change)}
                  </div>
                </div>
              </div>
            ))}
            {(stats.holdings || []).length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No holdings yet. Start trading!</p>
            )}
          </div>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Watchlist</h2>
            <Badge variant="muted">Live</Badge>
          </div>
          <Link href="/markets" className="text-sm font-medium text-primary hover:underline">Explore markets</Link>
        </div>
        <MarketGrid assets={watchlist} />
      </div>
    </div>
  )
}
