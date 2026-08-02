'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Wallet, Banknote, TrendingUp, Percent, ArrowRight } from 'lucide-react'
import { StatCard } from '@/components/marketmind/stat-card'
import { PortfolioChart } from '@/components/marketmind/portfolio-chart'
import { MarketGrid } from '@/components/marketmind/market-grid'
import { MarketBuddy } from '@/components/marketmind/market-buddy'
import { OnboardingGame } from '@/components/marketmind/onboarding-game'
import { OnboardingTour } from '@/components/marketmind/onboarding-tour'
import { ProfAlgoOnboardingModal } from '@/components/marketmind/prof-algo-onboarding-modal'
import { AIBuddyPortrait } from '@/components/marketmind/ai-buddy-portrait'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { formatCurrency, formatPct } from '@/lib/market-data'
import { useLanguage } from '@/lib/language-context'
import { useAuth, type ExperienceLevel } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { t } = useLanguage()
  const { user, onboarded, completeOnboarding, showToast } = useAuth()
  const [portfolioData, setPortfolioData] = useState<any>(null)
  const [stocks, setStocks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showProfAlgoModal, setShowProfAlgoModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const [showMilestone, setShowMilestone] = useState(false)
  const [showPostCaseTour, setShowPostCaseTour] = useState(false)
  const [tempLevel, setTempLevel] = useState<ExperienceLevel | null>(null)
  const router = useRouter()

  // Detect first-time users: show Prof Algo modal first, then onboarding game
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isNewUser = localStorage.getItem('MM_NEW_USER') === 'true'
    const flowOnboarded = localStorage.getItem('MM_FLOW_ONBOARDED') === 'true'
    if (isNewUser && !flowOnboarded) {
      // Show Prof Algo intro modal first (3-step: Welcome → Basics → Dashboard)
      setShowProfAlgoModal(true)
    } else if (isNewUser && flowOnboarded) {
      // Prof Algo modal was completed, proceed to onboarding game diagnostic
      setShowOnboarding(true)
      localStorage.removeItem('MM_NEW_USER')
      localStorage.setItem('MM_ONBOARDED', 'true')
    }
  }, [user])

  // Handler when Prof Algo modal closes → start onboarding game
  const handleProfAlgoModalClose = () => {
    setShowProfAlgoModal(false)
    setShowOnboarding(true)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('MM_NEW_USER')
      localStorage.setItem('MM_ONBOARDED', 'true')
    }
  }

  // Detect post-case study return guide
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isPostCaseGuide = localStorage.getItem('MM_CASE_STUDY_COMPLETED_GUIDE') === 'true'
    if (isPostCaseGuide && !showOnboarding && !showTour && !showMilestone) {
      setShowPostCaseTour(true)
    }
  }, [showOnboarding, showTour, showMilestone])

  const handlePostCaseTourComplete = () => {
    setShowPostCaseTour(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('MM_CASE_STUDY_COMPLETED_GUIDE')
    }
  }

  // Detect 5+ holdings milestone
  useEffect(() => {
    if (typeof window === 'undefined' || !portfolioData?.holdings) return
    const holdingsCount = portfolioData.holdings.length
    const milestoneDone = localStorage.getItem('MM_MILESTONE_5_DONE') === 'true'
    if (holdingsCount >= 5 && !milestoneDone && !showTour && !showOnboarding && !showPostCaseTour) {
      setShowMilestone(true)
    }
  }, [portfolioData?.holdings, showTour, showOnboarding, showPostCaseTour])

  const handleGoToCaseStudies = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('MM_MILESTONE_5_DONE', 'true')
    }
    setShowMilestone(false)
    router.push('/case-studies')
  }

  const handleDiagnosticComplete = (level: ExperienceLevel) => {
    setTempLevel(level)
    setShowOnboarding(false)
    completeOnboarding(level)
    if (typeof window !== 'undefined') {
      localStorage.setItem('MM_ONBOARDED', 'true')
      localStorage.removeItem('MM_NEW_USER')
    }
    setTimeout(() => {
      setShowTour(true)
    }, 300)
  }

  const handleTourComplete = () => {
    setShowTour(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('MM_ONBOARDED', 'true')
      localStorage.removeItem('MM_NEW_USER')
    }
    const currentLvl = tempLevel || 'beginner'
    completeOnboarding(currentLvl)
    const levelLabels: Record<ExperienceLevel, string> = {
      beginner: '🌱 Market Seedling',
      intermediate: '📊 Market Analyst',
      advanced: '🧠 Market Quant',
    }
    showToast('Rank Assigned! 🎉', `You are now a ${levelLabels[currentLvl]}. Good luck, Trader!`, 'success')
    setTempLevel(null)
  }

  const refreshData = useCallback((showSkeleton = false) => {
    if (showSkeleton) {
      setIsLoading(true)
    }
    return Promise.all([
      api.portfolio().then(setPortfolioData).catch(() => {}),
      api.assets('Stocks').then(setStocks).catch(() => {})
    ]).finally(() => {
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    refreshData(true)
  }, [refreshData])

  useEffect(() => {
    const iv = setInterval(() => {
      refreshData(false)
    }, 30000)
    return () => clearInterval(iv)
  }, [refreshData])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted/60" />
            <div className="h-8 w-48 rounded bg-muted/60" />
          </div>
          <div className="h-10 w-32 rounded-lg bg-muted/60" />
        </div>

        {/* 4 Stat Cards Skeletons */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 border border-border/60">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-muted/60" />
                <div className="size-9 rounded-xl bg-muted/60" />
              </div>
              <div className="mt-3 h-8 w-32 rounded bg-muted/60" />
              <div className="mt-2 h-4 w-16 rounded bg-muted/60" />
            </Card>
          ))}
        </div>

        {/* MarketBuddy Placeholder */}
        <div className="h-28 rounded-2xl bg-muted/60" />

        {/* Chart + Holdings Skeletons */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="h-[300px] border border-border/60 p-5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-muted/60" />
                <div className="h-8 w-24 rounded bg-muted/60" />
              </div>
              <div className="h-[180px] w-full rounded bg-muted/30" />
            </Card>
          </div>
          <Card className="p-5 border border-border/60">
            <div className="flex items-center justify-between">
              <div className="h-5 w-28 rounded bg-muted/60" />
              <div className="h-4 w-12 rounded bg-muted/60" />
            </div>
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-muted/60 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-24 rounded bg-muted/60 animate-pulse" />
                      <div className="h-3 w-16 rounded bg-muted/60 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <div className="h-4 w-16 rounded bg-muted/60 ml-auto animate-pulse" />
                    <div className="h-3 w-10 rounded bg-muted/60 ml-auto animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Watchlist Skeleton */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-32 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="flex flex-col p-4 border border-border/60">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-muted/60 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-20 rounded bg-muted/60 animate-pulse" />
                      <div className="h-3 w-10 rounded bg-muted/60 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-5 w-12 rounded-full bg-muted/60 animate-pulse" />
                </div>
                <div className="mt-6 flex items-end justify-between gap-2">
                  <div className="h-7 w-16 rounded bg-muted/60 animate-pulse" />
                  <div className="h-9 w-20 rounded bg-muted/60 animate-pulse" />
                </div>
                <div className="mt-5 flex gap-2">
                  <div className="h-9 flex-1 rounded-md bg-muted/60 animate-pulse" />
                  <div className="h-9 flex-1 rounded-md bg-muted/60 animate-pulse" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const stats = portfolioData || { value: 0, cash: 0, day_change: 0, day_change_pct: 0, return_pct: 0, holdings: [] }
  const watchlist = stocks.slice(0, 4)

  return (
    <>
      {/* Prof Algo Onboarding Modal — shown as the very first step for new users */}
      <ProfAlgoOnboardingModal
        isOpen={showProfAlgoModal}
        onClose={handleProfAlgoModalClose}
      />

      {/* Onboarding Game Overlay — shown after Prof Algo modal closes */}
      {showOnboarding && (
        <OnboardingGame
          userName={user?.first_name || user?.username || ''}
          onComplete={handleDiagnosticComplete}
        />
      )}

      {/* Onboarding Tour Overlay — runs after diagnostic */}
      {showTour && (
        <OnboardingTour
          onClose={handleTourComplete}
        />
      )}

      {/* Post Case Study Stock Guide Overlay — runs after completing a case study */}
      {showPostCaseTour && (
        <OnboardingTour
          mode="post-case-study"
          onClose={handlePostCaseTourComplete}
        />
      )}

      {/* Milestone Modal — triggered when user buys 5+ stocks */}
      {showMilestone && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border-4 border-[#0F172A] shadow-[8px_8px_0px_0px_rgba(15,23,42,0.2)] flex flex-col items-center text-center select-none">
            <div className="relative mb-4">
              <div className="absolute bottom-0 w-24 h-4 bg-[#00B4D8]/20 rounded-full blur-[1px] animate-pulse" />
              <AIBuddyPortrait size={110} speaking={true} floating={true} />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-[#00B4D8] text-white border-2 border-[#0F172A] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-[2px_2px_0px_0px_#0F172A] mb-3">
              <span>Prof. Algo</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('Phenomenal Progress, Trader! 🌟', 'शानदार प्रगति, ट्रेडर! 🌟')}
            </h3>

            <p className="mt-3 text-xs sm:text-sm font-bold text-slate-600 leading-relaxed">
              {t(
                "Bzzzt! Excellent work! You've successfully built a diversified portfolio with 5+ stock positions! 🚀 You're progressing fast. Now let's dive into deeper market wisdom — head over to the Case Studies tab to complete historical simulations, solve market crises, and earn major XP!",
                "शानदार काम! आपने 5+ शेयरों के साथ एक विविध पोर्टफोलियो बनाया है! 🚀 आप तेज़ी से आगे बढ़ रहे हैं। अब आइए बाज़ार की गहरी समझ में उतरें — ऐतिहासिक सिमुलेशन पूरा करने और XP अर्जित करने के लिए केस स्टडीज़ टैब पर जाएं!"
              )}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') localStorage.setItem('MM_MILESTONE_5_DONE', 'true')
                  setShowMilestone(false)
                }}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm border-2 border-[#0F172A] transition-all cursor-pointer"
              >
                {t('Stay on Dashboard', 'डैशबोर्ड पर रहें')}
              </button>
              <button
                onClick={handleGoToCaseStudies}
                className="flex-1 py-3 rounded-2xl bg-[#00E5FF] hover:bg-[#00B4D8] text-slate-900 font-black text-xs sm:text-sm border-2 border-[#0F172A] shadow-[2px_2px_0px_0px_#0F172A] hover:translate-y-[-1px] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t('Guide Me to Case Studies 🏆', 'केस स्टडीज़ में मार्गदर्शन करें 🏆')}</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{t('Welcome back', 'वापसी पर आपका स्वागत है')}</p>
            <h1 className="text-2xl font-semibold tracking-tight">{t('Dashboard', 'डैशबोर्ड')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/predictor" className="h-10 px-4 text-xs font-bold flex items-center justify-center rounded-xl bg-[#00B4D8] text-white hover:bg-[#00B4D8]/90 transition-all shadow-md shadow-cyan-500/20">
              🎮 Play Predictor Game
            </Link>
            <Link href="/markets" className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-4')}>
              {t('Trade Markets', 'बाज़ार में व्यापार करें')}
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </div>
        </div>

      <div id="tour-stats" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('Portfolio Value', 'पोर्टफोलियो मूल्य')} value={formatCurrency(stats.value)} change={stats.day_change_pct} icon={Wallet} />
        <StatCard label={t('Cash Available', 'उपलब्ध नकदी')} value={formatCurrency(stats.cash)} hint={t('Ready to invest', 'निवेश के लिए तैयार')} icon={Banknote} />
        <StatCard label={t("Today's Gain / Loss", 'आज का लाभ / हानि')} value={formatCurrency(stats.day_change)} change={stats.day_change_pct} icon={TrendingUp} accent="success" />
        <StatCard label={t('Portfolio Return', 'पोर्टफोलियो रिटर्न')} value={formatPct(stats.return_pct)} hint={t('All time', 'कुल समय')} icon={Percent} accent="success" />
      </div>

      <div id="tour-buddy">
        <MarketBuddy assets={stocks} holdings={stats.holdings} portfolioValue={stats.value} cash={stats.cash} />
      </div>

      <div id="tour-chart-holdings" className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PortfolioChart value={stats.value} returnPct={stats.return_pct} />
        </div>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t('Your Holdings', 'आपकी होल्डिंग्स')}</h2>
            <Link href="/portfolio" className="text-sm font-medium text-primary hover:underline">{t('View all', 'सभी देखें')}</Link>
          </div>
          <div className="mt-4 space-y-1">
            {(stats.holdings || []).map((h: any) => (
              <div key={h.id} className="flex items-center justify-between rounded-xl px-2 py-2.5 transition-colors hover:bg-secondary">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-xs font-semibold">
                    {h.asset.symbol.slice(0, 2)}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{h.asset.name}</div>
                    <div className="text-xs text-muted-foreground">{h.shares} {t('shares', 'शेयर')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium tabular-nums">{formatCurrency(h.value)}</div>
                  <div className={cn('text-xs font-medium', h.change >= 0 ? 'text-success' : 'text-destructive')}>
                    {formatPct(h.change)}
                  </div>
                </div>
              </div>
            ))}
            {(stats.holdings || []).length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">{t('No holdings yet. Start trading!', 'अभी कोई होल्डिंग्स नहीं हैं। व्यापार शुरू करें!')}</p>
            )}
          </div>
        </Card>
      </div>

      <div id="tour-watchlist">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{t('Watchlist', 'वॉचलिस्ट')}</h2>
            <Badge variant="muted">{t('Live', 'लाइव')}</Badge>
          </div>
          <Link href="/markets" className="text-sm font-medium text-primary hover:underline">{t('Explore markets', 'बाज़ार देखें')}</Link>
        </div>
        <MarketGrid assets={watchlist} />
      </div>
    </div>
    </>
  )
}
