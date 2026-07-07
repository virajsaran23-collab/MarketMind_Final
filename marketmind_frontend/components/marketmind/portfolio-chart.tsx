'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/market-data'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const ranges = ['1D', '1W', '1M', '1Y'] as const
type Range = (typeof ranges)[number]

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-lg">
      <div className="font-semibold tabular-nums">
        {formatCurrency(payload[0].value)}
      </div>
      <div className="text-xs text-muted-foreground">{payload[0].payload.label}</div>
    </div>
  )
}

export function PortfolioChart({ value, returnPct }: { value?: number; returnPct?: number }) {
  const [range, setRange] = useState<Range>('1M')
  const [data, setData] = useState<{ label: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.portfolioHistory(range)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [range])

  const currentValue = value ?? (data.length > 0 ? data[data.length - 1].value : 100000)
  const allTimeReturn = returnPct ?? (
    data.length > 0
      ? ((data[data.length - 1].value - 100000) / 100000) * 100
      : 0
  )
  const isPositive = allTimeReturn >= 0

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">
            Portfolio Performance
          </h2>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(currentValue)}
            </span>
            <span className={cn('text-sm font-medium', isPositive ? 'text-success' : 'text-destructive')}>
              {isPositive ? '+' : ''}{allTimeReturn.toFixed(2)}% all time
            </span>
          </div>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-secondary p-1">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                range === r
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading chart…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                dy={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickFormatter={(v) => formatCurrency(v, true)}
                width={56}
                domain={['dataMin - 2000', 'dataMax + 2000']}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border)' }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fill="url(#portfolioFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
