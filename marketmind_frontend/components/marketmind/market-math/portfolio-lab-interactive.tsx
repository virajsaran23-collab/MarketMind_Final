'use client'

import React, { useState } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  Sliders,
  Sparkles,
  TrendingUp,
  Info,
  ArrowRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PortfolioHolding {
  symbol: string
  name: string
  value: number
  weight: number
  exp_return?: number
  risk?: number
}

interface ScatterItem {
  symbol: string
  risk: number
  return: number
  sharpe: number
}

interface PortfolioLabInteractiveProps {
  data: {
    holdings: PortfolioHolding[]
    total_portfolio_value: number
    scatter_data: ScatterItem[]
  }
}

// Hardcoded expected returns for well-known symbols (fallback if not in data)
const EXPECTED_RETURNS: Record<string, number> = {
  AAPL: 12.0, MSFT: 14.0, JPM: 9.0, XAU: 5.0,
  NVDA: 28.0, BTC: 35.0, GOOGL: 13.0, AMZN: 15.0,
  TSLA: 22.0, META: 18.0, KO: 6.0, V: 11.0,
}

export function PortfolioLabInteractive({ data }: PortfolioLabInteractiveProps) {
  const initialHoldings = data.holdings || []
  const scatterData = data.scatter_data || []

  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    initialHoldings.forEach((h) => { map[h.symbol] = h.weight || 25 })
    return map
  })

  // Calculate weighted return
  const totalWeightSum = Object.values(weights).reduce((a, b) => a + b, 0) || 100
  const weightedReturn = Object.entries(weights).reduce((sum, [sym, wt]) => {
    const r = EXPECTED_RETURNS[sym] || 10.0
    return sum + (wt / totalWeightSum) * r
  }, 0)

  const concentrationWarning = Object.values(weights).some((w) => (w / totalWeightSum) * 100 > 60)

  return (
    <div className="space-y-8">

      {/* ======= LAB 1: WEIGHT REBALANCER ======= */}
      <Card className="overflow-hidden border border-border/80 bg-card/40 p-6 sm:p-8 backdrop-blur-sm shadow-lg rounded-3xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sliders className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">1. Portfolio Weight & Return Calculator</h3>
            <p className="text-xs text-muted-foreground">Drag the sliders to rebalance your portfolio and see how the total return changes.</p>
          </div>
        </div>

        {/* Concept box */}
        <div className="mb-6 p-4 bg-primary/8 border border-primary/20 rounded-2xl text-xs leading-relaxed space-y-2">
          <div className="font-bold text-primary flex items-center gap-1.5"><Info className="size-3.5" /> How does Portfolio Return work?</div>
          <p className="text-foreground/80">
            <span className="font-semibold">Portfolio Return = Σ (Weight of each stock × Its expected return)</span>
          </p>
          <p className="text-muted-foreground">
            If you put 60% in Stock A (expecting 12%/yr) and 40% in Stock B (expecting 8%/yr), your portfolio return
            = (0.60 × 12%) + (0.40 × 8%) = <strong className="text-foreground">7.2% + 3.2% = 10.4%/yr</strong>.
          </p>
          <div className="flex items-center gap-1.5 pt-0.5">
            <ArrowRight className="size-3 text-primary shrink-0" />
            <span className="text-foreground/80">The sliders below show how changing your allocation shifts the overall return.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sliders */}
          <div className="lg:col-span-6 space-y-5 bg-muted/20 p-5 rounded-2xl border border-border/60">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Adjust Allocation Weights</h4>

            {initialHoldings.map((h) => {
              const wt = weights[h.symbol] ?? h.weight
              const pct = ((wt / totalWeightSum) * 100).toFixed(1)
              const ret = EXPECTED_RETURNS[h.symbol] || 10.0
              return (
                <div key={h.symbol} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>{h.name} <span className="text-primary">({h.symbol})</span></span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-[10px]">{pct}% of portfolio</span>
                      <span className="text-primary font-mono">{wt} pts</span>
                    </div>
                  </div>
                  <input
                    type="range" min={0} max={100} step={5}
                    value={wt}
                    onChange={(e) => setWeights((prev) => ({ ...prev, [h.symbol]: Number(e.target.value) }))}
                    className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
                  />
                  <div className="text-[10px] text-muted-foreground">
                    Expected return: <strong className="text-green-400">{ret}%/yr</strong> &nbsp;·&nbsp; Contribution: <strong className="text-foreground">{((wt / totalWeightSum) * ret).toFixed(1)}%</strong>
                  </div>
                </div>
              )
            })}

            {concentrationWarning && (
              <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-[11px] text-yellow-400">
                ⚠️ One asset holds more than 60% of your portfolio. Consider diversifying to reduce risk.
              </div>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 space-y-4 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 rounded-full text-primary text-xs font-bold">
                <Sparkles className="size-4" /> Weighted Portfolio Return
              </div>
              <div className="text-5xl font-extrabold text-primary font-mono">
                +{weightedReturn.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Expected annual return based on your current allocation</div>
            </div>

            {/* Contribution breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Return Breakdown by Asset</h4>
              {initialHoldings.map((h) => {
                const wt = weights[h.symbol] ?? h.weight
                const ret = EXPECTED_RETURNS[h.symbol] || 10.0
                const contrib = (wt / totalWeightSum) * ret
                const pct = ((wt / totalWeightSum) * 100)
                return (
                  <div key={h.symbol} className="p-3 bg-muted/30 rounded-xl border border-border/40 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">{h.symbol}</span>
                      <span className="font-mono text-primary">+{contrib.toFixed(2)}% contribution</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* ======= LAB 2: RISK-RETURN SCATTER ======= */}
      <Card className="overflow-hidden border border-border/80 bg-card/40 p-6 sm:p-8 backdrop-blur-sm shadow-lg rounded-3xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">2. Risk vs. Return — The Tradeoff Chart</h3>
            <p className="text-xs text-muted-foreground">Every investment has a risk and a return. The best ones sit in the top-left corner.</p>
          </div>
        </div>

        {/* Concept box */}
        <div className="p-4 bg-purple-500/8 border border-purple-500/20 rounded-2xl text-xs leading-relaxed space-y-2">
          <div className="font-bold text-purple-400 flex items-center gap-1.5"><Info className="size-3.5" /> What is the Sharpe Ratio?</div>
          <p className="text-foreground/80">
            <span className="font-semibold">Sharpe Ratio = (Expected Return − Risk-Free Rate) ÷ Volatility (σ)</span>
          </p>
          <p className="text-muted-foreground">
            The Sharpe Ratio tells you how much return you earn per unit of risk. A higher Sharpe = better risk-adjusted return.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
              <div className="font-bold text-green-400">Sharpe &gt; 0.6</div>
              <div className="text-[10px] text-muted-foreground">Excellent</div>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
              <div className="font-bold text-blue-400">0.45–0.6</div>
              <div className="text-[10px] text-muted-foreground">Good</div>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-center">
              <div className="font-bold text-yellow-400">Below 0.45</div>
              <div className="text-[10px] text-muted-foreground">Needs attention</div>
            </div>
          </div>
          <p className="text-muted-foreground text-[10px] pt-1">
            📌 In the chart below: <strong>X-axis = Risk (Volatility)</strong>, <strong>Y-axis = Expected Return</strong>.
            You want stocks in the <strong className="text-green-400">top-left</strong> (high return, low risk).
          </p>
        </div>

        <div className="h-72 w-full bg-muted/10 p-4 rounded-2xl border border-border/50">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 30 }}>
              <XAxis dataKey="risk" stroke="#888888" fontSize={11} name="Risk (σ)" unit="%"
                label={{ value: 'Risk / Volatility (σ%)', position: 'insideBottom', offset: -15, fill: '#888888', fontSize: 11 }} />
              <YAxis dataKey="return" stroke="#888888" fontSize={11} name="Expected Return" unit="%"
                label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft', fill: '#888888', fontSize: 11 }} />
              <ZAxis dataKey="sharpe" range={[80, 300]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]?.payload as ScatterItem
                  return (
                    <div className="p-3 rounded-xl border text-xs space-y-0.5" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
                      <div className="font-bold text-foreground">{d.symbol}</div>
                      <div className="text-muted-foreground">Risk (σ): <strong className="text-red-400">{d.risk}%</strong></div>
                      <div className="text-muted-foreground">Return: <strong className="text-green-400">{d.return}%</strong></div>
                      <div className="text-muted-foreground">Sharpe: <strong className="text-primary">{d.sharpe}</strong></div>
                    </div>
                  )
                }}
              />
              <Scatter name="Assets" data={scatterData} fill="#8b5cf6">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`}
                    fill={entry.sharpe > 0.6 ? '#10b981' : entry.sharpe > 0.45 ? '#3b82f6' : '#f59e0b'}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-3 text-[10px]">
          <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full bg-green-400" /> Excellent Sharpe (&gt;0.6)</span>
          <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full bg-blue-400" /> Good Sharpe (0.45–0.6)</span>
          <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full bg-yellow-400" /> Lower Sharpe (&lt;0.45)</span>
        </div>
      </Card>
    </div>
  )
}
