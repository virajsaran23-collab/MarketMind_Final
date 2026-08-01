'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { BrainCircuit } from 'lucide-react'
import { AIBuddyPortrait } from './ai-buddy-portrait'
import { useAuth } from '@/lib/auth-context'

type PopupMessage = {
  id: string
  text: string
  duration?: number // ms before auto-dismiss (default 8000)
}

/**
 * ProfAlgoPopup — a game-style toast notification system.
 *
 * Prof Algo slides in from the right side of the screen, speaks his
 * message with a typewriter animation, then slides back out and vanishes.
 *
 * Trigger from anywhere via:
 *   window.dispatchEvent(new CustomEvent('prof_algo:speak', {
 *     detail: { text: '...', duration: 8000 }
 *   }))
 */
export function ProfAlgoPopup() {
  const { user } = useAuth()
  const [queue, setQueue] = useState<PopupMessage[]>([])
  const [current, setCurrent] = useState<PopupMessage | null>(null)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [phase, setPhase] = useState<'hidden' | 'entering' | 'visible' | 'exiting'>('hidden')

  const typeIndexRef = useRef(0)
  const typeTimerRef = useRef<any>(null)
  const dismissTimerRef = useRef<any>(null)
  const processingRef = useRef(false)

  // ── Listen for speak events from anywhere in the app ──
  useEffect(() => {
    const handler = (e: any) => {
      const { text, duration } = e.detail || {}
      if (!text) return
      const msg: PopupMessage = {
        id: `${Date.now()}-${Math.random()}`,
        text,
        duration: duration || 8000,
      }
      setQueue((prev) => [...prev, msg])
    }

    window.addEventListener('prof_algo:speak', handler)
    return () => window.removeEventListener('prof_algo:speak', handler)
  }, [])

  // ── Fire initial greeting on first mount ──
  useEffect(() => {
    if (!user) return
    const name = user.first_name || user.username || 'Trader'

    // Small delay so the page loads first, then Prof Algo slides in
    const t = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('prof_algo:speak', {
          detail: {
            text: `Bzzzt! Connection established! Well hello there, ${name}! I'm Prof. Algo — your live market mentor. I'll pop in whenever you make a great move or need guidance. Happy trading! 🚀`,
            duration: 10000,
          },
        })
      )
    }, 1500)

    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username])

  // ── Listen for trade events and convert to speak events ──
  useEffect(() => {
    const handler = (e: any) => {
      const { assetName, symbol, mode, investment } = e.detail || {}
      const investStr = typeof investment === 'number' ? `$${investment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''

      const text =
        mode === 'buy'
          ? `Great buy! You just allocated ${investStr} into ${assetName || symbol} (${symbol}). Your story persona and Leaderboard standing have been updated!`
          : `Smart move! You sold your position in ${assetName || symbol} (${symbol}). Risk managed like a pro! 💪`

      window.dispatchEvent(
        new CustomEvent('prof_algo:speak', { detail: { text, duration: 7000 } })
      )
    }

    window.addEventListener('mm:trade_completed', handler)
    return () => window.removeEventListener('mm:trade_completed', handler)
  }, [])

  // ── Process queue: pick next message when idle ──
  useEffect(() => {
    if (processingRef.current || queue.length === 0) return
    const [next, ...rest] = queue
    processingRef.current = true
    setCurrent(next)
    setQueue(rest)
  }, [queue, phase])

  // ── Animate current message lifecycle ──
  useEffect(() => {
    if (!current) return

    // 1. Enter
    setPhase('entering')
    setTypedText('')
    setIsTyping(true)
    typeIndexRef.current = 0

    const enterTimeout = setTimeout(() => {
      setPhase('visible')

      // 2. Typewriter
      typeTimerRef.current = setInterval(() => {
        if (typeIndexRef.current < current.text.length) {
          setTypedText(current.text.slice(0, typeIndexRef.current + 1))
          typeIndexRef.current++
        } else {
          clearInterval(typeTimerRef.current)
          setIsTyping(false)
        }
      }, 18)

      // 3. Auto-dismiss after duration
      dismissTimerRef.current = setTimeout(() => {
        dismiss()
      }, current.duration || 8000)
    }, 50) // tiny delay for CSS transition to kick in

    return () => {
      clearTimeout(enterTimeout)
      clearInterval(typeTimerRef.current)
      clearTimeout(dismissTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const dismiss = useCallback(() => {
    clearInterval(typeTimerRef.current)
    clearTimeout(dismissTimerRef.current)
    setPhase('exiting')

    setTimeout(() => {
      setPhase('hidden')
      setCurrent(null)
      setTypedText('')
      setIsTyping(false)
      processingRef.current = false
    }, 500) // match exit animation duration
  }, [])

  if (phase === 'hidden' || !current) return null

  const slideClass =
    phase === 'entering'
      ? 'translate-x-[110%] opacity-0'
      : phase === 'visible'
        ? 'translate-x-0 opacity-100'
        : 'translate-x-[110%] opacity-0'

  return (
    <div
      className={`fixed bottom-8 right-6 z-[200] flex items-end gap-3 max-w-md transition-all duration-500 ease-out ${slideClass}`}
      style={{ pointerEvents: phase === 'exiting' ? 'none' : 'auto' }}
    >
      {/* Speech Bubble */}
      <div
        className="relative bg-slate-950/95 backdrop-blur-xl rounded-2xl border border-[#00B4D8]/50 px-5 py-4 shadow-[0_12px_40px_rgba(0,180,216,0.35)] cursor-pointer"
        onClick={dismiss}
      >
        {/* Pointer triangle towards avatar */}
        <div className="absolute -right-2 bottom-5 w-4 h-4 bg-slate-950/95 border-r border-b border-[#00B4D8]/50 rotate-[-45deg]" />

        {/* Badge */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="inline-flex items-center gap-1 bg-[#00E5FF]/20 text-[#00E5FF] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-[#00E5FF]/40 uppercase tracking-widest">
            <BrainCircuit className="size-3" />
            Prof. Algo
          </span>
        </div>

        {/* Typewriter text */}
        <p className="text-[13px] font-semibold text-white leading-relaxed">
          {typedText}
          {isTyping && (
            <span className="inline-block w-[3px] h-3.5 ml-0.5 bg-[#00E5FF] animate-pulse rounded-sm" />
          )}
        </p>

        {/* Subtle tap-to-dismiss hint */}
        <p className="mt-2 text-[9px] text-slate-500 text-right">
          tap to dismiss
        </p>
      </div>

      {/* Prof Algo Avatar — slides in with the bubble */}
      <div className="shrink-0 mb-1">
        <AIBuddyPortrait size={52} floating={false} speaking={isTyping} />
      </div>
    </div>
  )
}
