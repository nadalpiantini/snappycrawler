'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import { RawSnapshot } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/Header'

interface SnapshotItem {
  id: string
  url: string
  title: string
  created_at: string
  raw_data?: RawSnapshot
}

export default function SnapshotsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [snapshots, setSnapshots] = useState<SnapshotItem[]>([])
  const [filteredSnapshots, setFilteredSnapshots] = useState<SnapshotItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'url'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  type SortOption = 'date' | 'title' | 'url'

  useEffect(() => {
    loadSnapshots()
  }, [])

  useEffect(() => {
    filterAndSortSnapshots()
  }, [snapshots, searchQuery, sortBy, sortOrder])

  async function loadSnapshots() {
    setError(null)
    try {
      const response = await fetch('/api/snapshots')
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to load snapshots')
      }
      const data = await response.json()
      setSnapshots(data || [])
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function loadSnapshotDetail(id: string) {
    try {
      const response = await fetch(`/api/snapshots?id=${id}`)
      if (!response.ok) {
        console.error('Error loading snapshot:', response.statusText)
        return
      }
      const data = await response.json()
      setSelectedSnapshot(data)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  function filterAndSortSnapshots() {
    let filtered = [...snapshots]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s =>
        s.title?.toLowerCase().includes(query) ||
        s.url?.toLowerCase().includes(query)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '')
          break
        case 'url':
          comparison = a.url.localeCompare(b.url)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredSnapshots(filtered)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  function formatRelativeDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  }

  function getDomain(url: string) {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  function estimateSize(snapshot: SnapshotItem) {
    const baseSize = (snapshot.url?.length || 0) + (snapshot.title?.length || 0)
    if (baseSize < 100) return '~2 KB'
    if (baseSize < 500) return '~5 KB'
    return '~10 KB'
  }

  // Detail View
  if (selectedSnapshot) {
    const rawData = selectedSnapshot.raw_data
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSelectedSnapshot(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to catalog
            </button>
            <span className="text-sm text-muted-foreground">{formatDate(selectedSnapshot.created_at)}</span>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* Title Section */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Snappy"
                  width={32}
                  height={32}
                  className="rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {selectedSnapshot.title || 'Untitled'}
                </h1>
                <a
                  href={selectedSnapshot.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 text-sm truncate block"
                >
                  {selectedSnapshot.url}
                </a>
              </div>
            </div>
          </div>

          {/* Screenshot Preview */}
          {rawData?.screenshot && (
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">🖼️</span>
                Screenshot
              </h2>
              <div className="rounded-lg overflow-hidden border border-border bg-background">
                <img
                  src={rawData.screenshot}
                  alt={`Screenshot of ${selectedSnapshot.title}`}
                  className="w-full h-auto max-h-[500px] object-contain"
                />
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl shadow-sm border border-border p-4">
              <div className="text-2xl font-bold text-primary">{rawData?.text?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Text Elements</div>
            </div>
            <div className="bg-card rounded-xl shadow-sm border border-border p-4">
              <div className="text-2xl font-bold text-secondary">{rawData?.ux?.length || 0}</div>
              <div className="text-sm text-muted-foreground">UX Events</div>
            </div>
            <div className="bg-card rounded-xl shadow-sm border border-border p-4">
              <div className="text-2xl font-bold text-primary">
                {rawData?.html ? Math.round(rawData.html.length / 1024) : 0} KB
              </div>
              <div className="text-sm text-muted-foreground">HTML Size</div>
            </div>
            <div className="bg-card rounded-xl shadow-sm border border-border p-4">
              <div className="text-2xl font-bold text-secondary">
                {rawData?.meta?.viewport?.width || '?'} × {rawData?.meta?.viewport?.height || '?'}
              </div>
              <div className="text-sm text-muted-foreground">Viewport</div>
            </div>
          </div>

          {/* Text Content */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">📝</span>
              Text Content
              <span className="text-sm font-normal text-muted-foreground">({rawData?.text?.length || 0} elements)</span>
            </h2>
            <div className="bg-background rounded-lg p-4 max-h-64 overflow-y-auto border border-border">
              {rawData?.text?.slice(0, 30).map((text, i) => (
                <div key={i} className="py-1 text-sm text-muted-foreground border-b border-border last:border-0">
                  • {text}
                </div>
              ))}
              {(rawData?.text?.length || 0) > 30 && (
                <div className="py-2 text-sm text-muted-foreground/60 italic">
                  + {(rawData?.text?.length || 0) - 30} more elements...
                </div>
              )}
            </div>
          </div>

          {/* UX Events */}
          {rawData?.ux && rawData.ux.length > 0 && (
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center text-secondary">🎯</span>
                UX Events
                <span className="text-sm font-normal text-muted-foreground">({rawData.ux.length})</span>
              </h2>
              <div className="space-y-2">
                {rawData.ux.map((event, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded">
                      {event.type}
                    </span>
                    <span className="text-sm text-foreground">{event.tag}</span>
                    {event.text && (
                      <span className="text-sm text-muted-foreground truncate">{event.text}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw JSON */}
          <details className="bg-card rounded-xl shadow-sm border border-border">
            <summary className="p-6 cursor-pointer text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">{ }</span>
              Raw Data
            </summary>
            <div className="px-6 pb-6">
              <pre className="bg-background text-foreground rounded-lg p-4 text-xs overflow-x-auto border border-border">
                {JSON.stringify({
                  url: selectedSnapshot.url,
                  title: selectedSnapshot.title,
                  created_at: selectedSnapshot.created_at,
                  textCount: rawData?.text?.length || 0,
                  uxEventsCount: rawData?.ux?.length || 0,
                  htmlSize: rawData?.html ? `${Math.round(rawData.html.length / 1024)} KB` : 'N/A',
                  viewport: rawData?.meta?.viewport || null
                }, null, 2)}
              </pre>
            </div>
          </details>
        </main>
      </div>
    )
  }

  // Catalog View
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header variant="app" />

      {/* Catalog Title & Controls */}
      <div className="bg-card border-b border-border sticky top-[73px] z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold text-foreground">Snappy Catalog</h1>
                <p className="text-sm text-muted-foreground">{snapshots.length} snapshots</p>
              </div>
            </div>
            <button
              onClick={loadSnapshots}
              className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Refresh"
              aria-label="Refresh snapshots"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by title or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-sm text-foreground"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="url">URL</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-3 bg-background border border-border hover:bg-muted rounded-lg transition text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-3 bg-background border border-border hover:bg-muted rounded-lg transition text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
                title={viewMode === 'grid' ? 'Grid view' : 'List view'}
                aria-label={viewMode === 'grid' ? 'Switch to grid view' : 'Switch to list view'}
              >
                {viewMode === 'grid' ? '▦' : '☰'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading snapshots...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-3xl mb-4">
              ⚠️
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {error}
            </p>
            <button
              onClick={loadSnapshots}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              Try Again
            </button>
          </div>
        ) : filteredSnapshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Image
              src="/images/logo.png"
              alt="Snappy"
              width={80}
              height={80}
              className="rounded-xl mb-4 opacity-50"
            />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'No matches found' : 'No snapshots yet'}
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Use the Chrome extension to capture your first snapshot'}
            </p>
            {!searchQuery && (
              <a
                href="/snappy-extension.zip"
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Extension
              </a>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSnapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                onClick={() => loadSnapshotDetail(snapshot.id)}
                className="bg-card rounded-xl shadow-sm border border-border hover:shadow-md hover:border-primary/30 cursor-pointer transition group"
              >
                {/* Thumbnail placeholder */}
                <div className="h-32 bg-muted rounded-t-xl flex items-center justify-center border-b border-border">
                  <div className="text-4xl opacity-50 group-hover:scale-110 transition">🌐</div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground truncate mb-1 group-hover:text-primary transition">
                    {snapshot.title || 'Untitled'}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate mb-3">{getDomain(snapshot.url)}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground/60">
                    <span>{formatRelativeDate(snapshot.created_at)}</span>
                    <span>{estimateSize(snapshot)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-card rounded-xl shadow-sm border border-border divide-y divide-border">
            {filteredSnapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                onClick={() => loadSnapshotDetail(snapshot.id)}
                className="flex items-center gap-4 p-4 hover:bg-muted cursor-pointer transition"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                  🌐
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {snapshot.title || 'Untitled'}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">{snapshot.url}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-muted-foreground">{formatRelativeDate(snapshot.created_at)}</div>
                  <div className="text-xs text-muted-foreground/60">{estimateSize(snapshot)}</div>
                </div>
                <svg className="w-5 h-5 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
