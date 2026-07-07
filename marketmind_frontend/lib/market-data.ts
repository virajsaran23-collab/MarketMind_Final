export type Trend = number[]

export type Asset = {
  id: string
  symbol: string
  name: string
  category: 'Stocks' | 'Industries' | 'Commodities'
  price: number
  change: number
  marketCap?: string
  spark?: Trend
  sector?: string
}

export type SeriesPoint = { label: string; value: number }

export type CaseStudy = {
  id: string
  title: string
  description: string
  long_description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  read_time: string
  image: string
  tags: string[]
}

export type LeaderRow = {
  rank: number
  name: string
  handle: string
  portfolio: number
  learning_score: number
  badge: 'Market Rookie' | 'Value Investor' | 'Trend Hunter' | 'Risk Master' | 'Market Legend'
  accuracy: number
  token_count: number
}

export type SimSector = { name: string; change: number }

export const simSectors: SimSector[] = [
  { name: 'Energy', change: 12.4 },
  { name: 'Defense', change: 8.7 },
  { name: 'Technology', change: -4.2 },
  { name: 'Consumer', change: -6.1 },
  { name: 'Healthcare', change: 2.3 },
]

export const simSeries: Record<string, SeriesPoint[]> = {
  'Day 1': [
    { label: '9:30', value: 100 },
    { label: '11:00', value: 98 },
    { label: '12:30', value: 95 },
    { label: '14:00', value: 97 },
    { label: '15:30', value: 93 },
  ],
  'Week 1': [
    { label: 'Mon', value: 100 },
    { label: 'Tue', value: 94 },
    { label: 'Wed', value: 91 },
    { label: 'Thu', value: 96 },
    { label: 'Fri', value: 103 },
  ],
  'Month 1': [
    { label: 'W1', value: 100 },
    { label: 'W2', value: 92 },
    { label: 'W3', value: 105 },
    { label: 'W4', value: 118 },
  ],
  'Year 1': [
    { label: 'Q1', value: 100 },
    { label: 'Q2', value: 88 },
    { label: 'Q3', value: 121 },
    { label: 'Q4', value: 142 },
  ],
}

export function formatCurrency(n: number, compact = false): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: compact ? 1 : 2,
    notation: compact ? 'compact' : 'standard',
  }).format(n)
}

export function formatPct(n: number): string {
  return `${n > 0 ? '+' : ''}${n.toFixed(2)}%`
}
