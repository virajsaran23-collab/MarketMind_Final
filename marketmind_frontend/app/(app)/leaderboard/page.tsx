'use client'

import { useEffect, useState } from 'react'
import { Trophy, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/market-data'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const BADGE_COLOR: Record<string, string> = {
  'Market Legend': 'bg-yellow-500/15 text-yellow-400',
  'Risk Master': 'bg-purple-500/15 text-purple-400',
  'Trend Hunter': 'bg-blue-500/15 text-blue-400',
  'Value Investor': 'bg-green-500/15 text-green-400',
  'Market Rookie': 'bg-secondary text-muted-foreground',
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()

  const fetchLeaderboard = () => {
    setLoading(true)
    api.leaderboard()
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const hasCurrentUser = user ? rows.some((row) => row.handle === `@${user.username}`) : false

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="size-6 text-yellow-400" />
          <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
          {rows.length > 0 && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {rows.length} trader{rows.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('size-3', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading && rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading leaderboard…</div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No leaderboard entries yet. Make a trade to appear here.
            </div>
          ) : (
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Rank</th>
                  <th className="px-5 py-3 font-medium">Trader</th>
                  <th className="px-5 py-3 text-right font-medium">Portfolio</th>
                  <th className="px-5 py-3 text-right font-medium">Tokens</th>
                  <th className="px-5 py-3 text-right font-medium">Score</th>
                  <th className="px-5 py-3 text-right font-medium">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isYou = user && row.handle === `@${user.username}`
                  const portfolioChange = row.portfolio - 100000
                  const portfolioChangeSign = portfolioChange >= 0 ? '+' : ''
                  return (
                    <tr
                      key={row.handle}
                      className={cn(
                        'border-b border-border last:border-0 transition-colors',
                        isYou ? 'bg-primary/5' : 'hover:bg-secondary/50',
                      )}
                    >
                      <td className="px-5 py-4 font-semibold tabular-nums text-muted-foreground">
                        {row.rank <= 3 ? ['🥇', '🥈', '🥉'][row.rank - 1] : `#${row.rank}`}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-xs font-semibold">
                            {row.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <div className="font-medium">{isYou ? 'You' : row.name}</div>
                            <div className="text-xs text-muted-foreground">{row.handle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">
                        <div className="font-medium">{formatCurrency(row.portfolio, true)}</div>
                        <div className={cn('text-xs', portfolioChange >= 0 ? 'text-success' : 'text-destructive')}>
                          {portfolioChangeSign}{formatCurrency(portfolioChange, true)}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums font-medium">{row.token_count}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="tabular-nums font-medium">{row.learning_score.toLocaleString()}</span>
                          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', BADGE_COLOR[row.badge] ?? 'bg-secondary text-muted-foreground')}>
                            {row.badge}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={cn(
                            'tabular-nums font-medium',
                            row.accuracy >= 60 ? 'text-success' : row.accuracy >= 40 ? 'text-yellow-400' : 'text-muted-foreground',
                          )}
                        >
                          {row.accuracy}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {profile && !hasCurrentUser ? (
        <Card className="border border-border bg-secondary/40 p-4">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Your current rank</p>
              <p className="text-lg font-semibold text-foreground">#{profile.global_rank || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Trade accuracy</p>
              <p className="text-lg font-semibold text-foreground">{profile.accuracy ?? 0}%</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Score</p>
              <p className="text-lg font-semibold text-foreground">{profile.learning_score?.toLocaleString() ?? 0}</p>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
