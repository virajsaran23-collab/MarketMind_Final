'use client'

import Link from 'next/link'
import { Logo } from './logo'
import { buttonVariants } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { LanguageToggle } from './language-toggle'
import { cn } from '@/lib/utils'

export function LandingHeader() {
  const { user } = useAuth()
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-40 border-b border-border glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          {user ? (
            <Link href="/dashboard" className={cn(buttonVariants(), 'h-9 px-4 text-sm')}>
              {t('Go to Dashboard', 'डैशबोर्ड पर जाएं')}
            </Link>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: 'ghost' }), 'h-9 px-4 text-sm')}>
                {t('Sign in', 'साइन इन करें')}
              </Link>
              <Link href="/login" className={cn(buttonVariants(), 'h-9 px-4 text-sm')}>
                {t('Get started', 'शुरू करें')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
