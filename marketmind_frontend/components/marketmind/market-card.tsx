'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Sparkline } from './sparkline'
import { type Asset, formatCurrency, formatPct } from '@/lib/market-data'
import { useLanguage } from '@/lib/language-context'
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
  const { t } = useLanguage()
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
    <div id={`tour-stock-${asset.symbol}`} className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-[#00B4D8]/40 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#00B4D8]/10 text-xs font-bold text-[#00B4D8] border border-[#00B4D8]/20">
            {asset.symbol.slice(0, 2)}
          </span>
          <div>
            <div className="font-semibold text-sm text-slate-900 leading-tight">{asset.name}</div>
            <div className="text-xs font-mono text-slate-500 mt-0.5">{asset.symbol}</div>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
            positive
              ? 'bg-cyan-50 text-[#00B4D8] border border-cyan-100'
              : 'bg-rose-50 text-rose-600 border border-rose-100',
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

      <div className="mt-4 flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="font-mono text-xl font-bold tabular-nums text-slate-900">
          {formatCurrency(asset.price)}
        </div>
        <Sparkline data={sparkData} positive={positive} width={96} height={36} />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className="h-9 flex-1 rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-all"
          onClick={() => onTrade(asset, 'buy')}
        >
          {t('Buy', 'खरीदें')}
        </button>
        <button
          className="h-9 flex-1 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all"
          onClick={() => onTrade(asset, 'sell')}
        >
          {t('Sell', 'बेचें')}
        </button>
      </div>
    </div>
  )
}


