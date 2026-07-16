'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  BrainCircuit,
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  Gauge,
  ChevronDown,
  ChevronUp,
  DollarSign,
  AlertCircle,
  HelpCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatCurrency, formatPct } from '@/lib/market-data'
import { cn } from '@/lib/utils'

type AnalyzedAsset = {
  symbol: string
  name: string
  category: string
  sector: string
  price: number
  change: number
  decision: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  trend: string
  momentum: string
  volatility: string
  analysis: string
}

export default function AiAnalyzerPage() {
  const [data, setData] = useState<AnalyzedAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'ALL' | 'BUY' | 'SELL' | 'HOLD'>('ALL')
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  useEffect(() => {
    api.aiAnalyzer()
      .then((res: any) => {
        setData(res || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load AI analyzer recommendations. Please try again.')
        setLoading(false)
      })
  }, [])

  const toggleExpand = (symbol: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }))
  }

  // Derived metrics
  const stats = useMemo(() => {
    const total = data.length
    const buys = data.filter((a) => a.decision === 'BUY').length
    const sells = data.filter((a) => a.decision === 'SELL').length
    const holds = data.filter((a) => a.decision === 'HOLD').length
    return { total, buys, sells, holds }
  }, [data])

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter((asset) => {
      const matchesSearch =
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.sector.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTab = activeTab === 'ALL' || asset.decision === activeTab

      return matchesSearch && matchesTab
    })
  }, [data, searchQuery, activeTab])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative flex size-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <BrainCircuit className="size-10 animate-pulse text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Scanning market candles and computing signals...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-center shadow-lg">
        <AlertCircle className="mx-auto size-10 text-destructive" />
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-destructive">Analysis Failed</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-5">
          Retry Analysis
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-[linear-gradient(135deg,rgba(59,130,246,0.1),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.06),transparent_35%)] p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge variant="default" className="w-fit bg-primary/20 text-primary hover:bg-primary/20">
              <Sparkles className="mr-1.5 size-3.5 fill-primary" />
              Local AI Engine
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">AI Stock Analyzer</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Our server-side model processes live quotes and historical candles, evaluating moving average structures, 
              trend dynamics, and volatility to deliver clear BUY, SELL, or HOLD decisions.
            </p>
          </div>
          <div className="hidden size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary md:flex shadow-inner">
            <BrainCircuit className="size-8" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden p-5 transition-all duration-300 hover:shadow-md hover:border-primary/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Assets Tracked</span>
            <Activity className="size-4 text-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{stats.total}</span>
            <span className="text-xs text-muted-foreground">Active in DB</span>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-5 border-success/20 bg-success/5 transition-all duration-300 hover:shadow-md hover:border-success/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-success-foreground">Buy Signals</span>
            <TrendingUp className="size-4 text-success" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-success">{stats.buys}</span>
            <span className="text-xs text-success-foreground/75">Bullish trends</span>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-5 border-destructive/20 bg-destructive/5 transition-all duration-300 hover:shadow-md hover:border-destructive/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-destructive-foreground">Sell Signals</span>
            <TrendingDown className="size-4 text-destructive" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-destructive">{stats.sells}</span>
            <span className="text-xs text-destructive-foreground/75">Bearish pressure</span>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-5 border-warning/20 bg-warning/5 transition-all duration-300 hover:shadow-md hover:border-warning/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-warning-foreground">Hold Signals</span>
            <HelpCircle className="size-4 text-warning" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-warning">{stats.holds}</span>
            <span className="text-xs text-warning-foreground/75">Consolidating</span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by symbol, name, or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-border bg-muted/50 p-1">
          {(['ALL', 'BUY', 'SELL', 'HOLD'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
                activeTab === tab
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredData.map((asset) => {
          const isExpanded = !!expandedCards[asset.symbol]
          const isBuy = asset.decision === 'BUY'
          const isSell = asset.decision === 'SELL'

          return (
            <Card
              key={asset.symbol}
              className={cn(
                'group overflow-hidden border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
                isBuy ? 'hover:border-success/40' : isSell ? 'hover:border-destructive/40' : 'hover:border-warning/40'
              )}
            >
              {/* Asset Header Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold tracking-tight">{asset.symbol}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                        {asset.category}
                      </Badge>
                    </div>
                    <h3 className="line-clamp-1 text-sm font-medium text-muted-foreground">
                      {asset.name}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold tabular-nums">
                      {formatCurrency(asset.price)}
                    </div>
                    <div
                      className={cn(
                        'flex items-center justify-end gap-0.5 text-xs font-semibold tabular-nums',
                        asset.change >= 0 ? 'text-success' : 'text-destructive'
                      )}
                    >
                      {asset.change >= 0 ? '+' : ''}
                      {formatPct(asset.change)}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 items-center border-t border-border/60 pt-4">
                  {/* Decision Badge & Confidence */}
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">
                      Decision Recommendation
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          'text-xs font-bold px-2.5 py-1 uppercase border tracking-wider',
                          isBuy
                            ? 'bg-success/10 text-success border-success/20 hover:bg-success/15'
                            : isSell
                              ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15'
                              : 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/15'
                        )}
                      >
                        {asset.decision}
                      </Badge>
                    </div>
                  </div>

                  {/* Confidence Rating Progress */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                      <span>AI Confidence</span>
                      <span className="text-foreground">{asset.confidence}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          isBuy ? 'bg-success' : isSell ? 'bg-destructive' : 'bg-warning'
                        )}
                        style={{ width: `${asset.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Key Technical Indicators */}
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center">
                  <div className="rounded-xl bg-secondary/50 p-2.5">
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase block">
                      Trend
                    </span>
                    <span
                      className={cn(
                        'text-xs font-semibold mt-0.5 inline-flex items-center gap-1',
                        asset.trend === 'Bullish'
                          ? 'text-success'
                          : asset.trend === 'Bearish'
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                      )}
                    >
                      {asset.trend}
                    </span>
                  </div>

                  <div className="rounded-xl bg-secondary/50 p-2.5">
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase block">
                      Momentum
                    </span>
                    <span className="text-xs font-semibold text-foreground mt-0.5 block truncate">
                      {asset.momentum}
                    </span>
                  </div>

                  <div className="rounded-xl bg-secondary/50 p-2.5">
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase block">
                      Volatility
                    </span>
                    <span
                      className={cn(
                        'text-xs font-semibold mt-0.5 block',
                        asset.volatility === 'High'
                          ? 'text-destructive'
                          : asset.volatility === 'Medium'
                            ? 'text-warning'
                            : 'text-success'
                      )}
                    >
                      {asset.volatility}
                    </span>
                  </div>
                </div>
              </div>

              {/* Collapsible Intelligence Analysis */}
              <div className="border-t border-border/60 bg-muted/30">
                <button
                  onClick={() => toggleExpand(asset.symbol)}
                  className="flex w-full items-center justify-between px-5 py-3 text-left text-xs font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Gauge className="size-3.5 text-primary" />
                    Technical Analysis Insights
                  </span>
                  {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1">
                    <p className="text-sm leading-relaxed text-foreground bg-card/65 rounded-xl border border-border/50 p-3 shadow-inner">
                      {asset.analysis}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )
        })}

        {filteredData.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
              <Search className="size-6" />
            </div>
            <h3 className="text-base font-semibold">No assets match your filters</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try searching with another symbol or clearing your active filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
