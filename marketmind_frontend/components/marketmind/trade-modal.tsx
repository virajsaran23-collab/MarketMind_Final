'use client'

import { useEffect, useState } from 'react'
import { X, Plus, Minus, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type Asset, formatCurrency, formatPct } from '@/lib/market-data'
import { api } from '@/lib/api'
import { useAuth, checkChallengeCompletions } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

export function TradeModal({
  asset,
  mode,
  onClose,
  onSuccess,
}: {
  asset: Asset
  mode: 'buy' | 'sell'
  onClose: () => void
  onSuccess?: () => void
}) {
  const [qty, setQty] = useState(1)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cash, setCash] = useState<number | null>(null)
  const [portfolioValue, setPortfolioValue] = useState(100000)
  const [completedChallenges, setCompletedChallenges] = useState<any[]>([])
  const { refresh: refreshAuth, showToast } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    api.portfolio()
      .then((d) => {
        setCash(d.cash)
        setPortfolioValue(d.value ?? 100000)
      })
      .catch(() => {})
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const investment = qty * asset.price
  const impactPct = (investment / Math.max(portfolioValue, 100000)) * 100
  const isBuy = mode === 'buy'
  const cashAfter = cash !== null ? (isBuy ? cash - investment : cash + investment) : null

  const handleConfirm = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.trade(asset.id, mode, qty)
      if (res.completed_challenges && res.completed_challenges.length > 0) {
        setCompletedChallenges(res.completed_challenges)
        checkChallengeCompletions(res.completed_challenges, showToast)
      }
      const refreshed = await api.portfolio()
      setCash(refreshed.cash)
      setPortfolioValue(refreshed.value ?? 100000)
      await refreshAuth()
      setConfirmed(true)
      onSuccess?.()
    } catch (e: any) {
      setError(e.message || t('Trade failed', 'व्यापार विफल रहा'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {confirmed ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
              <svg viewBox="0 0 24 24" fill="none" className="size-7">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h3 className="mt-4 text-lg font-semibold">{t('Trade Confirmed', 'व्यापार की पुष्टि हुई')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {isBuy ? t('Bought', 'खरीदा गया') : t('Sold', 'बेचा गया')} {qty} {qty > 1 ? t('shares', 'शेयर') : t('share', 'शेयर')} {t('of', 'का')} {asset.name} {t('for', 'मूल्य')} {formatCurrency(investment)}.
            </p>

            {completedChallenges.length > 0 && (
              <div className="mt-4 w-full space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('Tasks Completed 🎉', 'कार्य पूर्ण हुए 🎉')}</p>
                {completedChallenges.map((uc: any) => (
                  <div
                    key={uc.challenge.slug}
                    className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-left"
                  >
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                    <div>
                      <p className="text-sm font-medium text-success">{uc.challenge.name}</p>
                      <p className="text-xs text-muted-foreground">+{uc.challenge.token_reward} {t('tokens earned', 'टोकन अर्जित किए')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button className="mt-5 h-10 w-full" onClick={onClose}>{t('Done', 'संपन्न')}</Button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{asset.name}</h3>
                  <Badge variant="muted">{asset.symbol}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{isBuy ? t('Buy order', 'खरीद आदेश') : t('Sell order', 'बिक्री आदेश')}</p>
              </div>
              <button onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Close">
                <X className="size-4.5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">{t('Current Price', 'वर्तमान मूल्य')}</span>
                <div className="text-right">
                  <div className="font-semibold tabular-nums">{formatCurrency(asset.price)}</div>
                  <div className={cn('text-xs font-medium', asset.change >= 0 ? 'text-success' : 'text-destructive')}>{formatPct(asset.change)}</div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">{t('Quantity', 'मात्रा')}</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary hover:bg-accent" aria-label="Decrease quantity">
                    <Minus className="size-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-center font-semibold tabular-nums outline-none focus:border-primary"
                  />
                  <button onClick={() => setQty((q) => q + 1)} className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary hover:bg-accent" aria-label="Increase quantity">
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl border border-border bg-secondary/50 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('Investment Amount', 'निवेश राशि')}</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(investment)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('Estimated Portfolio Impact', 'अनुमानित पोर्टफोलियो प्रभाव')}</span>
                  <span className={cn('font-semibold tabular-nums', isBuy ? 'text-primary' : 'text-success')}>
                    {isBuy ? '+' : '-'}{impactPct.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('Cash After Trade', 'व्यापार के बाद नकदी')}</span>
                  <span className="font-semibold tabular-nums">{cashAfter !== null ? formatCurrency(cashAfter) : '—'}</span>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="h-11 flex-1" onClick={onClose}>{t('Cancel', 'रद्द करें')}</Button>
              <Button
                className={cn('h-11 flex-1', isBuy ? 'bg-success text-success-foreground hover:bg-success/90' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? t('Processing...', 'प्रक्रिया जारी है...') : t('Confirm Trade', 'व्यापार की पुष्टि करें')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
