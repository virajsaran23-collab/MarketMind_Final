'use client'

import { useEffect, useState } from 'react'
import { Wallet, Banknote, TrendingUp, Percent } from 'lucide-react'
import { StatCard } from '@/components/marketmind/stat-card'
import { PortfolioChart } from '@/components/marketmind/portfolio-chart'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatPct } from '@/lib/market-data'
import { useLanguage } from '@/lib/language-context'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function PortfolioPage() {
  const { t } = useLanguage()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    api.portfolio()
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false))

    const iv = setInterval(() => {
      api.portfolio().then(setData).catch(() => {})
    }, 30000)
    return () => clearInterval(iv)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-7 w-32 rounded bg-muted/60" />
          <div className="h-4 w-64 rounded bg-muted/60" />
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

        {/* Chart Skeleton */}
        <Card className="h-[300px] border border-border/60 p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted/60" />
            <div className="h-8 w-24 rounded bg-muted/60" />
          </div>
          <div className="h-[180px] w-full rounded bg-muted/30" />
        </Card>

        {/* Holdings Table Skeleton */}
        <Card className="overflow-hidden p-0 border border-border/60">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="h-5 w-24 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-16 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">{t('Asset', 'संपत्ति')}</th>
                  <th className="px-5 py-3 text-right">{t('Shares', 'शेयर')}</th>
                  <th className="px-5 py-3 text-right">{t('Avg Cost', 'औसत मूल्य')}</th>
                  <th className="px-5 py-3 text-right">{t('Price', 'कीमत')}</th>
                  <th className="px-5 py-3 text-right">{t('Value', 'मूल्य')}</th>
                  <th className="px-5 py-3 text-right">{t('Return', 'रिटर्न')}</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-muted/60 animate-pulse" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-20 rounded bg-muted/60 animate-pulse" />
                          <div className="h-3 w-12 rounded bg-muted/60 animate-pulse" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right"><div className="h-4 w-12 rounded bg-muted/60 ml-auto animate-pulse" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-4 w-16 rounded bg-muted/60 ml-auto animate-pulse" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-4 w-16 rounded bg-muted/60 ml-auto animate-pulse" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-4 w-20 rounded bg-muted/60 ml-auto animate-pulse" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-4 w-12 rounded bg-muted/60 ml-auto animate-pulse" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    )
  }

  const stats = data || { value: 0, cash: 0, day_change: 0, day_change_pct: 0, return_pct: 0, holdings: [] }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('Portfolio', 'पोर्टफोलियो')}</h1>
        <p className="mt-1 text-muted-foreground">{t('Your holdings, allocation, and performance over time.', 'आपकी होल्डिंग्स, आवंटन और समय के साथ प्रदर्शन।')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('Portfolio Value', 'पोर्टफोलियो मूल्य')} value={formatCurrency(stats.value)} change={stats.day_change_pct} icon={Wallet} />
        <StatCard label={t('Cash Available', 'उपलब्ध नकदी')} value={formatCurrency(stats.cash)} hint={t('Ready to invest', 'निवेश के लिए तैयार')} icon={Banknote} />
        <StatCard label={t("Today's Gain / Loss", 'आज का लाभ / हानि')} value={formatCurrency(stats.day_change)} change={stats.day_change_pct} icon={TrendingUp} accent="success" />
        <StatCard label={t('Total Return', 'कुल रिटर्न')} value={formatPct(stats.return_pct)} hint={t('All time', 'कुल समय')} icon={Percent} accent="success" />
      </div>

      <PortfolioChart value={stats.value} returnPct={stats.return_pct} />

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-semibold">{t('Holdings', 'होल्डिंग्स')}</h2>
          <span className="text-sm text-muted-foreground">{(stats.holdings || []).length} {t('positions', 'स्थितियां')}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">{t('Asset', 'संपत्ति')}</th>
                <th className="px-5 py-3 text-right font-medium">{t('Shares', 'शेयर')}</th>
                <th className="px-5 py-3 text-right font-medium">{t('Avg Cost', 'औसत मूल्य')}</th>
                <th className="px-5 py-3 text-right font-medium">{t('Price', 'कीमत')}</th>
                <th className="px-5 py-3 text-right font-medium">{t('Value', 'मूल्य')}</th>
                <th className="px-5 py-3 text-right font-medium">{t('Return', 'रिटर्न')}</th>
              </tr>
            </thead>
            <tbody>
              {(stats.holdings || []).map((h: any) => (
                <tr key={h.id} className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-xs font-semibold">
                        {h.asset.symbol.slice(0, 2)}
                      </span>
                      <div>
                        <div className="font-medium">{h.asset.name}</div>
                        <div className="text-xs text-muted-foreground">{h.asset.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums">{h.shares}</td>
                  <td className="px-5 py-4 text-right tabular-nums text-muted-foreground">{formatCurrency(h.avg_price)}</td>
                  <td className="px-5 py-4 text-right tabular-nums">{formatCurrency(h.asset.price)}</td>
                  <td className="px-5 py-4 text-right font-medium tabular-nums">{formatCurrency(h.value)}</td>
                  <td className={cn('px-5 py-4 text-right font-medium tabular-nums', h.return_pct >= 0 ? 'text-success' : 'text-destructive')}>
                    {formatPct(h.return_pct)}
                  </td>
                </tr>
              ))}
              {(stats.holdings || []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">{t('No holdings yet.', 'अभी कोई होल्डिंग्स नहीं हैं।')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
