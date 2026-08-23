'use client'

import Link from 'next/link'
import { Logo } from './logo'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { LanguageToggle } from './language-toggle'

export function LandingHeader() {
  const { user } = useAuth()
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-1.5 px-2.5 sm:px-6">
        <Logo className="shrink-0" />
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <LanguageToggle className="px-1.5 sm:px-3 text-[11px] sm:text-xs" />
          {user ? (
            <Link
              href="/dashboard"
              className="h-8 sm:h-9 px-2.5 sm:px-4 text-xs sm:text-sm font-semibold flex items-center justify-center rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all whitespace-nowrap shrink-0"
            >
              {t('Go to Dashboard', 'डैशबोर्ड पर जाएं')}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="h-8 sm:h-9 px-2 sm:px-3.5 text-xs sm:text-sm font-medium flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap shrink-0"
              >
                {t('Sign in', 'साइन इन')}
              </Link>
              <Link
                href="/login"
                className="h-8 sm:h-9 px-2.5 sm:px-4 text-xs sm:text-sm font-semibold flex items-center justify-center rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all whitespace-nowrap shrink-0"
              >
                {t('Get started', 'शुरू करें')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}


