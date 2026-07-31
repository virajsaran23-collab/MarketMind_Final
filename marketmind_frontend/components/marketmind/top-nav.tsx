'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Bell, LogOut } from 'lucide-react'
import { Logo } from './logo'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { LanguageToggle } from './language-toggle'

const links = [
  { href: '/dashboard', labelEn: 'Dashboard', labelHi: 'डैशबोर्ड' },
  { href: '/portfolio', labelEn: 'Portfolio', labelHi: 'पोर्टफोलियो' },
  { href: '/markets', labelEn: 'Markets', labelHi: 'मार्केट्स' },
  { href: '/ai-analyzer', labelEn: 'AI Analyzer', labelHi: 'AI विश्लेषक' },
  { href: '/case-studies', labelEn: 'Case Studies', labelHi: 'केस स्टडीज़' },
  { href: '/analytics', labelEn: 'Analytics', labelHi: 'एनालिटिक्स' },
  { href: '/market-math', labelEn: 'Market Math', labelHi: 'मार्केट गणित' },
  { href: '/leaderboard', labelEn: 'Leaderboard', labelHi: 'लीडरबोर्ड' },
]

export function TopNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const initials = user
    ? (user.first_name?.[0] || user.username[0]).toUpperCase() + (user.last_name?.[0] || '').toUpperCase()
    : 'MM'

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  id={link.href === '/case-studies' ? 'tour-nav-case-studies' : undefined}
                  className={cn(
                    'rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-[#00B4D8]/10 text-[#00B4D8] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70',
                  )}
                >
                  {t(link.labelEn, link.labelHi)}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />

          <button
            className="hidden size-9 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors sm:flex"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
          </button>

          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 py-1 pl-1 pr-3 hover:bg-slate-100 hover:border-slate-300 transition-all"
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
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 py-3 lg:hidden">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#00B4D8]/10 text-[#00B4D8] font-semibold'
                    : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                {t(link.labelEn, link.labelHi)}
              </Link>
            )
          })}
          {user && (
            <button
              onClick={handleLogout}
              className="rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 text-left"
            >
              {t('Logout', 'लॉगआउट')}
            </button>
          )}
        </nav>
      )}
    </header>
  )
}


