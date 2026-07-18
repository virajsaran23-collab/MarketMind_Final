'use client'

import { useState } from 'react'
import { MarketCard } from './market-card'
import { TradeModal } from './trade-modal'
import type { Asset } from '@/lib/market-data'

export function MarketGrid({ assets }: { assets: Asset[] }) {
  const [trade, setTrade] = useState<{ asset: Asset; mode: 'buy' | 'sell' } | null>(
    null,
  )

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assets.map((asset) => (
          <MarketCard
            key={asset.id}
            asset={asset}
            onTrade={(a, mode) => setTrade({ asset: a, mode })}
          />
        ))}
      </div>
      {trade && (
        <TradeModal
          asset={trade.asset}
          mode={trade.mode}
          onClose={() => setTrade(null)}
        />
      )}
    </>
  )
}
