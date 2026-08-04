'use client'

import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  PieChart,
  CheckCircle2,
  XCircle,
  Info,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CompareAsset {
  id: string | number
  symbol: string
  name: string
  price: number
  eps: number
  shares_outstanding: number
  pe_ratio: number | null
  market_cap: number
  market_cap_tier: 'large' | 'mid' | 'small' | null
}

interface HoldingGain {
  symbol: string
  name: string
  shares: number
  avg_price: number
  current_price: number
  pct_gain: number
  steps: string[]
  is_fallback?: boolean
}

interface CapAsset extends CompareAsset {
  tier_label: string | null
}

interface RatioLabInteractiveProps {
  data: {
    compare_assets: CompareAsset[]
    default_compare_ids: string[]
    holdings_gains: HoldingGain[]
    primary_gain: HoldingGain
    market_cap_assets: CapAsset[]
    cap_thresholds: {
      large_min: number
      mid_min: number
      labels: Record<string, string>
    }
  }
}

export function RatioLabInteractive({ data }: RatioLabInteractiveProps) {
  const assets = data.compare_assets || []

  // Use symbol as the key to avoid integer vs. string mismatch with Django PKs
  const defaultSymbol1 = assets.find((a) => a.symbol === 'AAPL')?.symbol || assets[0]?.symbol || ''
  const defaultSymbol2 = assets.find((a) => a.symbol === 'MSFT')?.symbol || assets[1]?.symbol || assets[0]?.symbol || ''

  const [selectedSymbol1, setSelectedSymbol1] = useState<string>(defaultSymbol1)
  const [selectedSymbol2, setSelectedSymbol2] = useState<string>(defaultSymbol2)
  const [earningsGrowth, setEarningsGrowth] = useState<number>(20)

  const selectedAsset1 = assets.find((a) => a.symbol === selectedSymbol1) || null
  const selectedAsset2 = assets.find((a) => a.symbol === selectedSymbol2) || null

  const holdings = data.holdings_gains.length > 0 ? data.holdings_gains : [data.primary_gain]
  const [activeHoldingIndex, setActiveHoldingIndex] = useState<number>(0)
  const activeHolding = holdings[activeHoldingIndex] || data.primary_gain

  const capAssets = data.market_cap_assets || []
  const [classifiedTiers, setClassifiedTiers] = useState<Record<string, 'large' | 'mid' | 'small'>>({})
  const [revealedCaps, setRevealedCaps] = useState<Record<string, boolean>>({})

  const calcNewPE = (asset: CompareAsset | null, growthPct: number) => {
    if (!asset || asset.eps <= 0) return null
    const newEps = asset.eps * (1 + growthPct / 100)
    if (newEps <= 0) return null
    return Math.round((asset.price / newEps) * 10) / 10
  }

  const asset1NewPE = selectedAsset1 ? calcNewPE(selectedAsset1, earningsGrowth) : null

  const chartData = [
    ...(selectedAsset1
      ? [{
          symbol: selectedAsset1.symbol,
          currentPE: selectedAsset1.pe_ratio || 0,
          simulatedPE: asset1NewPE || selectedAsset1.pe_ratio || 0,
        }]
      : []),
    ...(selectedAsset2 && selectedAsset2.symbol !== selectedAsset1?.symbol
      ? [{
          symbol: selectedAsset2.symbol,
          currentPE: selectedAsset2.pe_ratio || 0,
          simulatedPE: selectedAsset2.pe_ratio || 0,
        }]
      : []),
  ]

  return (
    <div className="space-y-8">

      {/* ======= LAB 1: P/E RATIO COMPARISON ======= */}
      <Card className="overflow-hidden border border-border/80 bg-card/40 p-6 sm:p-8 backdrop-blur-sm shadow-lg rounded-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PieChart className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">1. P/E Ratio Comparison</h3>
            <p className="text-xs text-muted-foreground">Pick two stocks and compare their valuations side by side.</p>
          </div>
        </div>

        {/* Concept explanation box */}
        <div className="mb-6 p-4 bg-blue-500/8 border border-blue-500/20 rounded-2xl text-xs leading-relaxed space-y-2">
          <div className="font-bold text-blue-400 flex items-center gap-1.5"><Info className="size-3.5" /> What does P/E Ratio mean?</div>
          <p className="text-foreground/80">
            <span className="font-semibold">P/E = Stock Price ÷ Earnings Per Share (EPS).</span> It tells you how many dollars investors are
            willing to pay for every $1 of company profit. For example, a P/E of 25 means investors pay $25 for every $1 of annual profit.
          </p>
          <p className="text-muted-foreground">
            📌 <span className="font-semibold">Low P/E</span> = stock is cheaper relative to earnings (could be a bargain, or slow growth).
            <br />
            📌 <span className="font-semibold">High P/E</span> = investors expect faster growth and are willing to pay a premium.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-5 bg-muted/20 p-5 rounded-2xl border border-border/60">

            {/* Dropdowns — keyed by symbol */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Stock A
              </label>
              <select
                value={selectedSymbol1}
                onChange={(e) => setSelectedSymbol1(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                {assets.map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} — {a.name} (P/E: {a.pe_ratio ?? 'N/A'}x)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Stock B (to compare)
              </label>
              <select
                value={selectedSymbol2}
                onChange={(e) => setSelectedSymbol2(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                {assets.map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} — {a.name} (P/E: {a.pe_ratio ?? 'N/A'}x)
                  </option>
                ))}
              </select>
            </div>

            {/* Earnings slider */}
            {selectedAsset1 && (
              <div className="pt-4 border-t border-border/50 space-y-3">
                <div className="text-xs font-bold text-muted-foreground">
                  💡 <span className="text-foreground">What if {selectedAsset1.symbol}'s earnings grew?</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>Earnings Growth:</span>
                  <span className={cn('text-sm font-extrabold font-mono', earningsGrowth >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {earningsGrowth >= 0 ? `+${earningsGrowth}%` : `${earningsGrowth}%`}
                  </span>
                </div>
                <input
                  type="range" min={-50} max={200} step={5}
                  value={earningsGrowth}
                  onChange={(e) => setEarningsGrowth(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>-50% (Crash)</span><span>0 (Flat)</span><span>+200%</span>
                </div>
              </div>
            )}

            {/* Result explanation */}
            {selectedAsset1 && (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2 text-xs">
                <div className="font-bold text-primary flex items-center gap-1.5"><Sparkles className="size-4" /> Step-by-Step Result</div>
                <div className="space-y-1 text-foreground/90">
                  <div className="flex gap-2 items-start"><ArrowRight className="size-3 mt-0.5 text-primary shrink-0" /><span>Price stays fixed at <strong>${selectedAsset1.price.toFixed(2)}</strong></span></div>
                  {earningsGrowth !== 0 && (
                    <>
                      <div className="flex gap-2 items-start"><ArrowRight className="size-3 mt-0.5 text-primary shrink-0" />
                        <span>EPS changes: <strong>${selectedAsset1.eps.toFixed(2)}</strong> × (1 + {earningsGrowth}%) = <strong className="text-green-400">${(selectedAsset1.eps * (1 + earningsGrowth / 100)).toFixed(2)}</strong></span>
                      </div>
                      <div className="flex gap-2 items-start"><ArrowRight className="size-3 mt-0.5 text-primary shrink-0" />
                        <span>New P/E = ${selectedAsset1.price.toFixed(2)} ÷ ${(selectedAsset1.eps * (1 + earningsGrowth / 100)).toFixed(2)} = <strong className="text-primary text-sm">{asset1NewPE ?? 'N/A'}x</strong></span>
                      </div>
                      <p className="text-muted-foreground pt-1">
                        {earningsGrowth > 0
                          ? '✅ Higher earnings = lower P/E at the same price. Stock becomes cheaper!'
                          : '⚠️ Lower earnings = higher P/E. Stock becomes more expensive relative to profits.'}
                      </p>
                    </>
                  )}
                  {earningsGrowth === 0 && <p className="text-muted-foreground">Move the slider to simulate what happens when earnings grow or shrink.</p>}
                </div>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">P/E Ratio Bar Chart</h4>
              <Badge variant="outline" className="text-[10px]">Lower P/E = Pay less per $1 profit</Badge>
            </div>
            <div className="h-56 w-full bg-muted/10 p-4 rounded-2xl border border-border/50">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <XAxis dataKey="symbol" stroke="#888888" fontSize={12} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} unit="x" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
                    formatter={(value: any, name: any) => [`${value}x`, String(name) === 'simulatedPE' ? 'Simulated P/E' : 'Current P/E']}
                  />
                  <Bar dataKey="currentPE" name="Current P/E" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="simulatedPE" name="Simulated P/E" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick compare cards */}
            <div className="grid grid-cols-2 gap-4">
              {[selectedAsset1, selectedAsset2].map((asset, i) => asset ? (
                <div key={asset.symbol} className={cn('p-3 bg-muted/20 rounded-xl border border-border/60 text-xs space-y-1', i === 0 ? 'border-green-500/30' : 'border-blue-500/30')}>
                  <div className="font-bold text-foreground">{asset.symbol}</div>
                  <div className="text-muted-foreground">Price: <span className="text-foreground font-mono">${asset.price.toFixed(2)}</span></div>
                  <div className="text-muted-foreground">EPS: <span className="text-foreground font-mono">${asset.eps.toFixed(2)}</span></div>
                  <div className={cn('font-bold', i === 0 ? 'text-green-400' : 'text-blue-400')}>P/E: {asset.pe_ratio ?? 'N/A'}x</div>
                </div>
              ) : null)}
            </div>
          </div>
        </div>
      </Card>

      {/* ======= LAB 2: % GAIN / LOSS ======= */}
      <Card className="overflow-hidden border border-border/80 bg-card/40 p-6 sm:p-8 backdrop-blur-sm shadow-lg rounded-3xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
            <DollarSign className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold tracking-tight">2. Your Holdings % Gain & Loss</h3>
              {data.holdings_gains.length === 0 && (
                <Badge variant="muted" className="text-[10px] bg-yellow-500/15 text-yellow-400 border-yellow-500/20">
                  Using Example Data — buy stocks to see your real data
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Watch live math on your own portfolio positions.</p>
          </div>
        </div>

        {/* Concept box */}
        <div className="mb-6 p-4 bg-green-500/8 border border-green-500/20 rounded-2xl text-xs leading-relaxed space-y-2">
          <div className="font-bold text-green-400 flex items-center gap-1.5"><Info className="size-3.5" /> How is % Gain/Loss calculated?</div>
          <p className="text-foreground/80">
            <span className="font-semibold">% Gain = (Current Price − Average Buy Price) ÷ Average Buy Price × 100</span>
          </p>
          <p className="text-muted-foreground">
            This tells you exactly what percentage profit or loss you have made since you bought the stock. Your <em>average buy price</em> is the average of all the prices you paid if you bought in multiple orders.
          </p>
        </div>

        {holdings.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {holdings.map((h, idx) => (
              <button
                key={h.symbol + idx}
                onClick={() => setActiveHoldingIndex(idx)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-xl font-semibold border transition cursor-pointer',
                  activeHoldingIndex === idx
                    ? 'bg-primary border-primary text-primary-foreground shadow-md'
                    : 'bg-muted/20 border-border text-muted-foreground hover:bg-muted'
                )}
              >
                {h.symbol} ({h.pct_gain >= 0 ? `+${h.pct_gain}%` : `${h.pct_gain}%`})
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4 bg-muted/20 p-5 rounded-2xl border border-border/60 text-center space-y-3">
            <div className="text-xs font-bold text-muted-foreground uppercase">{activeHolding.name} ({activeHolding.symbol})</div>
            <div className="flex items-center justify-center gap-2">
              {activeHolding.pct_gain >= 0 ? <TrendingUp className="size-6 text-green-400" /> : <TrendingDown className="size-6 text-red-400" />}
              <span className={cn('text-3xl font-extrabold font-mono', activeHolding.pct_gain >= 0 ? 'text-green-400' : 'text-red-400')}>
                {activeHolding.pct_gain >= 0 ? `+${activeHolding.pct_gain}%` : `${activeHolding.pct_gain}%`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/40">
              <div>
                <span className="text-muted-foreground block">Avg Buy Price</span>
                <span className="font-bold text-foreground">${activeHolding.avg_price.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Current Price</span>
                <span className="font-bold text-foreground">${activeHolding.current_price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Step-by-Step Calculation</h4>
            <div className="space-y-2">
              {(activeHolding.steps || []).map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border/40 text-xs">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[11px]">
                    {idx + 1}
                  </div>
                  <div className="font-mono text-foreground">{step}</div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-muted/20 rounded-xl border border-border/40 text-xs text-muted-foreground">
              💡 If you hold <strong>{activeHolding.shares} shares</strong> and the price is at <strong>${activeHolding.current_price.toFixed(2)}</strong>,
              your total position value = <strong className="text-foreground">${(activeHolding.shares * activeHolding.current_price).toFixed(2)}</strong>.
              Your original cost was <strong>${(activeHolding.shares * activeHolding.avg_price).toFixed(2)}</strong>.
            </div>
          </div>
        </div>
      </Card>

      {/* ======= LAB 3: MARKET CAP CLASSIFIER ======= */}
      <Card className="overflow-hidden border border-border/80 bg-card/40 p-6 sm:p-8 backdrop-blur-sm shadow-lg rounded-3xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <Building2 className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">3. Market Cap Classification Quiz</h3>
            <p className="text-xs text-muted-foreground">Guess each company's category, then reveal the answer.</p>
          </div>
        </div>

        {/* Concept box */}
        <div className="mb-6 p-4 bg-purple-500/8 border border-purple-500/20 rounded-2xl text-xs leading-relaxed space-y-2">
          <div className="font-bold text-purple-400 flex items-center gap-1.5"><Info className="size-3.5" /> What is Market Cap?</div>
          <p className="text-foreground/80">
            <span className="font-semibold">Market Cap = Current Share Price × Total Number of Shares Outstanding</span>
          </p>
          <p className="text-muted-foreground">
            It represents the <em>total market value</em> of a company. Companies are categorised into three tiers:
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="font-bold text-blue-400">Large Cap</div>
              <div className="text-muted-foreground text-[10px]">≥ $10 Billion</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Stable, well-known companies</div>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="font-bold text-yellow-400">Mid Cap</div>
              <div className="text-muted-foreground text-[10px]">$2B – $10B</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Growing, moderate risk</div>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="font-bold text-red-400">Small Cap</div>
              <div className="text-muted-foreground text-[10px]">&lt; $2 Billion</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">High growth potential, higher risk</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capAssets.map((asset) => {
            const userChoice = classifiedTiers[asset.symbol]
            const isRevealed = revealedCaps[asset.symbol]
            const isCorrect = userChoice === asset.market_cap_tier

            return (
              <div key={asset.symbol} className="bg-muted/20 p-5 rounded-2xl border border-border/60 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-base text-foreground">{asset.name}</h4>
                      <span className="text-xs font-semibold text-primary">{asset.symbol}</span>
                    </div>
                    {isRevealed && (
                      <Badge className={cn('text-[10px]', isCorrect ? 'bg-green-500/15 text-green-400 border-green-500/20' : 'bg-red-500/15 text-red-400 border-red-500/20')}>
                        {isCorrect ? <><CheckCircle2 className="size-3 mr-1" />Correct!</> : <><XCircle className="size-3 mr-1" />Try again</>}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs space-y-1.5 text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/40 font-mono">
                    <div>Price: <span className="text-foreground">${asset.price.toFixed(2)}</span></div>
                    <div>Shares: <span className="text-foreground">{(asset.shares_outstanding / 1e6).toFixed(0)}M shares</span></div>
                    <div className="text-primary/70 font-sans text-[10px] italic">Market Cap = ${asset.price.toFixed(2)} × {(asset.shares_outstanding / 1e6).toFixed(0)}M</div>
                  </div>
                </div>

                {!isRevealed ? (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase block">Your guess:</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['large', 'mid', 'small'] as const).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => { setClassifiedTiers((prev) => ({ ...prev, [asset.symbol]: tier })); setRevealedCaps((prev) => ({ ...prev, [asset.symbol]: true })) }}
                          className="px-2 py-1.5 text-[11px] font-bold rounded-lg border border-border bg-muted/40 hover:bg-primary hover:text-primary-foreground transition cursor-pointer capitalize"
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-muted/40 rounded-xl border border-border/50 text-xs space-y-1.5">
                    <div className="font-bold text-foreground">Market Cap: ${(asset.market_cap / 1e9).toFixed(1)}B</div>
                    <div className="text-muted-foreground">
                      Actual: <span className="font-bold text-primary capitalize">{asset.tier_label || asset.market_cap_tier}</span>
                    </div>
                    {!isCorrect && (
                      <p className="text-[10px] text-muted-foreground">
                        {asset.market_cap_tier === 'large' ? 'This company is worth over $10B — a large cap giant.' :
                          asset.market_cap_tier === 'mid' ? 'Between $2B-$10B — a mid-size growing company.' :
                            'Under $2B — a smaller, riskier but potentially high-growth company.'}
                      </p>
                    )}
                    <button
                      onClick={() => setRevealedCaps((prev) => ({ ...prev, [asset.symbol]: false }))}
                      className="text-[10px] text-primary underline pt-0.5 block cursor-pointer"
                    >
                      Try again
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
