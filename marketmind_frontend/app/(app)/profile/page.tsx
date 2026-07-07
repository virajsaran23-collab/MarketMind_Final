'use client'

import { Brain, Target, Flame, Trophy, BookOpen, ShieldAlert, TrendingUp, CheckCircle2 } from 'lucide-react'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/marketmind/progress-ring'
import { formatCurrency } from '@/lib/market-data'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const earnedBadges = [
  { name: 'Value Investor', desc: 'Held quality assets through volatility', icon: BookOpen },
  { name: 'Trend Hunter', desc: 'Caught 3 momentum moves early', icon: Flame },
  { name: 'Event Strategist', desc: 'Positioned ahead of a major event', icon: Target },
]

function getRiskLabel(score: number) {
  if (score >= 75) return { label: 'High Risk', color: 'text-destructive' }
  if (score >= 50) return { label: 'Moderate Risk', color: 'text-yellow-400' }
  if (score >= 25) return { label: 'Low-Moderate', color: 'text-blue-400' }
  return { label: 'Conservative', color: 'text-success' }
}

export default function ProfilePage() {
  const { user, profile, refresh: refreshAuth } = useAuth()
  const [challenges, setChallenges] = useState<any[]>([])
  const [loadingChallenges, setLoadingChallenges] = useState(true)
  const [riskScore, setRiskScore] = useState<number>(profile?.risk_score ?? 30)
  const [accuracy, setAccuracy] = useState<number>(profile?.accuracy ?? 0)

  const fetchChallenges = useCallback(async () => {
    try {
      const data = await api.challenges()
      setChallenges(data.challenges || [])
      if (typeof data.risk_score === 'number') setRiskScore(data.risk_score)
      if (typeof data.accuracy === 'number') setAccuracy(data.accuracy)
    } catch {
      setChallenges([])
    } finally {
      setLoadingChallenges(false)
    }
  }, [])

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  // Keep risk/accuracy in sync with auth profile
  useEffect(() => {
    if (profile?.risk_score !== undefined) setRiskScore(profile.risk_score)
    if (profile?.accuracy !== undefined) setAccuracy(profile.accuracy)
  }, [profile?.risk_score, profile?.accuracy])

  const achievementTasks = useMemo(
    () => challenges.filter((item) => item.challenge.category === 'achievement'),
    [challenges],
  )

  const dailyTasks = useMemo(
    () => challenges.filter((item) => item.challenge.category === 'daily'),
    [challenges],
  )

  const initials = user
    ? (user.first_name?.[0] || user.username[0]).toUpperCase() + (user.last_name?.[0] || '').toUpperCase()
    : 'YO'

  const displayName = user ? (user.first_name ? `${user.first_name} ${user.last_name}`.trim() : user.username) : 'Your Account'
  const handle = user ? `@${user.username}` : '@you'
  const riskInfo = getRiskLabel(riskScore)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="mb-6 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/30 to-[#38bdf8]/20" />
        <CardContent className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <span className="flex size-20 items-center justify-center rounded-2xl border-4 border-card bg-primary text-2xl font-semibold text-primary-foreground">
              {initials}
            </span>
            <div className="pb-1">
              <h1 className="text-xl font-semibold">{displayName}</h1>
              <p className="text-sm text-muted-foreground">{handle} · Joined 2026</p>
            </div>
          </div>
          <Badge variant="default" className="self-start sm:self-auto">{profile?.badge || 'Market Rookie'}</Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Account snapshot</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Portfolio</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrency(profile?.portfolio_value || 0, true)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Simulations</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{profile?.simulations_completed || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Learning score</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{(profile?.learning_score || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Global rank</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">#{profile?.global_rank || '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Portfolio accuracy</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-2 py-2">
            <ProgressRing
              value={accuracy}
              label={`${accuracy}%`}
              sublabel="profitable trades ratio"
              color="var(--chart-2)"
            />
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Brain className="size-4" />Based on your trade P&amp;L history
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Score Card */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5" />
              Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex flex-col items-center gap-1">
                <span className={cn('text-4xl font-bold tabular-nums', riskInfo.color)}>{riskScore}</span>
                <span className={cn('text-sm font-medium', riskInfo.color)}>{riskInfo.label}</span>
                <span className="text-xs text-muted-foreground">out of 100</span>
              </div>
              <div className="flex-1">
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      riskScore >= 75 ? 'bg-destructive' : riskScore >= 50 ? 'bg-yellow-400' : riskScore >= 25 ? 'bg-blue-400' : 'bg-success',
                    )}
                    style={{ width: `${riskScore}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                  <div className="flex items-center gap-1"><span className="size-2 rounded-full bg-success inline-block" />Conservative (0–24)</div>
                  <div className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-400 inline-block" />Low-Moderate (25–49)</div>
                  <div className="flex items-center gap-1"><span className="size-2 rounded-full bg-yellow-400 inline-block" />Moderate (50–74)</div>
                  <div className="flex items-center gap-1"><span className="size-2 rounded-full bg-destructive inline-block" />High Risk (75–100)</div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Calculated from portfolio concentration, diversification, trading frequency, and cash buffer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Badges earned</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {earnedBadges.map((b) => (
              <div key={b.name} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
                  <b.icon className="size-5 text-primary" />
                </span>
                <div>
                  <p className="text-sm font-medium">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active tasks</span>
              <button
                onClick={fetchChallenges}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Refresh
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingChallenges ? (
              <div className="text-sm text-muted-foreground">Loading tasks…</div>
            ) : challenges.length === 0 ? (
              <div className="text-sm text-muted-foreground">No active tasks yet. Complete a trade to unlock daily goals.</div>
            ) : (
              <>
                {/* Daily tasks section */}
                {dailyTasks.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Daily</p>
                    <div className="space-y-2">
                      {dailyTasks.map((item) => {
                        const { challenge, status, progress } = item
                        const completed = status === 'complete'
                        const progressLabel = `${Math.min(progress, challenge.target_value)}/${challenge.target_value}`
                        return (
                          <div
                            key={`${challenge.slug}-${item.date || 'daily'}`}
                            className={cn(
                              'rounded-xl border p-3 transition-colors',
                              completed ? 'border-success/30 bg-success/5' : 'border-border bg-secondary/40',
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2">
                                {completed && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />}
                                <div>
                                  <p className="text-sm font-medium">{challenge.name}</p>
                                  <p className="text-xs text-muted-foreground">{challenge.description}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <Badge variant={completed ? 'secondary' : 'outline'}>
                                  {completed ? 'Complete' : 'Pending'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">+{challenge.token_reward} tokens</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Today's progress</span>
                                <span>{progressLabel}</span>
                              </div>
                              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                <div
                                  className={cn('h-full rounded-full transition-all duration-500', completed ? 'bg-success' : 'bg-primary')}
                                  style={{ width: `${Math.min(100, (progress / challenge.target_value) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Achievement tasks section */}
                {achievementTasks.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Achievements</p>
                    <div className="space-y-2">
                      {achievementTasks.map((item) => {
                        const { challenge, status, progress } = item
                        const completed = status === 'complete'
                        const showProgress = challenge.target_value > 1
                        const progressLabel = showProgress ? `${Math.min(progress, challenge.target_value)}/${challenge.target_value}` : undefined

                        return (
                          <div
                            key={`${challenge.slug}-achievement`}
                            className={cn(
                              'rounded-xl border p-3 transition-colors',
                              completed ? 'border-success/30 bg-success/5' : 'border-border bg-secondary/40',
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2">
                                {completed && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />}
                                <div>
                                  <p className="text-sm font-medium">{challenge.name}</p>
                                  <p className="text-xs text-muted-foreground">{challenge.description}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <Badge variant={completed ? 'secondary' : 'outline'}>
                                  {completed ? 'Done' : 'Pending'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">+{challenge.token_reward} tokens</span>
                              </div>
                            </div>
                            {showProgress && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                  <span>Progress</span>
                                  <span>{progressLabel}</span>
                                </div>
                                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                  <div
                                    className={cn('h-full rounded-full transition-all duration-500', completed ? 'bg-success' : 'bg-primary')}
                                    style={{ width: `${Math.min(100, (progress / challenge.target_value) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
