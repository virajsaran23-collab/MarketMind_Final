'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { MarketsExplorer } from '@/components/marketmind/markets-explorer'
import { api } from '@/lib/api'

export default function MarketsPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<string>('All')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchAssets = useCallback((category?: string, search?: string, showSkeleton = false) => {
    if (showSkeleton) {
      setIsLoading(true)
    }
    api.assets(category, search)
      .then(setAssets)
      .catch(() => {})
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Initial load
  useEffect(() => {
    fetchAssets(filter, '', true)
  }, [filter, fetchAssets])

  // Polling in background
  useEffect(() => {
    const iv = setInterval(() => fetchAssets(filter, query, false), 30000)
    return () => clearInterval(iv)
  }, [fetchAssets, filter, query])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchAssets(filter, query, true)
    }, query ? 400 : 0)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, filter, fetchAssets])

  return (
    <MarketsExplorer
      assets={assets}
      isLoading={isLoading}
      onRefresh={() => fetchAssets(filter, query, true)}
      query={query}
      onQueryChange={setQuery}
      filter={filter}
      onFilterChange={setFilter}
    />
  )
}
