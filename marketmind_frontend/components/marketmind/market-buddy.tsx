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
import { api } from '@/lib/api'
import { type Asset, formatCurrency, formatPct } from '@/lib/market-data'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'

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

function resolveReturnPct(holding: BuddyHolding) {
  if (typeof holding.return_pct === 'number') {
    return holding.return_pct
  }

  if (!holding.avg_price || holding.avg_price === 0) {
    return 0
  }

  return ((holding.asset.price - holding.avg_price) / holding.avg_price) * 100
}

function buildLocalMentor(assets: Asset[], holdings: BuddyHolding[], portfolioValue?: number, cash?: number, lang: 'en' | 'hi' = 'en'): MentorResponse {
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
  
  let summary = ''
  if (lang === 'hi') {
    summary = isFirstRun
      ? 'स्वागत है! बाज़ार में एक छोटे से खरीद ऑर्डर के साथ शुरुआत करें, फिर जब आप लाभ प्राप्त करना चाहते हैं तो पोर्टफोलियो से बिक्री करें।'
      : bestHolding && weakestHolding
        ? `आपकी सबसे मजबूत स्थिति ${formatAssetLabel(bestHolding.asset)} है। ${formatAssetLabel(weakestHolding.asset)} की समीक्षा करें।`
        : cashRatio !== undefined && cashRatio > 0.2
          ? 'आपके पास एक स्वस्थ नकद बफर है, इसलिए आप हर कदम का पीछा करने के बजाय साफ सेटअप का इंतजार कर सकते हैं।'
          : 'मैं गति, समर्थन और अस्थिरता पर नज़र रख रहा हूँ ताकि आप यह तय कर सकें कि खरीदना है, बेचना है या प्रतीक्षा करनी है।'
  } else {
    summary = isFirstRun
      ? 'Welcome! Start with a small Buy order in Markets, then use Sell from Portfolio when you want to lock in gains or reduce risk.'
      : bestHolding && weakestHolding
        ? `Your strongest position is ${formatAssetLabel(bestHolding.asset)}. Review ${formatAssetLabel(weakestHolding.asset)} before averaging down.`
        : cashRatio !== undefined && cashRatio > 0.2
          ? 'You have a healthy cash buffer, so you can wait for cleaner setups instead of chasing every move.'
          : 'I am watching momentum, support, and volatility so you can decide whether to buy, sell, or wait.'
  }

  const news = [
    strongest && {
      title: lang === 'hi' ? `${formatAssetLabel(strongest)} बढ़त का नेतृत्व कर रहा है` : `${formatAssetLabel(strongest)} is leading the board`,
      publisher: 'MarketMind',
      source: 'local',
    },
    weakest && {
      title: lang === 'hi' ? `${formatAssetLabel(weakest)} दबाव में है` : `${formatAssetLabel(weakest)} is under pressure`,
      publisher: 'MarketMind',
      source: 'local',
    },
    featured[0] && {
      title: lang === 'hi' ? `${formatAssetLabel(featured[0])} में सबसे तेज हलचल है` : `${formatAssetLabel(featured[0])} has the sharpest move`,
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
  const { showToast } = useAuth()
  const { language, t } = useLanguage()
  const stockAssets = useMemo(() => assets.filter((asset) => asset.category === 'Stocks'), [assets])
  const localFallback = useMemo(() => buildLocalMentor(assets, holdings, portfolioValue, cash, language), [assets, holdings, portfolioValue, cash, language])
  const [briefing, setBriefing] = useState<MentorResponse>(localFallback)
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: localFallback.summary || localFallback.reply || t('I am ready to help.', 'मैं मदद के लिए तैयार हूँ।') }])
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
            { role: 'assistant', content: data.summary || t('I have loaded your market briefing.', 'मैंने आपकी बाज़ार ब्रीफिंग लोड कर ली है।') },
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
          return [{ role: 'assistant', content: localFallback.summary || t('I am ready to help.', 'मैं मदद के लिए तैयार हूँ।') }]
        }
        return current
      })
      setStatus('local')
      setLoading(false)
    })

    return () => {
      alive = false
    }
  }, [language])

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

  const guidance = briefing.summary || briefing.reply || localFallback.summary || t('I am watching momentum, support, and volatility.', 'मैं मोमेंटम और अस्थिरता पर नज़र रख रहा हूँ।')

  const quickPrompts = language === 'hi' ? [
    'खरीदें या बेचें कैसे?',
    'कार्यों को कैसे पूरा करें?',
    'नवीनतम समाचार क्या हैं?',
    'कौन सा शेयर सबसे मजबूत दिख रहा है?',
  ] : [
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
      const replyContent = data.reply || data.summary || t('Here is the latest market read.', 'यहाँ नवीनतम बाज़ार विश्लेषण है।')
      setMessages((current) => [...current, { role: 'assistant', content: replyContent }])
      setStatus('live')

      const replyLower = replyContent.toLowerCase()
      if (
        replyLower.includes('not currently included in our available market data') ||
        replyLower.includes('not listed') ||
        replyLower.includes('cannot provide an analysis for') ||
        replyLower.includes('not currently listed')
      ) {
        showToast(
          t("Stock Not Available", "शेयर उपलब्ध नहीं है"),
          t("First search that stock in the Explore Market section to import it!", "इसे आयात करने के लिए पहले एक्सप्लोर मार्केट अनुभाग में उस शेयर को खोजें!"),
          "info"
        )
      }
    } catch {
      const fallbackReply = localFallback.reply || t('I am using the local market board.', 'मैं स्थानीय बाज़ार बोर्ड का उपयोग कर रहा हूँ।')
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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md font-sans">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00B4D8]/10 border border-[#00B4D8]/20 px-3 py-0.5 text-xs font-semibold text-[#00B4D8] mb-2">
            <BrainCircuit className="size-3.5 text-[#00B4D8]" />
            Market Buddy
          </span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">{t('Your trading mentor', 'आपका ट्रेडिंग मेंटर')}</h2>
          <p className="mt-1 text-xs text-slate-600">
            {t('I scan live prices, recent headlines, and your portfolio to help you buy with more context.', 'मैं लाइव कीमतों, हाल की सुर्खियों और आपके पोर्टफोलियो को स्कैन करता हूँ ताकि आप बेहतर समझ के साथ निर्णय ले सकें।')}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-right shadow-xs">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">{t('Source', 'स्रोत')}</div>
          <div className="text-xs font-bold text-[#00B4D8] uppercase">{status === 'live' ? t('Live', 'लाइव') : t('Local', 'लोकल')}</div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <MessageSquare className="size-4 text-[#00B4D8]" />
            {t('Chat with me', 'मुझसे बात करें')}
          </div>
          <div className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn('max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed font-normal shadow-xs', message.role === 'user' ? 'ml-auto bg-gradient-to-r from-[#00B4D8] to-[#0891b2] text-white font-medium' : 'bg-white border border-slate-200/80 text-slate-900')}
              >
                {message.content}
              </div>
            ))}
            {loading && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-600">
                <Loader2 className="size-3.5 animate-spin text-[#00B4D8]" />
                {t('Loading live briefing...', 'लाइव ब्रीफिंग लोड हो रही है...')}
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 hover:border-[#00B4D8]/50 hover:bg-cyan-50/50 hover:text-[#00B4D8] transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleDraftKeyDown}
              rows={2}
              placeholder={t("Ask about a stock, a trade, or today's news...", "शेयर, व्यापार या आज के समाचार के बारे में पूछें...")}
              className="min-h-20 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[#00B4D8] font-sans text-slate-900"
            />
            <button onClick={submitDraft} disabled={sending} className="h-auto min-h-20 px-4 sm:w-24 rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 transition-all">
              {sending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
              {t('Send', 'भेजें')}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">{t('Portfolio', 'पोर्टफोलियो')} <strong className="font-mono font-bold text-slate-900">{formatCurrency(effectivePortfolioValue || 0, true)}</strong></span>
            {typeof effectiveCash === 'number' && <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">{t('Cash', 'नकदी')} <strong className="font-mono font-bold text-slate-900">{formatCurrency(effectiveCash, true)}</strong></span>}
            {cashRatio !== undefined && <span className={cn('rounded-full px-3 py-1 font-semibold border', cashRatio > 0.2 ? 'bg-cyan-50 text-[#00B4D8] border-cyan-100' : 'bg-amber-50 text-amber-700 border-amber-100')}>{cashRatio > 0.2 ? t('Flexible', 'लचीला') : t('Nearly deployed', 'लगभग तैनात')}</span>}
          </div>

          <div className="mt-4 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Sparkles className="size-3.5 text-[#00B4D8]" />
              {t("Today's guidance", 'आज का मार्गदर्शन')}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 font-normal">{guidance}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <TrendingUp className="size-3.5 text-[#00B4D8]" />
                {t('Live prices', 'लाइव कीमतें')}
              </div>
              <span className="rounded-full bg-cyan-50 text-[#00B4D8] px-2.5 py-0.5 text-[10px] font-semibold border border-cyan-100">{t('Stocks', 'शेयर')}</span>
            </div>
            <div className="mt-3 space-y-2">
              {featured.length > 0 ? (
                featured.map((asset) => (
                  <div key={asset.symbol} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs font-sans">
                    <div>
                      <div className="font-mono font-bold text-slate-900">{asset.symbol}</div>
                      <div className="text-[11px] text-slate-500">{asset.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900 tabular-nums">{formatCurrency(asset.price)}</div>
                      <div className={cn('flex items-center justify-end gap-0.5 text-[11px] font-semibold', asset.change >= 0 ? 'text-[#00B4D8]' : 'text-rose-600')}>
                        {asset.change >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                        {formatPct(asset.change)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500 font-sans">
                  {t('Loading live market prices...', 'लाइव बाज़ार कीमतें लोड हो रही हैं...')}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Newspaper className="size-3.5 text-[#00B4D8]" />
                {t('Latest news', 'नवीनतम समाचार')}
              </div>
              <span className="rounded-full bg-cyan-50 text-[#00B4D8] px-2 py-0.5 text-[10px] font-semibold border border-cyan-100">{news.length}</span>
            </div>
            <div className="mt-3 space-y-2">
              {news.length > 0 ? (
                news.map((item) => (
                  <a
                    key={item.title}
                    href={item.link || '#'}
                    target={item.link ? '_blank' : undefined}
                    rel={item.link ? 'noreferrer' : undefined}
                    className={cn('block rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 text-xs font-sans transition-all hover:border-[#00B4D8]/40 hover:bg-cyan-50/40', item.link && 'hover:bg-cyan-50/50')}
                  >
                    <div className="font-semibold text-slate-900 leading-snug">{item.title}</div>
                    <div className="mt-1 text-[10px] text-slate-500">
                      {item.publisher || 'MarketMind'}{item.published_at ? ` · ${new Date(item.published_at).toLocaleString()}` : ''}
                    </div>
                  </a>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500 font-sans">
                  {t('No headlines available right now.', 'अभी कोई मुख्य समाचार उपलब्ध नहीं है।')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-medium">
        <ShieldCheck className="size-3.5 text-[#00B4D8]" />
        {t('Educational guidance only. Use it as a second opinion before you trade.', 'केवल शैक्षणिक मार्गदर्शन। व्यापार करने से पहले इसे दूसरी राय के रूप में उपयोग करें।')}
      </div>
    </div>
  )

}