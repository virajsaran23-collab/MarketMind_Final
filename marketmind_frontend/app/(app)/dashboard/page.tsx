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
import { useLanguage } from '@/lib/language-context'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { t } = useLanguage()
  const [portfolioData, setPortfolioData] = useState<any>(null)
  const [stocks, setStocks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshData = useCallback((showSkeleton = false) => {
    if (showSkeleton) {
      setIsLoading(true)
    }
    return Promise.all([
      api.portfolio().then(setPortfolioData).catch(() => {}),
      api.assets('Stocks').then(setStocks).catch(() => {})
    ]).finally(() => {
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    refreshData(true)
  }, [refreshData])

  useEffect(() => {
    const iv = setInterval(() => {
      refreshData(false)
    }, 30000)
    return () => clearInterval(iv)
  }, [refreshData])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted/60" />
            <div className="h-8 w-48 rounded bg-muted/60" />
          </div>
          <div className="h-10 w-32 rounded-lg bg-muted/60" />
        </div>

        {/* 4 Stat Cards Skeletons */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 border border-border/60">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-muted/60" />
                <div className="size-9 rounded-xl bg-muted/60" />
              </div>
              <div className="mt-3 h-8 w-32 rounded bg-muted/60" />
              <div className="mt-2 h-4 w-16 rounded bg-muted/60" />
            </Card>
          ))}
        </div>

        {/* MarketBuddy Placeholder */}
        <div className="h-28 rounded-2xl bg-muted/60" />

        {/* Chart + Holdings Skeletons */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="h-[300px] border border-border/60 p-5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-muted/60" />
                <div className="h-8 w-24 rounded bg-muted/60" />
              </div>
              <div className="h-[180px] w-full rounded bg-muted/30" />
            </Card>
          </div>
          <Card className="p-5 border border-border/60">
            <div className="flex items-center justify-between">
              <div className="h-5 w-28 rounded bg-muted/60" />
              <div className="h-4 w-12 rounded bg-muted/60" />
            </div>
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-muted/60 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-24 rounded bg-muted/60 animate-pulse" />
                      <div className="h-3 w-16 rounded bg-muted/60 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <div className="h-4 w-16 rounded bg-muted/60 ml-auto animate-pulse" />
                    <div className="h-3 w-10 rounded bg-muted/60 ml-auto animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Watchlist Skeleton */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-32 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="flex flex-col p-4 border border-border/60">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-muted/60 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-20 rounded bg-muted/60 animate-pulse" />
                      <div className="h-3 w-10 rounded bg-muted/60 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-5 w-12 rounded-full bg-muted/60 animate-pulse" />
                </div>
                <div className="mt-6 flex items-end justify-between gap-2">
                  <div className="h-7 w-16 rounded bg-muted/60 animate-pulse" />
                  <div className="h-9 w-20 rounded bg-muted/60 animate-pulse" />
                </div>
                <div className="mt-5 flex gap-2">
                  <div className="h-9 flex-1 rounded-md bg-muted/60 animate-pulse" />
                  <div className="h-9 flex-1 rounded-md bg-muted/60 animate-pulse" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const stats = portfolioData || { value: 0, cash: 0, day_change: 0, day_change_pct: 0, return_pct: 0, holdings: [] }
  const watchlist = stocks.slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{t('Welcome back', 'वापसी पर आपका स्वागत है')}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{t('Dashboard', 'डैशबोर्ड')}</h1>
        </div>
        <Link href="/markets" className={cn(buttonVariants(), 'h-10 px-4')}>
          {t('Trade Markets', 'बाज़ार में व्यापार करें')}
          <ArrowRight className="size-4 ml-1" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('Portfolio Value', 'पोर्टफोलियो मूल्य')} value={formatCurrency(stats.value)} change={stats.day_change_pct} icon={Wallet} />
        <StatCard label={t('Cash Available', 'उपलब्ध नकदी')} value={formatCurrency(stats.cash)} hint={t('Ready to invest', 'निवेश के लिए तैयार')} icon={Banknote} />
        <StatCard label={t("Today's Gain / Loss", 'आज का लाभ / हानि')} value={formatCurrency(stats.day_change)} change={stats.day_change_pct} icon={TrendingUp} accent="success" />
        <StatCard label={t('Portfolio Return', 'पोर्टफोलियो रिटर्न')} value={formatPct(stats.return_pct)} hint={t('All time', 'कुल समय')} icon={Percent} accent="success" />
      </div>

      <MarketBuddy assets={stocks} holdings={stats.holdings} portfolioValue={stats.value} cash={stats.cash} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PortfolioChart value={stats.value} returnPct={stats.return_pct} />
        </div>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t('Your Holdings', 'आपकी होल्डिंग्स')}</h2>
            <Link href="/portfolio" className="text-sm font-medium text-primary hover:underline">{t('View all', 'सभी देखें')}</Link>
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
                    <div className="text-xs text-muted-foreground">{h.shares} {t('shares', 'शेयर')}</div>
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
              <p className="py-4 text-center text-sm text-muted-foreground">{t('No holdings yet. Start trading!', 'अभी कोई होल्डिंग्स नहीं हैं। व्यापार शुरू करें!')}</p>
            )}
          </div>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{t('Watchlist', 'वॉचलिस्ट')}</h2>
            <Badge variant="muted">{t('Live', 'लाइव')}</Badge>
          </div>
          <Link href="/markets" className="text-sm font-medium text-primary hover:underline">{t('Explore markets', 'बाज़ार देखें')}</Link>
        </div>
        <MarketGrid assets={watchlist} />
      </div>
    </div>
  )
}
