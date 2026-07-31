'use client'

import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { FinanceGlossaryModal, GLOSSARY_TERMS, type GlossaryTerm } from './finance-glossary-modal'
import { cn } from '@/lib/utils'

// Terms map for quick matching (case-insensitive)
const TERM_KEYWORDS: Record<string, string> = {
  stock: 'stock',
  stocks: 'stock',
  share: 'stock',
  shares: 'stock',
  portfolio: 'portfolio',
  portfolios: 'portfolio',
  dividend: 'dividend',
  dividends: 'dividend',
  diversification: 'diversification',
  diversify: 'diversification',
  'compound interest': 'compound-interest',
  compounding: 'compound-interest',
  'supply & demand': 'supply-demand',
  supply: 'supply-demand',
  demand: 'supply-demand',
  'bull market': 'bull-market',
  'bear market': 'bear-market',
  risk: 'risk',
}

export function SmartTermText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null)

  if (!text) return null

  // Split text into tokens and look for financial keywords
  const regex = new RegExp(
    `\\b(${Object.keys(TERM_KEYWORDS).sort((a, b) => b.length - a.length).join('|')})\\b`,
    'gi'
  )

  const parts: (string | { word: string; termId: string })[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    const matchedWord = match[0]
    const termId = TERM_KEYWORDS[matchedWord.toLowerCase()]
    parts.push({ word: matchedWord, termId })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  const handleTermClick = (termId: string) => {
    const found = GLOSSARY_TERMS.find((t) => t.id === termId)
    if (found) {
      setSelectedTerm(found)
    }
  }

  return (
    <>
      <span className={cn('inline', className)}>
        {parts.map((part, idx) => {
          if (typeof part === 'string') {
            return <span key={idx}>{part}</span>
          }
          return (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleTermClick(part.termId)
              }}
              className="inline-flex items-center gap-0.5 rounded-md border border-[#00B4D8]/30 bg-[#00B4D8]/10 px-1.5 py-0.5 text-xs font-bold text-[#00B4D8] hover:bg-[#00B4D8]/20 transition-all cursor-pointer mx-0.5"
              title="Click to view definition in Finance Dictionary"
            >
              {part.word}
              <BookOpen className="size-3" />
            </button>
          )
        })}
      </span>

      {/* Dictionary Modal focused on selected term */}
      {selectedTerm && (
        <FinanceGlossaryModal
          isOpen={!!selectedTerm}
          onClose={() => setSelectedTerm(null)}
        />
      )}
    </>
  )
}
