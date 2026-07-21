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
    <header className="sticky top-0 z-40 border-b border-border glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
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
            className="hidden size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
          </button>
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-full border border-border bg-secondary py-1 pl-1 pr-3 transition-colors hover:border-primary/40"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </span>
            <span className="hidden text-sm font-medium sm:inline">{user?.username || t('Profile', 'प्रोफाइल')}</span>
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              className="hidden size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground sm:flex"
              aria-label="Logout"
              title={t('Logout', 'लॉगआउट')}
            >
              <LogOut className="size-4" />
            </button>
          )}
          <button
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 lg:hidden">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t(link.labelEn, link.labelHi)}
              </Link>
            )
          })}
          {user && (
            <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground text-left">
              {t('Logout', 'लॉगआउट')}
            </button>
          )}
        </nav>
      )}
    </header>
  )
}
