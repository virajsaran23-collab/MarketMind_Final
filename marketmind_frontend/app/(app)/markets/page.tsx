'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, BookOpen, ArrowRight, Sparkles } from 'lucide-react'
import { MarketsExplorer } from '@/components/marketmind/markets-explorer'
import { AIBuddyPortrait } from '@/components/marketmind/ai-buddy-portrait'
import { useLanguage } from '@/lib/language-context'
import { useAuth } from '@/lib/auth-context'
import { getUserScopedKey } from '@/lib/user-storage'
import { api } from '@/lib/api'

export default function MarketsPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const [assets, setAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<string>('All')
  const [marketsUnlocked, setMarketsUnlocked] = useState<boolean | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Check if markets are unlocked (at least 1 case study completed)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const completed = localStorage.getItem(getUserScopedKey(user?.id, 'MM_CASE_STUDY_COMPLETED')) === 'true'
    setMarketsUnlocked(completed)
  }, [user?.id])

  const fetchAssets = useCallback((category?: string, search?: string, showSkeleton = false) => {
    if (showSkeleton) {
      setIsLoading(true)
    }
    api.assets(category, search)
      .then(setAssets)
      .catch(() => {})
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Initial load
  useEffect(() => {
    if (marketsUnlocked) {
      fetchAssets(filter, '', true)
    }
  }, [filter, fetchAssets, marketsUnlocked])

  // Polling in background
  useEffect(() => {
    if (!marketsUnlocked) return
    const iv = setInterval(() => fetchAssets(filter, query, false), 30000)
    return () => clearInterval(iv)
  }, [fetchAssets, filter, query, marketsUnlocked])

  // Debounced search
  useEffect(() => {
    if (!marketsUnlocked) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchAssets(filter, query, true)
    }, query ? 400 : 0)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, filter, fetchAssets, marketsUnlocked])

  // Markets Locked View (matches Dashboard lock screen)
  if (marketsUnlocked === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-400/10 via-blue-500/5 to-purple-500/10 blur-3xl animate-pulse" />
        </div>

        <div className="relative max-w-lg w-full">
          {/* Lock Icon with glow */}
          <div className="relative mx-auto mb-6 flex items-center justify-center">
            <div className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 blur-2xl animate-pulse" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-300 shadow-lg">
              <Lock className="size-10 text-slate-400" strokeWidth={2.5} />
            </div>
          </div>

          {/* Prof. Algo */}
          <div className="relative mb-5">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-3 bg-[#00B4D8]/20 rounded-full blur-[1px] animate-pulse" />
            <AIBuddyPortrait size={100} speaking={true} floating={true} />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[#00B4D8] text-white border-2 border-[#0F172A] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-[2px_2px_0px_0px_#0F172A] mb-4">
            <Sparkles className="size-3" />
            <span>Prof. Algo</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
            {t('Markets Locked 🔒', 'मार्केट्स लॉक हैं 🔒')}
          </h2>

          <p className="text-sm sm:text-base font-bold text-slate-500 leading-relaxed max-w-md mx-auto mb-2">
            {t(
              "Bzzzt! Hold on, trader! Before you can access live Markets to trade stocks, you need to complete at least ONE Case Study to prove your market knowledge!",
              "रुकिए, ट्रेडर! लाइव मार्केट्स तक पहुँचने और शेयर ट्रेड करने से पहले, आपको अपने बाज़ार ज्ञान को साबित करने के लिए कम से कम एक केस स्टडी पूरी करनी होगी!"
            )}
          </p>

          <p className="text-xs text-slate-400 mb-6">
            {t(
              'Complete any case study quiz to unlock this section.',
              'इस सेक्शन को अनलॉक करने के लिए कोई भी केस स्टडी क्विज पूरा करें।'
            )}
          </p>

          <button
            onClick={() => router.push('/case-studies')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#00E5FF] hover:bg-[#00B4D8] text-slate-900 font-black text-sm border-2 border-[#0F172A] shadow-[3px_3px_0px_0px_#0F172A] hover:shadow-[1px_1px_0px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
          >
            <BookOpen className="size-4" />
            {t('Go to Case Studies 📚', 'केस स्टडीज़ पर जाएं 📚')}
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <MarketsExplorer
      assets={assets}
      isLoading={isLoading}
      onRefresh={() => fetchAssets(filter, query, true)}
      query={query}
      onQueryChange={setQuery}
      filter={filter}
      onFilterChange={setFilter}
    />
  )
}
