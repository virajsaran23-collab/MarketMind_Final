'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Bell, LogOut, Lock } from 'lucide-react'
import { Logo } from './logo'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { LanguageToggle } from './language-toggle'
import { FinanceGlossaryModal } from './finance-glossary-modal'
import { api } from '@/lib/api'
import { getUserScopedKey } from '@/lib/user-storage'

const links = [
  { href: '/predictor', labelEn: 'Predictor Game', labelHi: 'अनुमान गेम' },
  { href: '/learning-basics', labelEn: 'Learning the basics', labelHi: 'बेसिक्स सीखें' },
  { href: '/case-studies', labelEn: 'Case Studies', labelHi: 'केस स्टडीज़' },
  { href: '/dashboard', labelEn: 'Dashboard', labelHi: 'डैशबोर्ड' },
  { href: '/portfolio', labelEn: 'Portfolio', labelHi: 'पोर्टफोलियो' },
  { href: '/markets', labelEn: 'Markets', labelHi: 'मार्केट्स' },
  { href: '/analytics', labelEn: 'Analytics', labelHi: 'एनालिटिक्स' },
  { href: '/leaderboard', labelEn: 'Leaderboard', labelHi: 'लीडरबोर्ड' },
]

export function TopNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [dashboardLocked, setDashboardLocked] = useState(false)
  const [marketsLocked, setMarketsLocked] = useState(false)
  const [predictorLocked, setPredictorLocked] = useState(false)

  // Check if dashboard, markets, or predictor game is locked
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Dashboard & Markets lock check: at least 1 case study completed
    const completed = localStorage.getItem(getUserScopedKey(user?.id, 'MM_CASE_STUDY_COMPLETED')) === 'true'
    setDashboardLocked(!completed)
    setMarketsLocked(!completed)

    // Predictor lock check: at least 3 stocks in portfolio
    api.portfolio()
      .then((data) => {
        const count = data?.holdings?.length || 0
        setPredictorLocked(count < 3)
      })
      .catch(() => {
        setPredictorLocked(true)
      })

    // Listen for storage changes
    const onStorage = () => {
      const nowCompleted = localStorage.getItem(getUserScopedKey(user?.id, 'MM_CASE_STUDY_COMPLETED')) === 'true'
      setDashboardLocked(!nowCompleted)
      setMarketsLocked(!nowCompleted)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [pathname, user?.id])

  const initials = user
    ? (user.first_name?.[0] || user.username[0]).toUpperCase() + (user.last_name?.[0] || '').toUpperCase()
    : 'MM'

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <>
      <FinanceGlossaryModal isOpen={glossaryOpen} onClose={() => setGlossaryOpen(false)} />

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-1.5 px-2 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            <Logo />

            <nav className="hidden items-center gap-1 lg:flex">
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + '/')
                const isLocked =
                  (link.href === '/dashboard' && dashboardLocked) ||
                  (link.href === '/markets' && marketsLocked) ||
                  (link.href === '/predictor' && predictorLocked)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    id={link.href === '/case-studies' ? 'tour-nav-case-studies' : undefined}
                    className={cn(
                      'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 flex items-center gap-1',
                      active
                        ? 'bg-[#00B4D8]/15 text-[#00B4D8] font-bold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70',
                      isLocked && 'opacity-60',
                    )}
                  >
                    {isLocked && <Lock className="size-3" />}
                    {t(link.labelEn, link.labelHi)}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <LanguageToggle className="hidden sm:inline-flex" />
            <LanguageToggle variant="compact" className="sm:hidden" />

            <button
              className="hidden size-9 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors sm:flex"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
            </button>

            <Link
              href="/profile"
              className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50/80 p-1 pr-2 sm:pr-3 hover:bg-slate-100 hover:border-slate-300 transition-all shrink-0"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#00B4D8] to-[#0891b2] text-xs font-semibold text-white shadow-sm">
                {initials}
              </span>
              <span className="hidden text-sm font-medium text-slate-800 sm:inline">
                {user?.username || t('Profile', 'प्रोफाइल')}
              </span>
            </Link>

            {user && (
              <button
                onClick={handleLogout}
                className="hidden size-9 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors sm:flex"
                aria-label="Logout"
                title={t('Logout', 'लॉगआउट')}
              >
                <LogOut className="size-4" />
              </button>
            )}

            <button
              className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800 lg:hidden shrink-0"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="fixed inset-x-0 top-16 bottom-0 z-50 bg-slate-900/20 backdrop-blur-xs lg:hidden" onClick={() => setOpen(false)}>
            <nav
              className="flex flex-col gap-1 border-b border-slate-200/80 bg-white/95 backdrop-blur-2xl px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl animate-in slide-in-from-top-2 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + '/')
                const isLocked =
                  (link.href === '/dashboard' && dashboardLocked) ||
                  (link.href === '/markets' && marketsLocked) ||
                  (link.href === '/predictor' && predictorLocked)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all flex items-center justify-between',
                      active
                        ? 'bg-[#00B4D8]/15 text-[#00B4D8] font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100/80',
                      isLocked && 'opacity-60',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {isLocked && <Lock className="size-4 text-slate-400" />}
                      {t(link.labelEn, link.labelHi)}
                    </span>
                    {active && <span className="size-2 rounded-full bg-[#00B4D8]" />}
                  </Link>
                )
              })}
              {user && (
                <div className="mt-2 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#00B4D8] to-[#0891b2] text-xs font-semibold text-white">
                      {initials}
                    </span>
                    <span>{user.username || t('Profile', 'प्रोफाइल')}</span>
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false)
                      handleLogout()
                    }}
                    className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 text-left transition-colors"
                  >
                    <LogOut className="size-4" />
                    <span>{t('Logout', 'लॉगआउट')}</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}

