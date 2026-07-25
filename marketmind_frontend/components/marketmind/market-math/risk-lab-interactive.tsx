'use client'

import React, { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import {
  ShieldAlert,
  Activity,
  GitCommit,
  BarChart2,
  Info,
  ArrowRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AssetRiskData {
  symbol: string
  name: string
  volatility: number
  sma20: number
  price: number
  beta: number
}

interface RiskLabInteractiveProps {
  data: {
    assets: AssetRiskData[]
    correlations: Array<{ pair: string; corr: number; relationship: string }>
  }
}

// Generate a stable 20-day price series seeded from asset data
function generatePriceSeries(basePrice: number, sma20: number, seed: number) {
  const points = []
  let p = basePrice - 8
  for (let i = 1; i <= 20; i++) {
    // Deterministic pseudo-random using seed
    const pseudoRand = ((Math.sin(seed * i + 1) + 1) / 2)
    p += (pseudoRand - 0.45) * 4.0
    points.push({
      day: `D${i}`,
      price: Math.round(p * 100) / 100,
      sma20: Math.round((sma20 + (i - 10) * 0.15) * 100) / 100,
    })
  }
  return points
}

export function RiskLabInteractive({ data }: RiskLabInteractiveProps) {
  const assets = data.assets || []
  const correlations = data.correlations || []

  const [selectedSymbol, setSelectedSymbol] = useState<string>(assets[0]?.symbol || '')
  const [showSMA, setShowSMA] = useState<boolean>(true)

  const selectedAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0] || null

  // Stable price series — only regenerates when selected asset changes
  const priceSeries = useMemo(() => {
    if (!selectedAsset) return []
    const seed = selectedAsset.symbol.charCodeAt(0) + (selectedAsset.symbol.charCodeAt(1) || 0)
    return generatePriceSeries(selectedAsset.price, selectedAsset.sma20, seed)
  }, [selectedAsset?.symbol])

  const priceNow = priceSeries[priceSeries.length - 1]?.price || 0
  const smaNow = selectedAsset?.sma20 || 0
  const trendSignal = priceNow > smaNow ? 'Bullish (Price above SMA)' : 'Bearish (Price below SMA)'

  return (
    <div className="space-y-8">

      {/* ======= LAB 1: VOLATILITY ======= */}
      <Card className="overflow-hidden border border-border/80 bg-card/40 p-6 sm:p-8 backdrop-blur-sm shadow-lg rounded-3xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <Activity className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">1. Volatility & Standard Deviation</h3>
            <p className="text-xs text-muted-foreground">Which stocks have the wildest price swings?</p>
          </div>
        </div>

        {/* Concept box */}
        <div className="mb-6 p-4 bg-red-500/8 border border-red-500/20 rounded-2xl text-xs leading-relaxed space-y-2">
          <div className="font-bold text-red-400 flex items-center gap-1.5"><Info className="size-3.5" /> What is Volatility?</div>
          <p className="text-foreground/80">
            <span className="font-semibold">Volatility (σ) = Standard Deviation of daily price returns.</span> It measures how much a stock's
            price bounces up and down each day. A higher σ means bigger swings — more risk, but also more potential reward.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
              <div className="font-bold text-green-400">σ &lt; 15%</div>
              <div className="text-muted-foreground text-[10px]">Low risk — stable, like blue-chip stocks</div>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-center">
              <div className="font-bold text-yellow-400">σ 15-25%</div>
              <div className="text-muted-foreground text-[10px]">Medium — typical for growth stocks</div>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-center">
              <div className="font-bold text-red-400">σ &gt; 25%</div>
              <div className="text-muted-foreground text-[10px]">High risk — crypto, small-caps</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Bar chart */}
          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Annualized Volatility (%)</h4>
            <div className="h-64 w-full bg-muted/10 p-4 rounded-2xl border border-border/50">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assets} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <XAxis dataKey="symbol" stroke="#888888" fontSize={12} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
                    formatter={(val: any) => [`${val}%`, 'Volatility (σ)']}
                  />
                  <Bar dataKey="volatility" name="Volatility (σ)" radius={[6, 6, 0, 0]}>
                    {assets.map((ast, index) => (
                      <rect
                        key={`cell-${index}`}
                        fill={ast.volatility > 25 ? '#ef4444' : ast.volatility > 15 ? '#f59e0b' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset cards — clickable to select for SMA chart */}
          <div className="lg:col-span-5 space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select a Stock for SMA Chart ↓</h4>
            {assets.map((ast) => (
              <button
                key={ast.symbol}
                onClick={() => setSelectedSymbol(ast.symbol)}
                className={cn(
                  'w-full p-3.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between text-left',
                  selectedSymbol === ast.symbol
                    ? 'bg-primary/15 border-primary text-primary font-bold shadow-sm'
                    : 'bg-muted/20 border-border/60 hover:bg-muted text-foreground'
                )}
              >
                <div>
                  <div className="font-bold">{ast.symbol} — {ast.name}</div>
                  <div className="text-[10px] text-muted-foreground">Beta: {ast.beta}x &nbsp;·&nbsp; Price: ${ast.price.toFixed(2)}</div>
                  <div className="text-[10px] text-muted-foreground italic mt-0.5">
                    {ast.volatility > 25 ? '⚠️ High risk' : ast.volatility > 15 ? '🟡 Moderate risk' : '✅ Lower risk'}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn('font-mono text-xs shrink-0 ml-2',
                    ast.volatility > 25 ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                    ast.volatility > 15 ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                    'border-green-500/30 text-green-400 bg-green-500/10'
                  )}
                >
                  σ = {ast.volatility}%
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ======= LAB 2: SMA + CORRELATION ======= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SMA Chart */}
        <Card className="lg:col-span-7 overflow-hidden border border-border/80 bg-card/40 p-6 backdrop-blur-sm shadow-lg rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <BarChart2 className="size-5" />
              </div>
              <div>
                <h4 className="text-base font-bold">20-Day Simple Moving Average</h4>
                <p className="text-[11px] text-muted-foreground">SMA smooths out short-term noise to show the underlying trend.</p>
              </div>
            </div>
            <button
              onClick={() => setShowSMA((prev) => !prev)}
              className={cn('px-3 py-1 text-xs rounded-xl font-bold border transition cursor-pointer',
                showSMA ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-border text-muted-foreground'
              )}
            >
              {showSMA ? 'SMA ON' : 'SMA OFF'}
            </button>
          </div>

          {/* Concept box */}
          <div className="p-3 bg-blue-500/8 border border-blue-500/20 rounded-xl text-[11px] leading-relaxed space-y-1">
            <div className="font-bold text-blue-400 flex items-center gap-1"><Info className="size-3" /> How to read this chart</div>
            <p className="text-muted-foreground">
              The <strong className="text-blue-400">blue line</strong> is the daily price.
              The <strong className="text-yellow-400">dashed line</strong> is the 20-day SMA — the average of the last 20 prices.
            </p>
            <p className="text-muted-foreground">
              📌 Price <strong>above</strong> SMA → stock is trending <span className="text-green-400 font-semibold">bullish (upward)</span>. &nbsp;
              Price <strong>below</strong> SMA → trending <span className="text-red-400 font-semibold">bearish (downward)</span>.
            </p>
          </div>

          {/* Stock selector */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Viewing Stock:</label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              {assets.map((a) => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol} — {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-52 w-full bg-muted/10 p-3 rounded-2xl border border-border/50">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceSeries} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="day" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
                  formatter={(val: any) => [`$${val}`]}
                />
                <Line type="monotone" dataKey="price" name="Daily Price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                {showSMA && <Line type="monotone" dataKey="sma20" name="20-Day SMA" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {selectedAsset && (
            <div className="p-3 bg-muted/20 rounded-xl border border-border/40 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-foreground">{selectedAsset.symbol}</span>
                <span className="text-muted-foreground ml-2">Price: ${selectedAsset.price.toFixed(2)} | SMA20: ${selectedAsset.sma20.toFixed(2)}</span>
              </div>
              <Badge className={cn('text-[10px]', priceNow > smaNow ? 'bg-green-500/15 text-green-400 border-green-500/20' : 'bg-red-500/15 text-red-400 border-red-500/20')}>
                {trendSignal}
              </Badge>
            </div>
          )}
        </Card>

        {/* Correlation Matrix */}
        <Card className="lg:col-span-5 overflow-hidden border border-border/80 bg-card/40 p-6 backdrop-blur-sm shadow-lg rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <GitCommit className="size-5" />
            </div>
            <div>
              <h4 className="text-base font-bold">Asset Pair Correlation</h4>
              <p className="text-[11px] text-muted-foreground">How do stocks move together?</p>
            </div>
          </div>

          {/* Concept box */}
          <div className="p-3 bg-purple-500/8 border border-purple-500/20 rounded-xl text-[11px] leading-relaxed space-y-1.5">
            <div className="font-bold text-purple-400 flex items-center gap-1"><Info className="size-3" /> Reading Correlation</div>
            <div className="space-y-0.5 text-muted-foreground">
              <div className="flex items-center gap-1.5"><ArrowRight className="size-3 text-blue-400 shrink-0" /><span><strong className="text-blue-400">r close to +1</strong> = assets move together (same direction)</span></div>
              <div className="flex items-center gap-1.5"><ArrowRight className="size-3 text-green-400 shrink-0" /><span><strong className="text-green-400">r close to 0</strong> = no relationship (independent)</span></div>
              <div className="flex items-center gap-1.5"><ArrowRight className="size-3 text-red-400 shrink-0" /><span><strong className="text-red-400">r close to -1</strong> = they move opposite (great for diversifying!)</span></div>
            </div>
          </div>

          <div className="space-y-2">
            {correlations.map((c) => (
              <div key={c.pair} className="p-3 bg-muted/20 rounded-xl border border-border/50 text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-foreground">{c.pair}</div>
                  <div className="text-[10px] text-muted-foreground">{c.relationship}</div>
                </div>
                <Badge
                  variant="outline"
                  className={cn('font-mono text-xs',
                    c.corr > 0.7 ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                    c.corr < 0 ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                    'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                  )}
                >
                  r = {c.corr >= 0 ? `+${c.corr}` : c.corr}
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">
            💡 A good portfolio mixes assets with <strong className="text-green-400">low or negative correlations</strong> so that when one stock drops, others don't necessarily follow.
          </p>
        </Card>
      </div>
    </div>
  )
}
