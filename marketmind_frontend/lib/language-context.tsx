'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Language = 'en' | 'hi'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (enOrKey: string, hiText?: string) => string
}

const dictionary: Record<string, { en: string; hi: string }> = {
  // Navigation
  Dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  Portfolio: { en: 'Portfolio', hi: 'पोर्टफोलियो' },
  Markets: { en: 'Markets', hi: 'मार्केट्स' },
  'AI Analyzer': { en: 'AI Analyzer', hi: 'AI विश्लेषक' },
  'Case Studies': { en: 'Case Studies', hi: 'केस स्टडीज़' },
  Analytics: { en: 'Analytics', hi: 'एनालिटिक्स' },
  Leaderboard: { en: 'Leaderboard', hi: 'लीडरबोर्ड' },
  Profile: { en: 'Profile', hi: 'प्रोफाइल' },
  Logout: { en: 'Logout', hi: 'लॉगआउट' },
  'Sign in': { en: 'Sign in', hi: 'साइन इन करें' },
  'Get started': { en: 'Get started', hi: 'शुरू करें' },
  'Go to Dashboard': { en: 'Go to Dashboard', hi: 'डैशबोर्ड पर जाएं' },

  // General Actions
  Buy: { en: 'Buy', hi: 'खरीदें' },
  Sell: { en: 'Sell', hi: 'बेचें' },
  Cancel: { en: 'Cancel', hi: 'रद्द करें' },
  Confirm: { en: 'Confirm', hi: 'पुष्टि करें' },
  Search: { en: 'Search', hi: 'खोजें' },
  Save: { en: 'Save', hi: 'सहेजें' },
  Close: { en: 'Close', hi: 'बंद करें' },
  Submit: { en: 'Submit', hi: 'जमा करें' },
  Loading: { en: 'Loading...', hi: 'लोड हो रहा है...' },
  Success: { en: 'Success', hi: 'सफलता' },
  Error: { en: 'Error', hi: 'त्रुटि' },

  // Common Headers & Labels
  'Total Portfolio Value': { en: 'Total Portfolio Value', hi: 'कुल पोर्टफोलियो मूल्य' },
  'Available Cash': { en: 'Available Cash', hi: 'उपलब्ध नकदी' },
  'Total Returns': { en: 'Total Returns', hi: 'कुल रिटर्न' },
  'Day Change': { en: 'Day Change', hi: 'आज का बदलाव' },
  'Market Overview': { en: 'Market Overview', hi: 'बाजार अवलोकन' },
  'Recent Activity': { en: 'Recent Activity', hi: 'हाल की गतिविधि' },
  'Quick Trade': { en: 'Quick Trade', hi: 'त्वरित व्यापार' },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('marketmind_lang') as Language
      if (savedLang === 'en' || savedLang === 'hi') {
        setLanguageState(savedLang)
      }
    } catch {
      // localStorage unavailable or blocked
    }
    setIsInitialized(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('marketmind_lang', lang)
    } catch {
      // localStorage error
    }
  }

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en'
    setLanguage(nextLang)
  }

  const t = (enOrKey: string, hiText?: string): string => {
    // If explicit Hindi translation is provided directly as second argument
    if (hiText !== undefined) {
      return language === 'hi' ? hiText : enOrKey
    }

    // Otherwise check dictionary
    if (dictionary[enOrKey]) {
      return dictionary[enOrKey][language] || enOrKey
    }

    // Fallback if not in dictionary and no explicit hiText provided
    return enOrKey
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
