'use client'

import { useEffect, useState, useRef } from 'react'
import { 
  BrainCircuit, 
  X, 
  MessageSquare, 
  Sparkles, 
  Trophy, 
  ChevronRight, 
  Minimize2, 
  Volume2, 
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react'
import { AIBuddyPortrait } from './ai-buddy-portrait'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export function ProfAlgoFloatingCompanion() {
  const { user, profile } = useAuth()
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [speechText, setSpeechText] = useState('')
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [algoData, setAlgoData] = useState<any>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [showChatMode, setShowChatMode] = useState(false)

  // Typewriter effect ref
  const typeIndexRef = useRef(0)
  const timerRef = useRef<any>(null)

  // Initial load speech
  useEffect(() => {
    if (!user) return

    api.storyMode()
      .then((data) => {
        setAlgoData(data)
        const mem = data.algo_memory || {}
        const persona = mem.trader_persona || 'Market Apprentice'
        const rank = profile?.global_rank || 'N/A'
        
        let initialSpeech = `Bzzzt! Greetings ${user.first_name || user.username}! I am Prof Algo. Your active persona is "${persona}" and you are ranked #${rank} on the Leaderboard. I will guide you live as you trade!`
        
        if (mem.memory_notes && mem.memory_notes.length > 0) {
          const lastNote = mem.memory_notes[mem.memory_notes.length - 1]
          initialSpeech = `Bzzzt! Welcome back ${user.first_name || user.username}! I remember your last move: "${lastNote}". Let's make your next market move!`
        }

        setSpeechText(initialSpeech)
        startTypewriter(initialSpeech)
      })
      .catch(() => {
        const fallback = `Bzzzt! Hello ${user.first_name || user.username}! I am Prof Algo, your live market companion. Trade stocks in Markets and I will guide your learning!`
        setSpeechText(fallback)
        startTypewriter(fallback)
      })
  }, [user])

  // Listen for live trade events from anywhere in the app
  useEffect(() => {
    const handleTradeCompleted = (event: any) => {
      const { assetName, symbol, mode, investment } = event.detail || {}
      setIsOpen(true)
      setIsMinimized(false)

      const tradeSpeech = mode === 'buy'
        ? `Great buy! You just allocated $${investment?.toLocaleString() || ''} into ${assetName || symbol} (${symbol}). Your story persona and Leaderboard standing have been updated!`
        : `Smart risk control! Liquidating your position in ${assetName || symbol} (${symbol}) protects your cash reserves.`

      setSpeechText(tradeSpeech)
      startTypewriter(tradeSpeech)
    }

    window.addEventListener('mm:trade_completed', handleTradeCompleted)
    return () => window.removeEventListener('mm:trade_completed', handleTradeCompleted)
  }, [])

  // Typewriter animation engine
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
    }, 25)
  }

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setTypedText('Prof Algo is thinking...')
    setIsTyping(true)
    setChatLoading(true)

    try {
      const res = await api.mentor(userMsg)
      const reply = res.reply || "I am analyzing the market data for you."
      setSpeechText(reply)
      startTypewriter(reply)
    } catch (err) {
      setSpeechText("I couldn't process that right now, but I am still tracking your portfolio!")
      startTypewriter("I couldn't process that right now, but I am still tracking your portfolio!")
    } finally {
      setChatLoading(false)
    }
  }

  if (!user || !isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end gap-3 select-none font-sans max-w-[calc(100vw-2rem)]">
      {/* Expanded Floating Speech Card */}
      {!isMinimized && (
        <div className="w-[calc(100vw-2rem)] sm:w-96 rounded-3xl border-2 border-[#00B4D8]/40 bg-slate-950/95 text-white p-5 shadow-[0_20px_50px_rgba(0,180,216,0.3)] backdrop-blur-xl animate-in slide-in-from-bottom-6 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-[#00B4D8]/20 border border-[#00B4D8]/40">
                <BrainCircuit className="size-4 text-[#00B4D8]" />
              </div>
              <div>
                <span className="text-xs font-black text-white">Prof. Algo</span>
                <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  Live Companion
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Minimize Companion"
              >
                <Minimize2 className="size-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Close Companion"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Body: Robot Portrait & Dynamic Typewriter Speech */}
          <div className="my-4 flex items-start gap-4">
            <div className="relative shrink-0">
              <AIBuddyPortrait size={64} floating={true} speaking={isTyping} />
              {isTyping && (
                <div className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="rounded-2xl bg-slate-900/90 p-3.5 border border-slate-800 text-xs text-slate-200 leading-relaxed shadow-inner">
                <p>{typedText}</p>
                {isTyping && <span className="inline-block w-1.5 h-3 ml-1 bg-[#00B4D8] animate-pulse" />}
              </div>
            </div>
          </div>

          {/* Quick Memory Stats */}
          {algoData?.algo_memory && (
            <div className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2 text-[11px] border border-slate-800 text-slate-300">
              <span>Persona: <strong className="text-amber-300">{algoData.algo_memory.trader_persona}</strong></span>
              <span>Rank: <strong className="text-cyan-300">#{profile?.global_rank || 'N/A'}</strong></span>
            </div>
          )}

          {/* Interactive Chat Bar */}
          {showChatMode ? (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask Prof Algo about a stock or decision..."
                className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 border border-slate-700 outline-none focus:border-[#00B4D8]"
              />
              <button
                onClick={handleSendChat}
                disabled={chatLoading || !chatInput.trim()}
                className="rounded-xl bg-[#00B4D8] px-3 py-2 text-xs font-bold text-white hover:bg-[#0077B6] disabled:opacity-50 transition-all"
              >
                Send
              </button>
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => setShowChatMode(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                <MessageSquare className="size-3.5" />
                <span>Talk to Prof Algo</span>
              </button>

              <button
                onClick={() => {
                  const tips = [
                    "Remember: Holding quality stocks through volatility is the mark of a seasoned investor!",
                    "Did you know? Diversifying across 3+ sectors protects your portfolio from market crashes.",
                    "Tip: Check the Leaderboard to see how your portfolio return compares to other quants!"
                  ]
                  const nextTip = tips[Math.floor(Math.random() * tips.length)]
                  setSpeechText(nextTip)
                  startTypewriter(nextTip)
                }}
                className="text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                Next Tip 💡
              </button>
            </div>
          )}
        </div>
      )}

      {/* Minimized Floating Trigger Button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-4 py-2.5 shadow-[0_10px_30px_rgba(0,180,216,0.3)] border-2 border-[#00B4D8]/50 hover:scale-105 transition-all duration-300 cursor-pointer"
      >
        <div className="relative">
          <AIBuddyPortrait size={36} floating={false} speaking={isTyping} />
          <span className="absolute -top-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full bg-emerald-400 border border-slate-950" />
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1 text-xs font-black text-white">
            <span>Prof. Algo</span>
            <Sparkles className="size-3 text-[#00B4D8]" />
          </div>
          <p className="text-[10px] text-cyan-300 font-semibold">
            {isMinimized ? 'Click for Live Guidance 💬' : 'Live Guide Active'}
          </p>
        </div>
      </button>
    </div>
  )
}
