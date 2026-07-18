'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { MarketsExplorer } from '@/components/marketmind/markets-explorer'
import { api } from '@/lib/api'

export default function MarketsPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<string>('All')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchAssets = useCallback((category?: string, search?: string) => {
    api.assets(category, search).then(setAssets).catch(() => {})
  }, [])

  // Initial load + polling (no search term)
  useEffect(() => {
    fetchAssets(filter, '')
    const iv = setInterval(() => fetchAssets(filter, query), 30000)
    return () => clearInterval(iv)
  }, [fetchAssets, filter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchAssets(filter, query)
    }, query ? 400 : 0)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, filter, fetchAssets])

  return (
    <MarketsExplorer
      assets={assets}
      onRefresh={() => fetchAssets(filter, query)}
      query={query}
      onQueryChange={setQuery}
      filter={filter}
      onFilterChange={setFilter}
    />
  )
}
