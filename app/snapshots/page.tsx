'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import { RawSnapshot } from '@/lib/types'

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
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'url'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    loadSnapshots()
  }, [])

  useEffect(() => {
    filterAndSortSnapshots()
  }, [snapshots, searchQuery, sortBy, sortOrder])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function loadSnapshots() {
    try {
      const response = await fetch('/api/snapshots')
      if (!response.ok) {
        console.error('Error loading snapshots:', response.statusText)
        return
      }
      const data = await response.json()
      setSnapshots(data || [])
    } catch (err) {
      console.error('Error:', err)
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

    if (diffMins < 60) return `hace ${diffMins}m`
    if (diffHours < 24) return `hace ${diffHours}h`
    if (diffDays < 7) return `hace ${diffDays}d`
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
    // Estimate based on URL length + title length (rough approximation)
    const baseSize = (snapshot.url?.length || 0) + (snapshot.title?.length || 0)
    if (baseSize < 100) return '~2 KB'
    if (baseSize < 500) return '~5 KB'
    return '~10 KB'
  }

  // Detail View
  if (selectedSnapshot) {
    const rawData = selectedSnapshot.raw_data
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSelectedSnapshot(null)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to catalog
            </button>
            <span className="text-sm text-slate-500">{formatDate(selectedSnapshot.created_at)}</span>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* Title Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">
                📸
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  {selectedSnapshot.title || 'Untitled'}
                </h1>
                <a
                  href={selectedSnapshot.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:text-violet-700 text-sm truncate block"
                >
                  {selectedSnapshot.url}
                </a>
              </div>
            </div>
          </div>

          {/* Screenshot Preview */}
          {rawData?.screenshot && (
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">🖼️</span>
                Screenshot
              </h2>
              <div className="rounded-lg overflow-hidden border bg-slate-100">
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
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="text-2xl font-bold text-violet-600">{rawData?.text?.length || 0}</div>
              <div className="text-sm text-slate-500">Text Elements</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="text-2xl font-bold text-indigo-600">{rawData?.ux?.length || 0}</div>
              <div className="text-sm text-slate-500">UX Events</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="text-2xl font-bold text-emerald-600">
                {rawData?.html ? Math.round(rawData.html.length / 1024) : 0} KB
              </div>
              <div className="text-sm text-slate-500">HTML Size</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="text-2xl font-bold text-amber-600">
                {rawData?.meta?.viewport?.width || '?'} × {rawData?.meta?.viewport?.height || '?'}
              </div>
              <div className="text-sm text-slate-500">Viewport</div>
            </div>
          </div>

          {/* Text Content */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">📝</span>
              Text Content
              <span className="text-sm font-normal text-slate-400">({rawData?.text?.length || 0} elements)</span>
            </h2>
            <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              {rawData?.text?.slice(0, 30).map((text, i) => (
                <div key={i} className="py-1 text-sm text-slate-600 border-b border-slate-100 last:border-0">
                  • {text}
                </div>
              ))}
              {(rawData?.text?.length || 0) > 30 && (
                <div className="py-2 text-sm text-slate-400 italic">
                  + {(rawData?.text?.length || 0) - 30} more elements...
                </div>
              )}
            </div>
          </div>

          {/* UX Events */}
          {rawData?.ux && rawData.ux.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">🎯</span>
                UX Events
                <span className="text-sm font-normal text-slate-400">({rawData.ux.length})</span>
              </h2>
              <div className="space-y-2">
                {rawData.ux.map((event, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded">
                      {event.type}
                    </span>
                    <span className="text-sm text-slate-600">{event.tag}</span>
                    {event.text && (
                      <span className="text-sm text-slate-400 truncate">{event.text}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw JSON */}
          <details className="bg-white rounded-xl shadow-sm border">
            <summary className="p-6 cursor-pointer text-lg font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">{ }</span>
              Raw Data
            </summary>
            <div className="px-6 pb-6">
              <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs overflow-x-auto">
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg">
                📸
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Snappy Catalog</h1>
                <p className="text-sm text-slate-500">{snapshots.length} snapshots</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadSnapshots}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by title or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg focus:ring-2 focus:ring-violet-500 focus:bg-white transition"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-slate-100 border-0 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="url">URL</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                title={viewMode === 'grid' ? 'Grid view' : 'List view'}
              >
                {viewMode === 'grid' ? '▦' : '☰'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500">Loading snapshots...</p>
          </div>
        ) : filteredSnapshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-4">
              📸
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              {searchQuery ? 'No matches found' : 'No snapshots yet'}
            </h2>
            <p className="text-slate-500 text-center max-w-md">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Use the Chrome extension to capture your first snapshot'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSnapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                onClick={() => loadSnapshotDetail(snapshot.id)}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md hover:border-violet-300 cursor-pointer transition group"
              >
                {/* Thumbnail placeholder */}
                <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-50 rounded-t-xl flex items-center justify-center border-b">
                  <div className="text-4xl opacity-50 group-hover:scale-110 transition">🌐</div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 truncate mb-1 group-hover:text-violet-600 transition">
                    {snapshot.title || 'Untitled'}
                  </h3>
                  <p className="text-sm text-slate-500 truncate mb-3">{getDomain(snapshot.url)}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{formatRelativeDate(snapshot.created_at)}</span>
                    <span>{estimateSize(snapshot)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl shadow-sm border divide-y">
            {filteredSnapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                onClick={() => loadSnapshotDetail(snapshot.id)}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer transition"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                  🌐
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {snapshot.title || 'Untitled'}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">{snapshot.url}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-slate-600">{formatRelativeDate(snapshot.created_at)}</div>
                  <div className="text-xs text-slate-400">{estimateSize(snapshot)}</div>
                </div>
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
