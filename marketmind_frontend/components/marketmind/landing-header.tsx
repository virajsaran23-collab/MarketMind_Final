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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          {user ? (
            <Link
              href="/dashboard"
              className="h-9 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all"
            >
              {t('Go to Dashboard', 'डैशबोर्ड पर जाएं')}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="h-9 px-3.5 text-xs sm:text-sm font-medium flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all"
              >
                {t('Sign in', 'साइन इन करें')}
              </Link>
              <Link
                href="/login"
                className="h-9 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#0891b2] text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all"
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


