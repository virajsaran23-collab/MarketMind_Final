'use client'

import { Globe } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

interface LanguageToggleProps {
  className?: string
  variant?: 'pill' | 'compact' | 'full'
}

export function LanguageToggle({ className, variant = 'pill' }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage()

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          'flex h-9 items-center justify-center rounded-lg px-2.5 text-xs font-semibold tracking-wide transition-all border border-border bg-secondary/80 hover:bg-secondary hover:border-primary/50 text-foreground',
          className
        )}
        title={language === 'en' ? 'Switch to Hindi (हिंदी में बदलें)' : 'Switch to English'}
        aria-label="Toggle language"
      >
        <Globe className="mr-1.5 size-4 text-primary" />
        <span>{language === 'en' ? 'HI' : 'EN'}</span>
      </button>
    )
  }

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        'group relative inline-flex h-9 items-center justify-between gap-1.5 rounded-full border border-border/80 bg-secondary/60 px-3 py-1 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/40',
        className
      )}
      title={language === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English (अंग्रेज़ी)'}
      aria-label="Toggle language between English and Hindi"
    >
      <Globe className="size-4 text-primary transition-transform duration-300 group-hover:rotate-12" />
      <div className="flex items-center gap-1">
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[11px] font-semibold transition-all',
            language === 'en'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground group-hover:text-foreground'
          )}
        >
          EN
        </span>
        <span className="text-muted-foreground/50">|</span>
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[11px] font-semibold transition-all',
            language === 'hi'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground group-hover:text-foreground'
          )}
        >
          हिन्दी
        </span>
      </div>
    </button>
  )
}
