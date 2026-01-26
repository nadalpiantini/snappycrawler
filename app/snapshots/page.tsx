'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import { RawSnapshot } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Calendar,
  Type,
  Link as LinkIcon,
  Grid3x3,
  List,
  FolderOpen,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  Globe,
  Clock,
  FileText,
  Zap,
  Layers,
  Sparkles,
  Download,
  Filter,
  XCircle
} from 'lucide-react'

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
  const [isRefreshing, setIsRefreshing] = useState(false)

  type SortOption = 'date' | 'title' | 'url'

  useEffect(() => {
    loadSnapshots()
  }, [])

  useEffect(() => {
    filterAndSortSnapshots()
  }, [snapshots, searchQuery, sortBy, sortOrder, selectedProject, groupByProject])

  async function loadSnapshots() {
    setError(null)
    setIsRefreshing(true)
    try {
      console.log('🔍 Fetching snapshots from API...')
      const response = await fetch('/api/snapshots')
      console.log('📡 API Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || 'Failed to load snapshots')
      }

      const data = await response.json()
      console.log('✅ Snapshots loaded:', data?.length || 0, 'items')

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
      console.error('❌ Error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  async function loadSnapshotDetail(id: string) {
    try {
      console.log('🔍 Loading snapshot detail:', id)
      const response = await fetch(`/api/snapshots?id=${id}`)
      if (!response.ok) {
        console.error('❌ Error loading snapshot:', response.statusText)
        return
      }
      const data = await response.json()
      setSelectedSnapshot(data)
    } catch (err) {
      console.error('❌ Error:', err)
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
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
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

  // Snapshot Card Component - Premium Design
  function SnapshotCard({ snapshot, onClick }: { snapshot: SnapshotItem; onClick: () => void }) {
    const thumbnail = getThumbnail(snapshot)

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
        className="group relative bg-gradient-to-br from-card via-card to-muted/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border border-border/50 hover:border-primary/30"
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-primary/5 via-secondary/5 to-background overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={snapshot.title || 'Screenshot'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5">
              <Image
                src="/images/camera-icon.png"
                alt="No screenshot"
                width={64}
                height={64}
                className="w-16 h-16 opacity-30 group-hover:scale-110 transition-transform duration-300 rounded-xl"
              />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-60" />

          {/* Hover Action */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-medium border border-white/20">
                  View Details
                </span>
                <ChevronRight className="w-6 h-6 text-white transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Project Badge */}
          {snapshot.project_name && (
            <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-md text-primary-foreground text-xs px-3 py-1.5 rounded-xl shadow-lg border border-primary/20">
              {snapshot.project_name}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-semibold text-foreground truncate mb-2 group-hover:text-primary transition-colors duration-300">
            {snapshot.title || 'Untitled'}
          </h3>
          <p className="text-sm text-muted-foreground truncate mb-4 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 flex-shrink-0" />
            {getDomain(snapshot.url)}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatRelativeDate(snapshot.created_at)}
            </span>
            <span className="bg-muted px-2.5 py-1 rounded-lg font-medium">{estimateSize(snapshot)}</span>
          </div>
        </div>
      </motion.div>
    )
  }

  // Snapshot List Item Component
  function SnapshotListItem({ snapshot, onClick }: { snapshot: SnapshotItem; onClick: () => void }) {
    const thumbnail = getThumbnail(snapshot)

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        onClick={onClick}
        className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-all duration-300 group border border-border/50 rounded-xl hover:border-primary/30 hover:shadow-lg"
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={snapshot.title || 'Screenshot'}
            className="w-24 h-16 rounded-xl object-cover flex-shrink-0 shadow-md"
          />
        ) : (
          <div className="w-24 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Image
              src="/images/camera-icon.png"
              alt="No screenshot"
              width={32}
              height={32}
              className="w-8 h-8 opacity-30 rounded-lg"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">
            {snapshot.title || 'Untitled'}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="truncate">{getDomain(snapshot.url)}</span>
            {snapshot.project_name && (
              <>
                <span>•</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-xs font-medium">
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
        <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </motion.div>
    )
  }

  // Detail View
  if (selectedSnapshot) {
    const rawData = selectedSnapshot.raw_data
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSelectedSnapshot(null)}
              className="flex items-center gap-3 px-5 py-2.5 text-foreground hover:bg-primary/10 rounded-xl transition-all duration-300 font-medium min-h-[44px] hover:shadow-lg hover:shadow-primary/5 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to Gallery
            </button>
            <span className="text-sm text-muted-foreground">{formatDate(selectedSnapshot.created_at)}</span>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden mb-8"
          >
            {/* Screenshot */}
            <div className="relative bg-gradient-to-br from-muted/50 to-background">
              {rawData?.screenshot ? (
                <img
                  src={rawData.screenshot}
                  alt={`Screenshot of ${selectedSnapshot.title}`}
                  className="w-full h-80 md:h-96 object-cover object-top"
                />
              ) : (
                <div className="w-full h-80 md:h-96 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5">
                  <Image
                    src="/images/camera-icon.png"
                    alt="No screenshot"
                    width={80}
                    height={80}
                    className="w-20 h-20 opacity-30 mb-4 rounded-2xl"
                  />
                  <p className="text-muted-foreground">No screenshot available</p>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-card to-transparent" />
            </div>

            {/* Info */}
            <div className="p-8 -mt-16 relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl border-4 border-card shadow-xl flex items-center justify-center mb-6">
                <Globe className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-2">
                {selectedSnapshot.title || 'Untitled'}
              </h1>
              <a
                href={selectedSnapshot.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 text-sm truncate block mb-6 flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                {selectedSnapshot.url}
              </a>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-border/50">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5"
                >
                  <div className="text-3xl font-bold text-primary">{rawData?.text?.length || 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">Text Elements</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5"
                >
                  <div className="text-3xl font-bold text-secondary">{rawData?.ux?.length || 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">Interactions</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5"
                >
                  <div className="text-3xl font-bold text-primary">
                    {rawData?.html ? Math.round(rawData.html.length / 1024) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">KB Size</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5"
                >
                  <div className="text-2xl font-bold text-secondary">
                    {rawData?.meta?.viewport?.width || '?'}×{rawData?.meta?.viewport?.height || '?'}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Viewport</div>
                </motion.div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border/50 text-sm">
                <span className="text-muted-foreground">Captured</span>
                <span className="font-medium text-foreground">{formatDate(selectedSnapshot.created_at)}</span>
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-xl border border-border/50 p-8 mb-8"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              Page Text Content
              <span className="text-sm font-normal text-muted-foreground">({rawData?.text?.length || 0} elements)</span>
            </h2>
            <div className="bg-gradient-to-br from-background to-muted/30 rounded-xl p-6 max-h-80 overflow-y-auto border border-border/50">
              {rawData?.text?.slice(0, 30).map((text, i) => (
                <div key={i} className="py-2 text-sm text-muted-foreground border-b border-border/30 last:border-0 hover:text-foreground transition-colors">
                  • {text}
                </div>
              ))}
              {(rawData?.text?.length || 0) > 30 && (
                <div className="py-3 text-sm text-muted-foreground/60 italic">
                  + {(rawData?.text?.length || 0) - 30} more elements...
                </div>
              )}
            </div>
          </motion.div>

          {/* UX Events */}
          {rawData?.ux && rawData.ux.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl shadow-xl border border-border/50 p-8 mb-8"
            >
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-secondary" />
                </div>
                Detected Interactions
                <span className="text-sm font-normal text-muted-foreground">({rawData.ux.length})</span>
              </h2>
              <div className="space-y-3">
                {rawData.ux.map((event, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-background to-muted/20 rounded-xl border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <span className="px-3 py-1.5 bg-gradient-to-r from-primary/20 to-primary/10 text-primary text-xs font-semibold rounded-lg border border-primary/20">
                      {event.type}
                    </span>
                    <span className="text-sm font-medium text-foreground">{event.tag}</span>
                    {event.text && (
                      <span className="text-sm text-muted-foreground truncate">{event.text}</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Raw Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <details className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden group">
              <summary className="p-8 cursor-pointer text-xl font-semibold text-foreground flex items-center gap-3 hover:bg-muted/30 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-muted/50 to-muted rounded-xl flex items-center justify-center">
                  <Layers className="w-5 h-5 text-foreground" />
                </div>
                Technical Data (Developer Only)
                <ChevronRight className="w-5 h-5 ml-auto group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-8 pb-8">
                <pre className="bg-gradient-to-br from-background to-muted/20 text-foreground rounded-xl p-6 text-sm overflow-x-auto border border-border/50">
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
          </motion.div>
        </main>
      </div>
    )
  }

  // Get unique projects for filter
  const projects = Array.from(new Set(snapshots.map(s => s.project_name).filter(Boolean)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <Header variant="app" />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary),0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(var(--secondary),0.1),transparent_50%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Logo */}
            <div className="inline-flex items-center justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-2xl opacity-30" />
                <Image
                  src="/images/snappycrawler_no_images.png"
                  alt="SnappyCrawler"
                  width={120}
                  height={120}
                  className="relative rounded-2xl w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 shadow-2xl"
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Snapshot Gallery
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Browse and manage your captured web pages. Search, filter, and explore your snapshot collection.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-foreground text-lg">{snapshots.length}</div>
                  <div className="text-muted-foreground text-xs">Snapshots</div>
                </div>
              </div>
              {projects.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-foreground text-lg">{projects.length}</div>
                    <div className="text-muted-foreground text-xs">Projects</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="sticky top-[73px] z-10 bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Browse Snapshots</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadSnapshots}
              disabled={isRefreshing}
              className="group p-3 bg-gradient-to-br from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 rounded-xl transition-all border border-primary/20 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-primary ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
            </motion.button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col xl:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search snapshots by name, URL, or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-background border-2 border-border focus:border-primary rounded-xl focus:ring-4 focus:ring-primary/10 transition-all text-base text-foreground placeholder:text-muted-foreground shadow-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {projects.length > 0 && (
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="px-4 py-3.5 bg-background border-2 border-border focus:border-primary rounded-xl focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium text-foreground shadow-sm cursor-pointer hover:border-primary/50 min-h-[48px]"
                >
                  <option value="all">All Projects</option>
                  {projects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              )}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-3.5 bg-background border-2 border-border focus:border-primary rounded-xl focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium text-foreground shadow-sm cursor-pointer hover:border-primary/50 min-h-[48px]"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Name</option>
                <option value="url">Sort by URL</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-5 py-3.5 bg-background border-2 border-border hover:border-primary rounded-xl transition-all text-base font-medium text-foreground shadow-sm hover:bg-primary/5 min-h-[48px] flex items-center justify-center gap-2"
                title={sortOrder === 'asc' ? 'Oldest first' : 'Newest first'}
              >
                {sortOrder === 'asc' ? <Calendar className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                {sortOrder === 'asc' ? 'Oldest' : 'Newest'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-5 py-3.5 bg-background border-2 border-border hover:border-primary rounded-xl transition-all text-base font-medium text-foreground shadow-sm hover:bg-primary/5 min-h-[48px] flex items-center justify-center gap-2"
              >
                {viewMode === 'grid' ? <Grid3x3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                {viewMode === 'grid' ? 'Grid' : 'List'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGroupByProject(!groupByProject)}
                className={`px-5 py-3.5 border-2 rounded-xl transition-all text-base font-medium shadow-sm min-h-[48px] flex items-center justify-center gap-2 ${
                  groupByProject
                    ? 'bg-gradient-to-r from-primary to-secondary text-white border-primary shadow-lg'
                    : 'bg-background border-border hover:border-primary text-foreground hover:bg-primary/5'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                {groupByProject ? 'Grouped' : 'All'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <div className="w-20 h-20 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary rounded-full" />
            </motion.div>
            <p className="text-muted-foreground mt-6 text-lg font-medium">Loading your snapshots...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-24 h-24 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-3xl flex items-center justify-center text-5xl mb-8 shadow-2xl"
            >
              <XCircle className="w-12 h-12 text-destructive" />
            </motion.div>
            <h2 className="text-3xl font-semibold text-foreground mb-3">
              Oops, something went wrong
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              {error}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadSnapshots}
              className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl hover:shadow-xl transition-all text-lg font-semibold min-h-[56px] flex items-center gap-3"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </motion.button>
          </div>
        ) : filteredSnapshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl flex items-center justify-center mb-8 shadow-inner"
            >
              <Image
                src="/images/snappycrawler_no_images.png"
                alt="SnappyCrawler"
                width={80}
                height={80}
                className="rounded-2xl opacity-50"
              />
            </motion.div>
            <h2 className="text-3xl font-semibold text-foreground mb-3">
              {searchQuery ? 'No snapshots found' : 'No snapshots yet'}
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Start capturing web pages with the SnappyCrawler extension'}
            </p>
            {!searchQuery && (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/snappy-extension.zip?v=2.0.1"
                download
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl hover:shadow-xl transition-all text-lg font-semibold min-h-[56px]"
              >
                <Download className="w-5 h-5" />
                Download Extension
              </motion.a>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {groupByProject ? (
              /* Grouped View */
              <div className="space-y-10">
                {groupedSnapshots.map((group, groupIndex) => (
                  <motion.div
                    key={group.project_id || 'uncategorized'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                    className="space-y-4"
                  >
                    {/* Project Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center shadow-lg">
                        <FolderOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">{group.project_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {group.snapshots.length} snapshot{group.snapshots.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Snapshots Grid */}
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {group.snapshots.map((snapshot) => (
                          <SnapshotCard
                            key={snapshot.id}
                            snapshot={snapshot}
                            onClick={() => loadSnapshotDetail(snapshot.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-card rounded-2xl shadow-lg border border-border/50 divide-y divide-border/50 overflow-hidden">
                        {group.snapshots.map((snapshot) => (
                          <SnapshotListItem
                            key={snapshot.id}
                            snapshot={snapshot}
                            onClick={() => loadSnapshotDetail(snapshot.id)}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Flat View */
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredSnapshots.map((snapshot) => (
                    <SnapshotCard
                      key={snapshot.id}
                      snapshot={snapshot}
                      onClick={() => loadSnapshotDetail(snapshot.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-2xl shadow-lg border border-border/50 divide-y divide-border/50 overflow-hidden">
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
          </AnimatePresence>
        )}
      </main>
    </div>
  )
}
