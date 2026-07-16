'use client'

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  Loader2,
  MessageSquare,
  Newspaper,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { type Asset, formatCurrency, formatPct } from '@/lib/market-data'
import { cn } from '@/lib/utils'

type BuddyHolding = {
  asset: Asset
  shares: number
  avg_price?: number
  value?: number
  change?: number
  return_pct?: number
}

type MarketBuddyProps = {
  assets?: Asset[]
  holdings?: BuddyHolding[]
  portfolioValue?: number
  cash?: number
}

type MentorQuote = {
  symbol: string
  name: string
  price: number
  change: number
  source?: string
}

type MentorNews = {
  title: string
  publisher?: string
  link?: string
  published_at?: string | null
  source?: string
}

type MentorResponse = {
  reply?: string
  summary?: string
  quotes?: MentorQuote[]
  news?: MentorNews[]
  portfolio?: { cash?: number; portfolio_value?: number; badge?: string }
  symbols?: string[]
}

type ChatMessage = {
  role: 'assistant' | 'user'
  content: string
}

function percentSign(value: number) {
  return value > 0 ? '+' : ''
}

function resolveReturnPct(holding: BuddyHolding) {
  if (typeof holding.return_pct === 'number') {
    return holding.return_pct
  }

  if (!holding.avg_price || holding.avg_price === 0) {
    return 0
  }

  return ((holding.asset.price - holding.avg_price) / holding.avg_price) * 100
}

function buildLocalMentor(assets: Asset[], holdings: BuddyHolding[], portfolioValue?: number, cash?: number): MentorResponse {
  const stockAssets = assets.filter((asset) => asset.category === 'Stocks')
  const featured = [...stockAssets].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 4)
  const strongest = [...stockAssets].filter((asset) => asset.change > 0).sort((a, b) => b.change - a.change)[0]
  const weakest = [...stockAssets].filter((asset) => asset.change < 0).sort((a, b) => a.change - b.change)[0]

  const bestHolding = [...holdings].sort((a, b) => resolveReturnPct(b) - resolveReturnPct(a))[0]
  const weakestHolding = [...holdings].sort((a, b) => resolveReturnPct(a) - resolveReturnPct(b))[0]

  const cashRatio =
    typeof portfolioValue === 'number' && portfolioValue > 0 && typeof cash === 'number' ? cash / portfolioValue : undefined

  const isFirstRun = holdings.length === 0
  const formatAssetLabel = (asset: Asset) => asset.name && asset.name !== asset.symbol ? `${asset.name} (${asset.symbol})` : asset.symbol
  const summary = isFirstRun
    ? 'Welcome! Start with a small Buy order in Markets, then use Sell from Portfolio when you want to lock in gains or reduce risk. After each trade, head to Profile to complete the starter tasks.'
    : bestHolding && weakestHolding
      ? `Your strongest position is ${formatAssetLabel(bestHolding.asset)}. Review ${formatAssetLabel(weakestHolding.asset)} before averaging down, and keep the thesis tighter than the price.`
      : cashRatio !== undefined && cashRatio > 0.2
        ? 'You have a healthy cash buffer, so you can wait for cleaner setups instead of chasing every move.'
        : cashRatio !== undefined
          ? 'You are fairly invested already, so focus on high-conviction trades and avoid overtrading.'
          : 'I am watching momentum, support, and volatility so you can decide whether to buy, sell, or wait.'

  const news = [
    strongest && {
      title: `${formatAssetLabel(strongest)} is leading the board`,
      publisher: 'MarketMind',
      source: 'local',
    },
    weakest && {
      title: `${formatAssetLabel(weakest)} is under pressure`,
      publisher: 'MarketMind',
      source: 'local',
    },
    featured[0] && {
      title: `${formatAssetLabel(featured[0])} has the sharpest move`,
      publisher: 'MarketMind',
      source: 'local',
    },
  ].filter(Boolean) as MentorNews[]

  return {
    summary,
    reply: summary,
    quotes: featured.map((asset) => ({
      symbol: asset.symbol,
      name: asset.name,
      price: asset.price,
      change: asset.change,
      source: 'local',
    })),
    news,
    portfolio: typeof portfolioValue === 'number' || typeof cash === 'number'
      ? { portfolio_value: portfolioValue, cash }
      : undefined,
    symbols: featured.map((asset) => asset.symbol),
  }
}

