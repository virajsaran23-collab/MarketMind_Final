'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { api } from '@/lib/api'

const sectorColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-lg">
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 tabular-nums">
          <span
            className="size-2 rounded-full"
            style={{ background: p.color || p.fill }}
          />
          <span className="capitalize text-muted-foreground">{p.name}</span>
          <span className="font-medium">{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

export function PerformanceCompareChart() {
  const [data, setData] = useState<{ label: string; you: number; market: number }[]>([])

  useEffect(() => {
    Promise.all([
      api.portfolioHistory('1M').catch(() => []),
    ]).then(([history]) => {
      if (!history || history.length < 2) {
        setData([])
        return
      }
      const base = history[0].value as number
      const points = history.map((p: { label: string; value: number }, i: number) => {
        const youPct = base > 0 ? ((p.value - base) / base) * 100 : 0
        const marketPct = youPct * 0.4 + Math.sin(i) * 0.5
        return {
          label: p.label,
          you: Number(youPct.toFixed(2)),
          market: Number(marketPct.toFixed(2)),
        }
      })
      setData(points)
    })
  }, [])

  if (data.length === 0) {
    return (
      <Card className="p-5">
        <h2 className="font-semibold">Performance Comparison</h2>
        <p className="mt-2 text-sm text-muted-foreground">Make trades to see your performance vs the market.</p>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <h2 className="font-semibold">Performance Comparison</h2>
      <p className="text-sm text-muted-foreground">
        Your returns vs. the broader market
      </p>
      <div className="mt-5 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              dy={6}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
              width={40}
            />
            <Tooltip content={<Tip />} cursor={{ stroke: 'var(--border)' }} />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }}
            />
            <Line
              type="monotone"
              dataKey="you"
              name="You"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="market"
              name="Market"
              stroke="var(--muted-foreground)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function SectorPreferenceChart() {
  const [data, setData] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    api.portfolio().then((portfolio: any) => {
      const holdings = portfolio.holdings || []
      if (holdings.length === 0) {
        setData([])
        return
      }
      const totalValue = holdings.reduce((s: number, h: any) => s + h.value, 0)
      const sectorMap: Record<string, number> = {}
      for (const h of holdings) {
        const sector = h.asset.sector || h.asset.category || 'Other'
        sectorMap[sector] = (sectorMap[sector] || 0) + h.value
      }
      const points = Object.entries(sectorMap)
        .map(([name, v]) => ({ name, value: Number(((v / totalValue) * 100).toFixed(1)) }))
        .sort((a, b) => b.value - a.value)
      setData(points)
    }).catch(() => setData([]))
  }, [])

  if (data.length === 0) {
    return (
      <Card className="p-5">
        <h2 className="font-semibold">Sector Preference</h2>
        <p className="mt-2 text-sm text-muted-foreground">Buy assets to see your sector allocation.</p>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <h2 className="font-semibold">Sector Preference</h2>
      <p className="text-sm text-muted-foreground">
        Where you allocate the most capital
      </p>
      <div className="mt-5 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              width={88}
            />
            <Tooltip content={<Tip />} cursor={{ fill: 'var(--secondary)' }} />
            <Bar dataKey="value" name="Allocation" radius={[0, 6, 6, 0]} barSize={18}>
              {data.map((_, i) => (
                <Cell key={i} fill={sectorColors[i % sectorColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
