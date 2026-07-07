'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkline } from './sparkline'
import { type Asset, formatCurrency, formatPct } from '@/lib/market-data'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

function buildFallbackSpark(price: number, change: number, points = 24): number[] {
  const out: number[] = []
  let v = price * (1 - (change / 100) * 0.5)
  for (let i = 0; i < points; i++) {
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * (price * 0.003)
    const drift = (change / 100) * price * (i / points) * 0.5
    v = Math.max(0.01, v + drift / points + noise)
    out.push(Number(v.toFixed(4)))
  }
  return out
}

export function MarketCard({
  asset,
  onTrade,
}: {
  asset: Asset
  onTrade: (asset: Asset, mode: 'buy' | 'sell') => void
}) {
  const positive = asset.change >= 0
  const [sparkData, setSparkData] = useState<number[]>(() =>
    asset.spark && asset.spark.length > 0
      ? asset.spark
      : buildFallbackSpark(asset.price, asset.change)
  )

  useEffect(() => {
    api.assetCandles(asset.id, 7)
      .then((candles: { t: number; c: number }[]) => {
        if (candles && candles.length > 2) {
          setSparkData(candles.map((c) => c.c))
        } else {
          setSparkData(buildFallbackSpark(asset.price, asset.change))
        }
      })
      .catch(() => {
        setSparkData(buildFallbackSpark(asset.price, asset.change))
      })
  }, [asset.id, asset.price, asset.change])

  return (
    <Card className="flex flex-col p-4 transition-all hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-sm font-semibold">
            {asset.symbol.slice(0, 2)}
          </span>
          <div>
            <div className="font-semibold leading-tight">{asset.name}</div>
            <div className="text-xs text-muted-foreground">{asset.symbol}</div>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
            positive
              ? 'bg-success/15 text-success'
              : 'bg-destructive/15 text-destructive',
          )}
        >
          {positive ? (
            <ArrowUpRight className="size-3" />
          ) : (
            <ArrowDownRight className="size-3" />
          )}
          {formatPct(asset.change)}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div className="text-xl font-semibold tabular-nums">
          {formatCurrency(asset.price)}
        </div>
        <Sparkline data={sparkData} positive={positive} width={96} height={36} />
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          className="h-9 flex-1 bg-success text-success-foreground hover:bg-success/90"
          onClick={() => onTrade(asset, 'buy')}
        >
          Buy
        </Button>
        <Button
          variant="outline"
          className="h-9 flex-1"
          onClick={() => onTrade(asset, 'sell')}
        >
          Sell
        </Button>
      </div>
    </Card>
  )
}
