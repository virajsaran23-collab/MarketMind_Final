'use client'

import { useEffect, useState } from 'react'
import { Wallet, Banknote, TrendingUp, Percent } from 'lucide-react'
import { StatCard } from '@/components/marketmind/stat-card'
import { PortfolioChart } from '@/components/marketmind/portfolio-chart'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatPct } from '@/lib/market-data'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function PortfolioPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    api.portfolio().then(setData).catch(() => {})
    const iv = setInterval(() => api.portfolio().then(setData).catch(() => {}), 30000)
    return () => clearInterval(iv)
  }, [])

  const stats = data || { value: 0, cash: 0, day_change: 0, day_change_pct: 0, return_pct: 0, holdings: [] }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Portfolio</h1>
        <p className="mt-1 text-muted-foreground">Your holdings, allocation, and performance over time.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Portfolio Value" value={formatCurrency(stats.value)} change={stats.day_change_pct} icon={Wallet} />
        <StatCard label="Cash Available" value={formatCurrency(stats.cash)} hint="Ready to invest" icon={Banknote} />
        <StatCard label="Today's Gain / Loss" value={formatCurrency(stats.day_change)} change={stats.day_change_pct} icon={TrendingUp} accent="success" />
        <StatCard label="Total Return" value={formatPct(stats.return_pct)} hint="All time" icon={Percent} accent="success" />
      </div>

      <PortfolioChart value={stats.value} returnPct={stats.return_pct} />

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-semibold">Holdings</h2>
          <span className="text-sm text-muted-foreground">{(stats.holdings || []).length} positions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Asset</th>
                <th className="px-5 py-3 text-right font-medium">Shares</th>
                <th className="px-5 py-3 text-right font-medium">Avg Cost</th>
                <th className="px-5 py-3 text-right font-medium">Price</th>
                <th className="px-5 py-3 text-right font-medium">Value</th>
                <th className="px-5 py-3 text-right font-medium">Return</th>
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
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">No holdings yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
