'use client'

import { useEffect, useState, useRef } from 'react'
import { X, Sparkles, BrainCircuit, ArrowRight, MessageSquare, RefreshCw } from 'lucide-react'
import { AIBuddyPortrait } from './ai-buddy-portrait'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

interface Props {
  holdingsCount?: number
  portfolioValue?: number
}

export function ProfAlgoSpeechBubbleDialog({ holdingsCount = 0, portfolioValue = 100000 }: Props) {
  const { user, profile } = useAuth()
  const [visible, setVisible] = useState(true)
  const [speechText, setSpeechText] = useState('')
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userQuery, setUserQuery] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [loading, setLoading] = useState(false)

  const typeIndexRef = useRef(0)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    if (!user) return

    api.storyMode()
      .then((data) => {
        const mem = data.algo_memory || {}
        const persona = mem.trader_persona || 'Market Apprentice'
        const name = user.first_name || user.username || 'Trader'

        let text = ''
        if (holdingsCount === 0) {
          text = `Bzzzt! Connection established! Well hello there, ${name}! I'm Prof. Algo — your live market guide! Your trading journey starts with $100,000 in virtual cash. Open Markets and make your first trade to begin learning!`
        } else if (holdingsCount < 3) {
          text = `Bzzzt! Outstanding progress, ${name}! You've executed your first trade! Your persona is currently "${persona}". Now, let me guide you to diversify across 3+ stocks so inflation and market dips don't catch you off guard!`
        } else {
          text = `Bzzzt! Phenomenal work, ${name}! You hold ${holdingsCount} stocks and are currently ranked #${profile?.global_rank || 'N/A'} on the Leaderboard! Remember: holding quality stocks through market cycles is how legends are made!`
        }

        setSpeechText(text)
        startTypewriter(text)
      })
      .catch(() => {
        const fallback = `Bzzzt! Connection established! Well hello there, ${user.first_name || user.username}! I'm Prof. Algo — your in-game stock mentor. Ask me anything or explore the markets to start learning!`
        setSpeechText(fallback)
        startTypewriter(fallback)
      })
  }, [user, holdingsCount, profile])

  const startTypewriter = (text: string) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTypedText('')
    setIsTyping(true)
    typeIndexRef.current = 0

    timerRef.current = setInterval(() => {
      if (typeIndexRef.current < text.length) {
        setTypedText(text.slice(0, typeIndexRef.current + 1))
        typeIndexRef.current++
      } else {
        clearInterval(timerRef.current)
        setIsTyping(false)
      }
    }, 20)
  }

  const handleSendQuestion = async () => {
    if (!userQuery.trim() || loading) return
    const q = userQuery.trim()
    setUserQuery('')
    setTypedText('Prof. Algo is calculating market insights...')
    setIsTyping(true)
    setLoading(true)

    try {
      const res = await api.mentor(q)
      const reply = res.reply || 'Analyzing stock data for you...'
      setSpeechText(reply)
      startTypewriter(reply)
    } catch {
      const errText = "I couldn't reach the financial database right now, but keep trading to build your portfolio!"
      setSpeechText(errText)
      startTypewriter(errText)
    } finally {
      setLoading(false)
    }
  }

  if (!visible || !user) return null

  return (
    <div className="my-6 relative w-full select-none animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col-reverse md:flex-row items-center gap-6">
        {/* Large White Speech Bubble Container (matching Image 2) */}
        <div className="relative flex-1 w-full bg-white rounded-[32px] border-4 border-[#0F172A] p-6 sm:p-7 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          {/* Speech bubble pointer pointing right towards Prof Algo avatar */}
          <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border-t-4 border-r-4 border-[#0F172A] rotate-45 z-10 hidden md:block" />

          {/* Top Row: Cyan Badge & Close Button */}
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-1.5 bg-[#00E5FF] text-[#0F172A] font-black text-xs px-4 py-1.5 rounded-full border-2 border-[#0F172A] shadow-[2px_2px_0px_0px_#0F172A] uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>PROF. ALGO</span>
            </div>

            <button
              onClick={() => setVisible(false)}
              className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 border-2 border-[#0F172A] hover:bg-slate-200 transition-colors"
              title="Close Guide"
            >
              <X className="size-4 font-bold" />
            </button>
          </div>

          {/* Speech Text Content */}
          <div className="min-h-[60px] text-slate-900 font-bold text-sm sm:text-base leading-relaxed tracking-normal">
            <p className="whitespace-pre-line">
              {typedText}
              {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-[#00E5FF] animate-pulse" />}
            </p>
          </div>

          {/* Interactive Question Input / Action Bar */}
          <div className="mt-4 border-t-2 border-slate-200 pt-3 flex flex-wrap items-center justify-between gap-3">
            {showInput ? (
              <div className="flex w-full items-center gap-2">
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendQuestion()}
                  placeholder="Ask Prof. Algo anything about stocks or risk..."
                  className="flex-1 rounded-xl bg-slate-100 border-2 border-[#0F172A] px-3.5 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white"
                />
                <button
                  onClick={handleSendQuestion}
                  disabled={loading || !userQuery.trim()}
                  className="rounded-xl bg-[#00E5FF] border-2 border-[#0F172A] px-4 py-2 text-xs font-black text-[#0F172A] shadow-[2px_2px_0px_0px_#0F172A] hover:bg-[#00B4D8] disabled:opacity-50 transition-all"
                >
                  Send
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowInput(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-[#00B4D8] hover:underline"
                >
                  <MessageSquare className="size-4" />
                  <span>Ask Prof. Algo a Question</span>
                </button>

                <button
                  onClick={() => {
                    const tips = [
                      `Bzzzt! Tip for ${user.first_name || 'Trader'}: Never invest money you'll need tomorrow. Spreading cash across stocks reduces volatility!`,
                      `Bzzzt! Fun Fact: During the 2008 Financial Crisis, value investors who bought broad index dips doubled their wealth over the following 5 years!`,
                      `Bzzzt! Keep trading in Markets to unlock your next Story Badge and climb the Leaderboard!`
                    ]
                    const nextTip = tips[Math.floor(Math.random() * tips.length)]
                    setSpeechText(nextTip)
                    startTypewriter(nextTip)
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  <RefreshCw className="size-3.5" />
                  <span>Another Insight</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Robot Avatar (matching Image 2) */}
        <div className="shrink-0 flex flex-col items-center justify-center">
          <div className="relative">
            <AIBuddyPortrait size={120} floating={true} speaking={isTyping} />
          </div>
        </div>
      </div>
    </div>
  )
}
