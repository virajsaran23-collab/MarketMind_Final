'use client'

import { useState } from 'react'
import { Search, HelpCircle, X, Sparkles, BookOpen, Lightbulb } from 'lucide-react'
import { AIBuddyPortrait } from './ai-buddy-portrait'
import { cn } from '@/lib/utils'

export type GlossaryTerm = {
  id: string
  term: string
  emoji: string
  simpleDefinition: string
  everydayAnalogy: string
  funFact: string
  category: 'Basics' | 'Trading' | 'Growth' | 'Market Trends'
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'stock',
    term: 'Stock (or Share)',
    emoji: '🍕',
    simpleDefinition: 'A tiny slice of ownership in a real company.',
    everydayAnalogy: 'Imagine a giant pizza cut into 1,000 tiny slices. If you buy 1 slice, you own a tiny part of the whole pizza shop!',
    funFact: 'When you buy 1 share of Disney or Apple, you become a real partial owner of that company!',
    category: 'Basics',
  },
  {
    id: 'portfolio',
    term: 'Portfolio',
    emoji: '🎒',
    simpleDefinition: 'Your collection of different stocks and investments.',
    everydayAnalogy: 'Like a school backpack holding your notebook, pencil case, snacks, and water bottle. Your portfolio holds all your different investments!',
    funFact: 'Having a mix of different things in your backpack makes sure you are ready for any class!',
    category: 'Basics',
  },
  {
    id: 'dividend',
    term: 'Dividend',
    emoji: '🎁',
    simpleDefinition: 'A cash thank-you bonus paid by a company to its stock owners when it makes a profit.',
    everydayAnalogy: 'If your lemonade stand makes extra profit at the end of the summer, you share a dollar bonus with everyone who helped you build it!',
    funFact: 'Some famous companies have paid dividends every single year for over 100 years!',
    category: 'Growth',
  },
  {
    id: 'diversification',
    term: 'Diversification',
    emoji: '🧺',
    simpleDefinition: 'Spreading your money across different investments so one bad day doesn\'t hurt everything.',
    everydayAnalogy: 'Putting your fruits, eggs, and honey in separate baskets so if you stumble on a rock, you don\'t drop all your food at once!',
    funFact: 'Owning stocks in tech, food, games, and energy is the ultimate safety shield against market drops.',
    category: 'Basics',
  },
  {
    id: 'compound-interest',
    term: 'Compound Interest',
    emoji: '☃️',
    simpleDefinition: 'Earning extra money on your savings, and then earning even MORE money on top of that extra money!',
    everydayAnalogy: 'Rolling a tiny snowball down a snowy hill. As it rolls, it collects more snow, getting bigger and faster all by itself!',
    funFact: 'Albert Einstein called Compound Interest the 8th Wonder of the World!',
    category: 'Growth',
  },
  {
    id: 'supply-demand',
    term: 'Supply & Demand',
    emoji: '⚖️',
    simpleDefinition: 'How much of something exists (Supply) versus how many people want to buy it (Demand).',
    everydayAnalogy: 'If everyone in class wants a rare superhero trading card (High Demand) but there is only 1 card left (Low Supply), its price goes UP!',
    funFact: 'When supply goes up and demand goes down, prices become cheaper!',
    category: 'Market Trends',
  },
  {
    id: 'bull-market',
    term: 'Bull Market',
    emoji: '🐂',
    simpleDefinition: 'When stock prices are going up and investors feel confident!',
    everydayAnalogy: 'Like a strong bull charging upwards with its horns!',
    funFact: 'A bull market usually means the economy is growing and companies are hiring.',
    category: 'Market Trends',
  },
  {
    id: 'bear-market',
    term: 'Bear Market',
    emoji: '🐻',
    simpleDefinition: 'When stock prices are falling and investors are being extra cautious.',
    everydayAnalogy: 'Like a sleepy bear hibernating in winter while waiting for spring to arrive.',
    funFact: 'Bear markets are actually great opportunities for smart investors to buy great stocks at discount prices!',
    category: 'Market Trends',
  },
  {
    id: 'risk',
    term: 'Risk',
    emoji: '🧗',
    simpleDefinition: 'The chance that an investment might lose value or not turn out as planned.',
    everydayAnalogy: 'Riding a bicycle faster: you might get there sooner, but you need to wear a helmet (diversification) just in case!',
    funFact: 'Higher potential rewards usually come with higher risk, which is why balancing your portfolio is key.',
    category: 'Trading',
  },
]

export function FinanceGlossaryModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [activeTerm, setActiveTerm] = useState<GlossaryTerm>(GLOSSARY_TERMS[0])

  if (!isOpen) return null

  const filtered = GLOSSARY_TERMS.filter((t) => {
    const matchesSearch =
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.simpleDefinition.toLowerCase().includes(search.toLowerCase())
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory
    return matchesSearch && matchesCat
  })

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#00B4D8]/30 bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00B4D8] to-[#0891b2] text-white shadow-md">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-foreground">
                Kids Finance Dictionary 📖
              </h2>
              <p className="text-xs text-muted-foreground">
                Simple definitions & fun analogies explained by Prof. Algo!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-12">
          {/* Left Column: Search & Term List */}
          <div className="flex flex-col border-r border-border bg-card/50 p-4 md:col-span-5">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search a term (e.g. Stock, Dividend)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {['All', 'Basics', 'Growth', 'Market Trends'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all',
                    selectedCategory === cat
                      ? 'bg-[#00B4D8] text-white shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Terms List */}
            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTerm(item)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all',
                    activeTerm.id === item.id
                      ? 'bg-[#00B4D8]/15 border border-[#00B4D8]/40 shadow-sm'
                      : 'border border-transparent hover:bg-muted/40'
                  )}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-foreground">{item.term}</div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {item.simpleDefinition}
                    </div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No financial terms found matching your search.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Detailed View */}
          <div className="flex flex-col overflow-y-auto p-6 md:col-span-7 bg-muted/10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{activeTerm.emoji}</span>
              <div>
                <span className="rounded-full bg-[#00B4D8]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#00B4D8] border border-[#00B4D8]/20">
                  {activeTerm.category}
                </span>
                <h3 className="text-xl font-extrabold text-foreground mt-1">
                  {activeTerm.term}
                </h3>
              </div>
            </div>

            {/* Simple Definition Card */}
            <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
                <Sparkles className="size-4" /> Plain English Definition
              </div>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {activeTerm.simpleDefinition}
              </p>
            </div>

            {/* Everyday Analogy Card */}
            <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 dark:bg-amber-500/10">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                <Lightbulb className="size-4" /> Real World Analogy
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                {activeTerm.everydayAnalogy}
              </p>
            </div>

            {/* Prof Algo Fun Fact */}
            <div className="mt-auto flex items-start gap-3 rounded-2xl border border-slate-700/40 bg-slate-900 p-4 text-slate-200">
              <AIBuddyPortrait size={48} speaking={false} />
              <div>
                <div className="text-xs font-bold text-[#00B4D8] uppercase tracking-wider mb-0.5">
                  Prof. Algo&apos;s Fun Fact 🤖
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "{activeTerm.funFact}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