export function MarketBuddy({ assets = [], holdings = [], portfolioValue, cash }: MarketBuddyProps) {
  const stockAssets = useMemo(() => assets.filter((asset) => asset.category === 'Stocks'), [assets])
  const localFallback = useMemo(() => buildLocalMentor(assets, holdings, portfolioValue, cash), [assets, holdings, portfolioValue, cash])
  const [briefing, setBriefing] = useState<MentorResponse>(localFallback)
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: localFallback.summary || localFallback.reply || 'I am ready to help.' }])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<'live' | 'local'>('local')

  useEffect(() => {
    let alive = true

    api.mentor().then((data) => {
      if (!alive) return
      setBriefing(data)
      setMessages((current) => {
        if (current.length <= 1 && current[0]?.role === 'assistant') {
          return [
            { role: 'assistant', content: data.summary || 'I have loaded your market briefing.' },
            ...(data.reply && data.reply !== data.summary ? [{ role: 'assistant' as const, content: data.reply }] : []),
          ]
        }
        return current
      })
      setStatus('live')
      setLoading(false)
    }).catch(() => {
      if (!alive) return
      setBriefing(localFallback)
      setMessages((current) => {
        if (current.length <= 1 && current[0]?.role === 'assistant') {
          return [{ role: 'assistant', content: localFallback.summary || 'I am ready to help.' }]
        }
        return current
      })
      setStatus('local')
      setLoading(false)
    })

    return () => {
      alive = false
    }
  }, [])

  const featured = (briefing.quotes && briefing.quotes.length > 0
    ? briefing.quotes
    : stockAssets.slice(0, 4).map((asset) => ({
        symbol: asset.symbol,
        name: asset.name,
        price: asset.price,
        change: asset.change,
        source: 'local',
      }))) as MentorQuote[]

  const news = briefing.news && briefing.news.length > 0
    ? briefing.news
    : localFallback.news || []

  const effectivePortfolioValue = briefing.portfolio?.portfolio_value ?? portfolioValue
  const effectiveCash = briefing.portfolio?.cash ?? cash

  const cashRatio =
    typeof effectivePortfolioValue === 'number' && effectivePortfolioValue > 0 && typeof effectiveCash === 'number'
      ? effectiveCash / effectivePortfolioValue
      : undefined

  const guidance = briefing.summary || briefing.reply || localFallback.summary || 'I am watching momentum, support, and volatility.'

  const quickPrompts = [
    'How do I buy or sell?',
    'How do I complete tasks?',
    'What is the latest news?',
    'Which stock looks strongest?',
  ]

  const sendMessage = async (prompt: string) => {
    const text = prompt.trim()
    if (!text || sending) {
      return
    }

    setDraft('')
    setMessages((current) => [...current, { role: 'user', content: text }])
    setSending(true)

    try {
      const history = [...messages, { role: 'user' as const, content: text }].slice(-6)
      const data = await api.mentor(text, briefing.symbols || featured.map((item) => item.symbol), history)
      setBriefing(data)
      setMessages((current) => [...current, { role: 'assistant', content: data.reply || data.summary || 'Here is the latest market read.' }])
      setStatus('live')
    } catch {
      const fallbackReply = localFallback.reply || 'I could not reach the live mentor endpoint, so I am using the local market board.'
      setBriefing(localFallback)
      setMessages((current) => [...current, { role: 'assistant', content: fallbackReply }])
      setStatus('local')
    } finally {
      setSending(false)
    }
  }

  const submitDraft = async () => {
    await sendMessage(draft)
  }

  const handleDraftKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      await submitDraft()
    }
  }

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(15,23,42,0.92))] shadow-lg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.1),transparent_32%)]" />
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="default" className="mb-3">
              <BrainCircuit className="size-3.5" />
              Market Buddy
            </Badge>
            <h2 className="text-lg font-semibold tracking-tight">Your trading mentor</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              I scan live prices, recent headlines, and your portfolio to help you buy with more context.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-3 py-2 text-right">
            <div className="text-xs text-muted-foreground">Source</div>
            <div className="text-sm font-semibold tabular-nums uppercase">{status}</div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-border bg-card/80 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="size-4 text-primary" />
              Chat with me
            </div>
            <div className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-1">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn('max-w-[90%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed', message.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-secondary text-foreground')}
                >
                  {message.content}
                </div>
              ))}
              {loading && (
                <div className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading live briefing...
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleDraftKeyDown}
                rows={3}
                placeholder="Ask about a stock, a trade, or today's news..."
                className="min-h-24 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              />
              <Button onClick={submitDraft} disabled={sending} className="h-auto min-h-24 px-4 sm:w-28">
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Send
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="muted">Portfolio {formatCurrency(effectivePortfolioValue || 0, true)}</Badge>
              {typeof effectiveCash === 'number' && <Badge variant="muted">Cash {formatCurrency(effectiveCash, true)}</Badge>}
              {cashRatio !== undefined && <Badge variant={cashRatio > 0.2 ? 'success' : 'warning'}>{cashRatio > 0.2 ? 'Flexible' : 'Nearly deployed'}</Badge>}
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-background/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4 text-primary" />
                Today&apos;s guidance
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{guidance}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-card/80 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="size-4 text-primary" />
                  Live prices
                </div>
                <Badge variant="muted">Stocks</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {featured.length > 0 ? (
                  featured.map((asset) => (
                    <div key={asset.symbol} className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2.5">
                      <div>
                        <div className="text-sm font-medium">{asset.symbol}</div>
                        <div className="text-xs text-muted-foreground">{asset.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold tabular-nums">{formatCurrency(asset.price)}</div>
                        <div className={cn('flex items-center justify-end gap-1 text-xs font-medium', asset.change >= 0 ? 'text-success' : 'text-destructive')}>
                          {asset.change >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                          {formatPct(asset.change)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                    Loading live market prices…
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/80 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Newspaper className="size-4 text-primary" />
                  Latest news
                </div>
                <Badge variant="muted">{news.length}</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {news.length > 0 ? (
                  news.map((item) => (
                    <a
                      key={item.title}
                      href={item.link || '#'}
                      target={item.link ? '_blank' : undefined}
                      rel={item.link ? 'noreferrer' : undefined}
                      className={cn('block rounded-xl border border-border px-3 py-2.5 transition-colors', item.link ? 'hover:border-primary/40 hover:bg-secondary/50' : 'bg-secondary/30')}
                    >
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {item.publisher || 'MarketMind'}{item.published_at ? ` · ${new Date(item.published_at).toLocaleString()}` : ''}
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                    No headlines available right now.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Educational guidance only. Use it as a second opinion before you trade.
        </div>
      </div>
    </Card>
  )
}