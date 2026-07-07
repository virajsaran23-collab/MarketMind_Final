'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import {
  Plus,
  PauseCircle,
  Shuffle,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RiskMeter } from './risk-meter'
import { ProgressRing } from './progress-ring'
import {
  type CaseStudy,
  simSeries,
  simSectors,
} from '@/lib/market-data'
import { cn } from '@/lib/utils'

const steps = ['Day 1', 'Week 1', 'Month 1', 'Year 1']

const decisions = [
  { id: 'buy', label: 'Buy More', icon: Plus, risk: 78, confidence: 64 },
  { id: 'hold', label: 'Hold', icon: PauseCircle, risk: 42, confidence: 71 },
  { id: 'diversify', label: 'Diversify', icon: Shuffle, risk: 30, confidence: 82 },
  { id: 'sell', label: 'Sell', icon: Minus, risk: 18, confidence: 55 },
]

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-lg">
      <div className="font-semibold tabular-nums">
        Index {payload[0].value}
      </div>
      <div className="text-xs text-muted-foreground">{payload[0].payload.label}</div>
    </div>
  )
}

export function EventSimulation({ study }: { study: CaseStudy }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [decision, setDecision] = useState('hold')

  const step = steps[stepIndex]
  const data = simSeries[step]
  const active = decisions.find((d) => d.id === decision)!

  return (
    <div className="space-y-5">
      {/* 3-column layout */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left: event summary */}
        <Card className="p-5 lg:col-span-3">
          <Badge variant="default">{study.difficulty}</Badge>
          <h2 className="mt-3 text-lg font-semibold leading-snug">
            {study.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {study.longDescription}
          </p>
          <div className="mt-5 space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Key Themes
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {study.tags.map((t) => (
                <Badge key={t} variant="muted">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Center: live market */}
        <Card className="p-5 lg:col-span-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Market Movement</h2>
              <p className="text-sm text-muted-foreground">
                Simulated index — {step}
              </p>
            </div>
            <Badge variant={data[data.length - 1].value >= 100 ? 'success' : 'danger'}>
              {data[data.length - 1].value >= 100 ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {data[data.length - 1].value - 100 >= 0 ? '+' : ''}
              {(data[data.length - 1].value - 100).toFixed(1)}%
            </Badge>
          </div>

          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="simFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  domain={['dataMin - 6', 'dataMax + 6']}
                  width={40}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border)' }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fill="url(#simFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5">
            <h3 className="mb-3 text-sm font-medium">Sector Performance</h3>
            <div className="space-y-2.5">
              {simSectors.map((s) => {
                const positive = s.change >= 0
                const width = Math.min(100, Math.abs(s.change) * 6)
                return (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm text-muted-foreground">
                      {s.name}
                    </span>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn(
                          'absolute inset-y-0 left-0 rounded-full',
                          positive ? 'bg-success' : 'bg-destructive',
                        )}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        'w-16 shrink-0 text-right text-sm font-medium tabular-nums',
                        positive ? 'text-success' : 'text-destructive',
                      )}
                    >
                      {positive ? '+' : ''}
                      {s.change}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Right: decision panel */}
        <Card className="p-5 lg:col-span-3">
          <h2 className="font-semibold">Your Decision</h2>
          <p className="text-sm text-muted-foreground">
            How do you react to the event?
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {decisions.map((d) => (
              <button
                key={d.id}
                onClick={() => setDecision(d.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm font-medium transition-all',
                  decision === d.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground',
                )}
              >
                <d.icon className="size-5" />
                {d.label}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <RiskMeter value={active.risk} />
          </div>

          <div className="mt-5 flex flex-col items-center rounded-xl border border-border bg-secondary/50 p-4">
            <ProgressRing
              value={active.confidence}
              size={104}
              stroke={9}
              label={`${active.confidence}`}
              sublabel="Confidence"
              color="var(--primary)"
            />
          </div>
        </Card>
      </div>

      {/* Timeline slider */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Timeline</h2>
          <Badge variant="default">{step}</Badge>
        </div>
        <input
          type="range"
          min={0}
          max={steps.length - 1}
          value={stepIndex}
          onChange={(e) => setStepIndex(Number(e.target.value))}
          className="mt-5 w-full accent-[var(--primary)]"
          aria-label="Timeline"
        />
        <div className="mt-2 flex justify-between">
          {steps.map((s, i) => (
            <button
              key={s}
              onClick={() => setStepIndex(i)}
              className={cn(
                'text-xs font-medium transition-colors',
                i === stepIndex ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
