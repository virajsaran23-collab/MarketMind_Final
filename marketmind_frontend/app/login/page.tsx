'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/marketmind/logo'
import { LanguageToggle } from '@/components/marketmind/language-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { api } from '@/lib/api'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ username: '', password: '', email: '', first_name: '', last_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, refresh } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.username, form.password)
      } else {
        await api.register(form)
        await refresh()
      }
      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message || t('Something went wrong', 'कुछ गलत हो गया'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Link href="/"><Logo /></Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{mode === 'login' ? t('Sign in', 'साइन इन करें') : t('Create account', 'खाता बनाएं')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t('First name', 'पहला नाम')}</label>
                  <input value={form.first_name} onChange={(e) => set('first_name', e.target.value)} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t('Last name', 'अंतिम नाम')}</label>
                  <input value={form.last_name} onChange={(e) => set('last_name', e.target.value)} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
                </div>
              </div>
            )}
            {mode === 'register' && (
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{t('Email', 'ईमेल')}</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{t('Username', 'उपयोगकर्ता नाम')}</label>
              <input value={form.username} onChange={(e) => set('username', e.target.value)} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{t('Password', 'पासवर्ड')}</label>
              <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
              {loading ? t('Please wait...', 'कृपया प्रतीक्षा करें...') : mode === 'login' ? t('Sign in', 'साइन इन करें') : t('Create account', 'खाता बनाएं')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {mode === 'login' ? t("Don't have an account? ", 'खाता नहीं है? ') : t('Already have an account? ', 'पहले से ही खाता है? ')}
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} className="text-primary hover:underline font-medium">
                {mode === 'login' ? t('Sign up', 'साइन अप करें') : t('Sign in', 'साइन इन करें')}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
