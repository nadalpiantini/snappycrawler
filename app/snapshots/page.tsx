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
  project_name?: string
  project_id?: string
}

interface ProjectGroup {
  project_id: string | null
  project_name: string
  snapshots: SnapshotItem[]
}

export default function SnapshotsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [snapshots, setSnapshots] = useState<SnapshotItem[]>([])
  const [filteredSnapshots, setFilteredSnapshots] = useState<SnapshotItem[]>([])
  const [groupedSnapshots, setGroupedSnapshots] = useState<ProjectGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'url'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [groupByProject, setGroupByProject] = useState<boolean>(true)
  const [selectedProject, setSelectedProject] = useState<string>('all')

  type SortOption = 'date' | 'title' | 'url'

  useEffect(() => {
    loadSnapshots()
  }, [])

  useEffect(() => {
    filterAndSortSnapshots()
  }, [snapshots, searchQuery, sortBy, sortOrder, selectedProject, groupByProject])

  async function loadSnapshots() {
    setError(null)
    try {
      const response = await fetch('/api/snapshots')
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to load snapshots')
      }
      const data = await response.json()

      // Normalize data to extract project info
      const normalizedSnapshots = (data || []).map((snap: any) => ({
        id: snap.id,
        url: snap.url,
        title: snap.title,
        created_at: snap.created_at,
        project_id: snap.snappy_project_snapshots?.[0]?.snappy_projects?.id || null,
        project_name: snap.snappy_project_snapshots?.[0]?.snappy_projects?.name || null
      }))

      setSnapshots(normalizedSnapshots)
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

    // Project filter
    if (selectedProject !== 'all') {
      filtered = filtered.filter(s => s.project_id === selectedProject)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s =>
        s.title?.toLowerCase().includes(query) ||
        s.url?.toLowerCase().includes(query) ||
        s.project_name?.toLowerCase().includes(query)
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

    // Group by project if enabled
    if (groupByProject) {
      const groups = filtered.reduce((acc: ProjectGroup[], snapshot) => {
        const projectName = snapshot.project_name || 'Uncategorized'
        const existingGroup = acc.find(g => g.project_name === projectName)

        if (existingGroup) {
          existingGroup.snapshots.push(snapshot)
        } else {
          acc.push({
            project_id: snapshot.project_id || null,
            project_name: projectName,
            snapshots: [snapshot]
          })
        }

        return acc
      }, [])

      // Sort groups by project name
      groups.sort((a, b) => {
        if (a.project_name === 'Uncategorized') return 1
        if (b.project_name === 'Uncategorized') return -1
        return a.project_name.localeCompare(b.project_name)
      })

      setGroupedSnapshots(groups)
    } else {
      setGroupedSnapshots([{ project_id: null, project_name: 'All', snapshots: filtered }])
    }
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

  function getThumbnail(snapshot: SnapshotItem): string | null {
    return snapshot.raw_data?.screenshot || null
  }

  // Snapshot Card Component
  function SnapshotCard({ snapshot, onClick }: { snapshot: SnapshotItem; onClick: () => void }) {
    const thumbnail = getThumbnail(snapshot)

    return (
      <div
        onClick={onClick}
        className="group bg-card rounded-xl shadow-sm border-2 border-border hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer overflow-hidden hover:-translate-y-1 duration-300"
      >
        {/* Thumbnail */}
        <div className="relative h-40 bg-gradient-to-br from-muted via-muted/50 to-background overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={snapshot.title || 'Screenshot'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-5xl opacity-30 group-hover:scale-110 transition-transform duration-300">
                🌐
              </div>
            </div>
          )}
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center justify-between text-white text-xs">
                <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                  View details
                </span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </div>
          </div>
          {/* Project badge */}
          {snapshot.project_name && (
            <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs px-2 py-1 rounded-lg shadow-lg">
              {snapshot.project_name}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground truncate mb-1 group-hover:text-primary transition-colors">
            {snapshot.title || 'Untitled'}
          </h3>
          <p className="text-sm text-muted-foreground truncate mb-3 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {getDomain(snapshot.url)}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatRelativeDate(snapshot.created_at)}
            </span>
            <span className="bg-muted px-2 py-0.5 rounded">{estimateSize(snapshot)}</span>
          </div>
        </div>
      </div>
    )
  }

  // Snapshot List Item Component
  function SnapshotListItem({ snapshot, onClick }: { snapshot: SnapshotItem; onClick: () => void }) {
    const thumbnail = getThumbnail(snapshot)

    return (
      <div
        onClick={onClick}
        className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition group"
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={snapshot.title || 'Screenshot'}
            className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-14 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-2xl opacity-50">🌐</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {snapshot.title || 'Untitled'}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="truncate">{getDomain(snapshot.url)}</span>
            {snapshot.project_name && (
              <>
                <span>•</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                  {snapshot.project_name}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm text-muted-foreground">{formatRelativeDate(snapshot.created_at)}</div>
          <div className="text-xs text-muted-foreground/60">{estimateSize(snapshot)}</div>
        </div>
        <svg className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    )
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
          {/* Profile Card - Like an ID/Cédula */}
          <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden mb-6">
            {/* Screenshot Section - Top of the card */}
            <div className="relative bg-muted">
              {rawData?.screenshot ? (
                <img
                  src={rawData.screenshot}
                  alt={`Screenshot of ${selectedSnapshot.title}`}
                  className="w-full h-64 md:h-80 object-cover object-top"
                />
              ) : (
                <div className="w-full h-64 md:h-80 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                  <div className="text-6xl mb-4 opacity-50">🌐</div>
                  <p className="text-muted-foreground text-sm">No screenshot available</p>
                </div>
              )}
              {/* Gradient overlay for text readability */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent" />
            </div>

            {/* Info Section - Like ID card data */}
            <div className="p-6 -mt-12 relative">
              {/* Site favicon/logo placeholder */}
              <div className="w-16 h-16 bg-card rounded-xl border-4 border-card shadow-lg flex items-center justify-center mb-4">
                <Image
                  src="/images/logo.png"
                  alt="Snappy"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              </div>

              {/* Title and URL */}
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {selectedSnapshot.title || 'Untitled'}
              </h1>
              <a
                href={selectedSnapshot.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 text-sm truncate block mb-4"
              >
                {selectedSnapshot.url}
              </a>

              {/* Stats Row - Inline like ID card fields */}
              <div className="grid grid-cols-4 gap-3 py-4 border-t border-border">
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">{rawData?.text?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Textos</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-secondary">{rawData?.ux?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">UX</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">
                    {rawData?.html ? Math.round(rawData.html.length / 1024) : 0}
                  </div>
                  <div className="text-xs text-muted-foreground">KB</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-secondary">
                    {rawData?.meta?.viewport?.width || '?'}×{rawData?.meta?.viewport?.height || '?'}
                  </div>
                  <div className="text-xs text-muted-foreground">Viewport</div>
                </div>
              </div>

              {/* Capture date - Like expiration date on ID */}
              <div className="flex items-center justify-between pt-4 border-t border-border text-sm">
                <span className="text-muted-foreground">Captured</span>
                <span className="font-medium text-foreground">{formatDate(selectedSnapshot.created_at)}</span>
              </div>
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

  // Get unique projects for filter
  const projects = Array.from(new Set(snapshots.map(s => s.project_name).filter(Boolean)))

  // Catalog View
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <Header variant="app" />

      {/* Catalog Title & Controls */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-[73px] z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <Image
                  src="/images/logo.png"
                  alt="Snappy"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Snapshot Gallery
                </h1>
                <p className="text-sm text-muted-foreground">
                  {snapshots.length} {snapshots.length === 1 ? 'snapshot' : 'snapshots'}
                  {projects.length > 0 && ` • ${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
                </p>
              </div>
            </div>
            <button
              onClick={loadSnapshots}
              className="group p-3 bg-gradient-to-br from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 rounded-xl transition-all hover:scale-105 min-w-[44px] min-h-[44px] flex items-center justify-center border border-primary/20"
              title="Refresh"
              aria-label="Refresh snapshots"
            >
              <svg className="w-5 h-5 text-primary group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by title, URL, or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border focus:border-primary rounded-xl focus:ring-4 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground shadow-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Project Filter */}
              {projects.length > 0 && (
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="px-4 py-3 bg-background border-2 border-border focus:border-primary rounded-xl focus:ring-4 focus:ring-primary/10 transition-all text-sm text-foreground shadow-sm cursor-pointer hover:border-primary/50"
                >
                  <option value="all">All Projects</option>
                  {projects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              )}

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-3 bg-background border-2 border-border focus:border-primary rounded-xl focus:ring-4 focus:ring-primary/10 transition-all text-sm text-foreground shadow-sm cursor-pointer hover:border-primary/50"
              >
                <option value="date">📅 Date</option>
                <option value="title">📝 Title</option>
                <option value="url">🔗 URL</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 bg-background border-2 border-border hover:border-primary rounded-xl focus:ring-4 focus:ring-primary/10 transition-all text-sm text-foreground shadow-sm hover:bg-primary/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
              >
                {sortOrder === 'asc' ? '↑ Oldest' : '↓ Newest'}
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-3 bg-background border-2 border-border hover:border-primary rounded-xl focus:ring-4 focus:ring-primary/10 transition-all text-sm text-foreground shadow-sm hover:bg-primary/5 min-w-[44px] min-h-[44px] flex items-center justify-center gap-2"
                title={viewMode === 'grid' ? 'Grid view' : 'List view'}
                aria-label={viewMode === 'grid' ? 'Switch to grid view' : 'Switch to list view'}
              >
                {viewMode === 'grid' ? '⊞ Grid' : '☰ List'}
              </button>

              <button
                onClick={() => setGroupByProject(!groupByProject)}
                className={`px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all text-sm shadow-sm min-w-[44px] min-h-[44px] flex items-center justify-center gap-2 ${
                  groupByProject
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:border-primary text-foreground hover:bg-primary/5'
                }`}
                title={groupByProject ? 'Ungroup' : 'Group by project'}
                aria-label={groupByProject ? 'Show flat list' : 'Group by project'}
              >
                📁 Group
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
            </div>
            <p className="text-muted-foreground mt-4">Loading your snapshots...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg">
              ⚠️
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {error}
            </p>
            <button
              onClick={loadSnapshots}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl hover:shadow-lg transition-all hover:scale-105"
            >
              Try Again
            </button>
          </div>
        ) : filteredSnapshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              <Image
                src="/images/logo.png"
                alt="Snappy"
                width={64}
                height={64}
                className="rounded-xl opacity-50"
              />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {searchQuery ? 'No matches found' : 'No snapshots yet'}
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {searchQuery
                ? 'Try adjusting your search terms or filters'
                : 'Start capturing web pages with the SnappyCrawler extension'}
            </p>
            {!searchQuery && (
              <a
                href="/snappy-extension.zip?v=2.0.1"
                download
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl hover:shadow-lg transition-all hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Extension
              </a>
            )}
          </div>
        ) : groupByProject ? (
          /* Grouped View */
          <div className="space-y-8">
            {groupedSnapshots.map((group) => (
              <div key={group.project_id || 'uncategorized'} className="space-y-4">
                {/* Project Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                    📁
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{group.project_name}</h2>
                    <p className="text-sm text-muted-foreground">{group.snapshots.length} {group.snapshots.length === 1 ? 'snapshot' : 'snapshots'}</p>
                  </div>
                </div>

                {/* Snapshots Grid */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {group.snapshots.map((snapshot) => (
                      <SnapshotCard
                        key={snapshot.id}
                        snapshot={snapshot}
                        onClick={() => loadSnapshotDetail(snapshot.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-xl shadow-sm border border-border divide-y divide-border overflow-hidden">
                    {group.snapshots.map((snapshot) => (
                      <SnapshotListItem
                        key={snapshot.id}
                        snapshot={snapshot}
                        onClick={() => loadSnapshotDetail(snapshot.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Flat View */
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSnapshots.map((snapshot) => (
                <SnapshotCard
                  key={snapshot.id}
                  snapshot={snapshot}
                  onClick={() => loadSnapshotDetail(snapshot.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow-sm border border-border divide-y divide-border overflow-hidden">
              {filteredSnapshots.map((snapshot) => (
                <SnapshotListItem
                  key={snapshot.id}
                  snapshot={snapshot}
                  onClick={() => loadSnapshotDetail(snapshot.id)}
                />
              ))}
            </div>
          )
        )}
      </main>
    </div>
  )
}
