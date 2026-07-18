'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, RefreshCw, X } from 'lucide-react'
import { MarketCard } from './market-card'
import { MarketBuddy } from './market-buddy'
import { TradeModal } from './trade-modal'
import { type Asset } from '@/lib/market-data'
import { cn } from '@/lib/utils'

const filters = ['All', 'Stocks', 'Industries', 'Commodities'] as const
type Filter = (typeof filters)[number]

type MarketsExplorerProps = {
  assets?: Asset[]
  onRefresh?: () => void
  query?: string
  onQueryChange?: (q: string) => void
  filter?: string
  onFilterChange?: (f: string) => void
}

export function MarketsExplorer({
  assets = [],
  onRefresh,
  query: externalQuery,
  onQueryChange,
  filter: externalFilter,
  onFilterChange,
}: MarketsExplorerProps) {
  // Use external state if provided, otherwise local fallback
  const [localQuery, setLocalQuery] = useState('')
  const [localFilter, setLocalFilter] = useState<string>('All')

  const query = externalQuery ?? localQuery
  const setQuery = onQueryChange ?? setLocalQuery
  const filter = externalFilter ?? localFilter
  const setFilter = onFilterChange ?? setLocalFilter

  const [trade, setTrade] = useState<{ asset: Asset; mode: 'buy' | 'sell' } | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const prevAssetsRef = useRef<Asset[]>([])

  useEffect(() => {
    if (assets.length > 0) {
      setLastUpdated(new Date())
      prevAssetsRef.current = assets
    }
  }, [assets])

  const handleTradeSuccess = () => {
    setTrade(null)
    onRefresh?.()
  }

  return (
    <div className="space-y-5">
      <MarketBuddy assets={assets} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any stock, ticker, or commodity…"
            className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-sm outline-none transition-colors focus:border-primary"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl border border-border bg-secondary p-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f}
              </button>
            ))}
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-secondary transition-colors"
              title="Refresh prices"
            >
              <RefreshCw className="size-3.5" />
              <span className="hidden sm:inline">
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </button>
          )}
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          {query ? `No results for "${query}". Try a different ticker or name.` : 'Loading markets…'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset) => (
            <MarketCard key={asset.id} asset={asset} onTrade={(a, mode) => setTrade({ asset: a, mode })} />
          ))}
        </div>
      )}

      {trade && (
        <TradeModal
          asset={trade.asset}
          mode={trade.mode}
          onClose={() => setTrade(null)}
          onSuccess={handleTradeSuccess}
        />
      )}
    </div>
  )
}
