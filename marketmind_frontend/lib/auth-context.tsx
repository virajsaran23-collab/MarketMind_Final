'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'

type User = { id: number; username: string; email: string; first_name: string; last_name: string }
type Profile = {
  badge: string
  learning_score: number
  risk_score: number
  simulations_completed: number
  portfolio_value: number
  cash: number
  global_rank: number
  accuracy: number
  bonus_tokens: number
}

type Toast = { id: string; title: string; desc: string; type?: 'success' | 'info' }

type AuthCtx = {
  user: User | null
  profile: Profile | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  showToast: (title: string, desc: string, type?: 'success' | 'info') => void
}

const AuthContext = createContext<AuthCtx | null>(null)

export function checkChallengeCompletions(userChallenges: any[], showToast: (title: string, desc: string) => void) {
  if (!userChallenges || !Array.isArray(userChallenges)) return

  const saved = typeof window !== 'undefined' ? localStorage.getItem('MM_COMPLETED_CHALLENGES') : null
  
  const currentCompletedSlugs = userChallenges
    .filter((uc) => uc.status === 'complete' || uc.status === 'done')
    .map((uc) => uc.challenge?.slug)
    .filter(Boolean)

  if (saved === null) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('MM_COMPLETED_CHALLENGES', JSON.stringify(currentCompletedSlugs))
    }
    return
  }

  const completedSlugs = JSON.parse(saved)
  const newlyCompletedSlugs: string[] = []

  userChallenges.forEach((uc) => {
    const isCompleted = uc.status === 'complete' || uc.status === 'done'
    const slug = uc.challenge?.slug
    if (isCompleted && slug) {
      if (!completedSlugs.includes(slug)) {
        newlyCompletedSlugs.push(slug)
        showToast(
          uc.challenge.category === 'daily' ? 'Daily Task Completed! 🎉' : 'Achievement Unlocked! 🏆',
          `${uc.challenge.name} (+${uc.challenge.token_reward} tokens)`
        )
      }
    }
  })

  if (typeof window !== 'undefined') {
    if (newlyCompletedSlugs.length > 0) {
      localStorage.setItem(
        'MM_COMPLETED_CHALLENGES',
        JSON.stringify([...completedSlugs, ...newlyCompletedSlugs])
      )
    } else if (currentCompletedSlugs.length !== completedSlugs.length) {
      localStorage.setItem('MM_COMPLETED_CHALLENGES', JSON.stringify(currentCompletedSlugs))
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((title: string, desc: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((t) => [...t, { id, title, desc, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((item) => item.id !== id))
    }, 5000)
  }, [])

  const refresh = async () => {
    try {
      const data = await api.me()
      setUser(data.user)
      setProfile(data.profile)
    } catch {
      setUser(null)
      setProfile(null)
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    const data = await api.login(username, password)
    setUser(data.user)
    setProfile(data.profile)
  }

  const logout = async () => {
    await api.logout()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, refresh, showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xl animate-in slide-in-from-bottom duration-300"
          >
            <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
            <div className="flex-1">
              <h5 className="font-semibold text-sm text-foreground">{toast.title}</h5>
              <p className="text-xs text-muted-foreground mt-0.5">{toast.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
