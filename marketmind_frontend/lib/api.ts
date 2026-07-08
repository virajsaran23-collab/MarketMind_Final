const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    const message = typeof err.error === 'string'
      ? err.error
      : err.error
        ? JSON.stringify(err.error)
        : res.statusText
    throw new Error(message)
  }
  return res.json()
}

export const api = {
  register: (data: { username: string; email: string; password: string; first_name?: string; last_name?: string }) =>
    request('/auth/register/', { method: 'POST', body: JSON.stringify(data) }),

  login: (username: string, password: string) =>
    request('/auth/login/', { method: 'POST', body: JSON.stringify({ username, password }) }),

  logout: () => request('/auth/logout/', { method: 'POST' }),

  me: () => request('/auth/me/'),

  assets: (category?: string, search?: string) => {
    const params = new URLSearchParams()
    if (category && category !== 'All') params.set('category', category)
    if (search) params.set('search', search)
    const qs = params.toString()
    return request(`/assets/${qs ? `?${qs}` : ''}`)
  },

  asset: (id: string) => request(`/assets/${id}/`),

  assetCandles: (id: string, days = 30) => request(`/assets/${id}/candles/?days=${days}`),

  portfolio: () => request('/portfolio/'),

  portfolioHistory: (range: '1D' | '1W' | '1M' | '1Y' = '1M') =>
    request(`/portfolio/history/?range=${range}`),

  trade: (asset_id: string, mode: 'buy' | 'sell', shares: number) =>
    request('/trade/', { method: 'POST', body: JSON.stringify({ asset_id, mode, shares }) }),

  trades: () => request('/trades/'),

  caseStudies: () => request('/case-studies/'),

  caseStudy: (id: string) => request(`/case-studies/${id}/`),

  leaderboard: () => request('/leaderboard/'),

  analytics: () => request('/analytics/'),

  challenges: () => request('/challenges/'),

  completeSimulation: (score: number) =>
    request('/simulation/complete/', { method: 'POST', body: JSON.stringify({ score }) }),

  mentor: (message = '', symbols: string[] = []) =>
    request('/mentor/', {
      method: 'POST',
      body: JSON.stringify({ message, symbols }),
    }),
}
