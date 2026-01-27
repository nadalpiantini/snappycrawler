'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  SnapshotTab,
  DesignTab,
  UXTab,
  WireframeTab,
  AIContextTab,
  CompareTab
} from '@/components/snapshot-tabs'
import { BlueprintView } from '@/components/blueprint-view'

interface Snapshot {
  snapshot_id: string
  url: string
  page_type: string
  status: string
  created_at: string
  modes_completed?: string[]
}

type ViewMode = 'blueprint' | 'technical'

export default function SnapshotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('blueprint')
  const [activeTab, setActiveTab] = useState('overview')
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Run All Analyses state
  const [isRunningAll, setIsRunningAll] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState<Record<string, boolean>>({})
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null)

  useEffect(() => {
    loadSnapshot()
  }, [params.id])

  const loadSnapshot = async () => {
    try {
      const baseUrl = window.location.origin
      const res = await fetch(`${baseUrl}/api/snapshots/${params.id}`)

      if (!res.ok) {
        throw new Error('Snapshot not found')
      }

      const data = await res.json()
      setSnapshot(data.snapshot)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load snapshot')
    } finally {
      setLoading(false)
    }
  }

  const runAnalysis = async (mode: string) => {
    try {
      const baseUrl = window.location.origin
      const res = await fetch(`${baseUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshot_id: params.id,
          modes: [mode]
        })
      })

      if (!res.ok) throw new Error('Analysis failed')

      // Reload snapshot after analysis
      await loadSnapshot()
      setActiveTab(mode)
    } catch (err) {
      console.error('Analysis error:', err)
      alert('Analysis failed. Please try again.')
    }
  }

  const runAllAnalyses = async () => {
    const allModes = ['design', 'ux', 'wireframe', 'ai']
    const completedModes = snapshot?.modes_completed || []
    const modesToRun = allModes.filter(mode => !completedModes.includes(mode))

    if (modesToRun.length === 0) {
      alert('All analyses are already complete!')
      return
    }

    setIsRunningAll(true)
    setAnalysisProgress({})
    setCurrentAnalysis(null)

    try {
      const baseUrl = window.location.origin

      // Run each mode sequentially
      for (const mode of modesToRun) {
        setCurrentAnalysis(mode)
        setAnalysisProgress(prev => ({ ...prev, [mode]: false }))

        const res = await fetch(`${baseUrl}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            snapshot_id: params.id,
            modes: [mode]
          })
        })

        if (!res.ok) {
          console.error(`${mode} analysis failed`)
          setAnalysisProgress(prev => ({ ...prev, [mode]: false }))
        } else {
          setAnalysisProgress(prev => ({ ...prev, [mode]: true }))
        }

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Reload snapshot to get final state
      await loadSnapshot()
      setIsRunningAll(false)
      setCurrentAnalysis(null)

      // Show success message
      const completedCount = modesToRun.length
      alert(`✅ Successfully completed ${completedCount} analysis mode(s)!`)

    } catch (err) {
      console.error('Run all error:', err)
      setIsRunningAll(false)
      setCurrentAnalysis(null)
      alert('Failed to run all analyses. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading snapshot...</p>
        </div>
      </div>
    )
  }

  if (error || !snapshot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Snapshot Not Found</h1>
          <p className="text-slate-400 mb-6">{error || 'This snapshot does not exist'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'snapshot', label: 'Snapshot', icon: '📸' },
    { id: 'design', label: 'Design Forensics', icon: '🎨' },
    { id: 'ux', label: 'UX Intelligence', icon: '🧠' },
    { id: 'wireframe', label: 'Wireframe', icon: '📐' },
    { id: 'ai', label: 'AI Context', icon: '🤖' },
    { id: 'compare', label: 'Compare', icon: '⚖️' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-white">SnappyCrawler</span>
            </Link>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg">
                <button
                  onClick={() => setViewMode('blueprint')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'blueprint'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🧬 Blueprint
                </button>
                <button
                  onClick={() => setViewMode('technical')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'technical'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔧 Technical
                </button>
              </div>

              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                snapshot.status === 'completed'
                  ? 'bg-green-500/10 text-green-400'
                  : snapshot.status === 'processing'
                  ? 'bg-yellow-500/10 text-yellow-400'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {snapshot.status}
              </span>
            </div>
          </div>

          {/* Snapshot Info */}
          <div className="pb-4">
            <h1 className="text-lg font-semibold text-white truncate">{snapshot.url}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
              <span>{snapshot.page_type || 'Unknown'}</span>
              <span>•</span>
              <span>{new Date(snapshot.created_at).toLocaleDateString()}</span>
              {viewMode === 'technical' && (
                <>
                  <span>•</span>
                  <span>{snapshot.modes_completed?.length || 0}/6 modes completed</span>
                </>
              )}
            </div>
          </div>

          {/* Tabs - Only show in technical mode */}
          {viewMode === 'technical' && (
            <div className="flex items-center gap-1 overflow-x-auto pb-0">
              {tabs.map((tab) => {
                const isCompleted = snapshot.modes_completed?.includes(tab.id)
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap
                      ${activeTab === tab.id
                        ? 'bg-slate-800 text-white border-t-2 border-blue-500'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {isCompleted && (
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Blueprint View */}
        {viewMode === 'blueprint' && (
          <BlueprintView snapshotId={params.id as string} />
        )}

        {/* Technical View */}
        {viewMode === 'technical' && (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-slate-400">Analysis Progress</h3>
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {snapshot.modes_completed?.length || 0}/6
                    </div>
                    <p className="text-sm text-slate-400">modes completed</p>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-slate-400">Page Type</h3>
                      <span className="text-2xl">📄</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2 capitalize">
                      {snapshot.page_type || 'Unknown'}
                    </div>
                    <p className="text-sm text-slate-400">detected type</p>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-slate-400">Status</h3>
                      <span className="text-2xl">
                        {snapshot.status === 'completed' ? '✅' : snapshot.status === 'processing' ? '⏳' : '⏸️'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white capitalize mb-2">
                      {snapshot.status}
                    </div>
                    <p className="text-sm text-slate-400">current status</p>
                  </div>
                </div>

                {/* Run All Analyses Button */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Run All Analyses</h2>
                      <p className="text-sm text-slate-400 mt-1">
                        Execute all 4 analysis modes in sequence
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isRunningAll ? (
                        <div className="flex items-center gap-2 text-blue-400">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm font-medium">Processing...</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          {snapshot.modes_completed?.filter(m => ['design', 'ux', 'wireframe', 'ai'].includes(m)).length || 0}/4 complete
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Indicators */}
                  {isRunningAll && (
                    <div className="space-y-2 mb-4">
                      {['design', 'ux', 'wireframe', 'ai'].map(mode => {
                        const isCurrent = currentAnalysis === mode
                        const isComplete = analysisProgress[mode] === true
                        const isPending = !analysisProgress[mode] && !isCurrent

                        return (
                          <div key={mode} className="flex items-center gap-3 text-sm">
                            {isCurrent && (
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            )}
                            {isComplete && <span className="text-green-400">✓</span>}
                            {isPending && <span className="text-slate-600">○</span>}
                            <span className={
                              isCurrent ? 'text-blue-400 font-medium' :
                              isComplete ? 'text-green-400' :
                              'text-slate-500'
                            }>
                              {mode.charAt(0).toUpperCase() + mode.slice(1)} Analysis
                              {isCurrent && ' (running...)'}
                              {isComplete && ' (complete)'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={runAllAnalyses}
                    disabled={isRunningAll || ['design', 'ux', 'wireframe', 'ai'].every(m => snapshot.modes_completed?.includes(m))}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                      isRunningAll || ['design', 'ux', 'wireframe', 'ai'].every(m => snapshot.modes_completed?.includes(m))
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isRunningAll ? (
                      'Processing...'
                    ) : ['design', 'ux', 'wireframe', 'ai'].every(m => snapshot.modes_completed?.includes(m)) ? (
                      '✅ All Complete!'
                    ) : (
                      '⚡ Run All 4 Analyses'
                    )}
                  </button>
                </div>

                {/* Available Modes */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-6">Available Analysis Modes</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mode 1: Snapshot */}
                    <div className="border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-white">Snapshot</h3>
                          <p className="text-sm text-slate-400 mt-1">Raw HTML, text, and structure</p>
                        </div>
                        <span className="text-2xl">📸</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded ${
                          snapshot.modes_completed?.includes('snapshot')
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                          {snapshot.modes_completed?.includes('snapshot') ? 'Completed' : 'Not run'}
                        </span>
                        {!snapshot.modes_completed?.includes('snapshot') && (
                          <button
                            onClick={() => runAnalysis('snapshot')}
                            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                          >
                            Run →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mode 2: Design Forensics */}
                    <div className="border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-white">Design Forensics</h3>
                          <p className="text-sm text-slate-400 mt-1">Colors, fonts, spacing, components</p>
                        </div>
                        <span className="text-2xl">🎨</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded ${
                          snapshot.modes_completed?.includes('design')
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                          {snapshot.modes_completed?.includes('design') ? 'Completed' : 'Not run'}
                        </span>
                        {!snapshot.modes_completed?.includes('design') && (
                          <button
                            onClick={() => runAnalysis('design')}
                            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                          >
                            Run →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mode 3: UX Intelligence */}
                    <div className="border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-white">UX Intelligence</h3>
                          <p className="text-sm text-slate-400 mt-1">Flows, patterns, friction points</p>
                        </div>
                        <span className="text-2xl">🧠</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded ${
                          snapshot.modes_completed?.includes('ux')
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                          {snapshot.modes_completed?.includes('ux') ? 'Completed' : 'Not run'}
                        </span>
                        {!snapshot.modes_completed?.includes('ux') && (
                          <button
                            onClick={() => runAnalysis('ux')}
                            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                          >
                            Run →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mode 4: Wireframe */}
                    <div className="border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-white">Wireframe Engine</h3>
                          <p className="text-sm text-slate-400 mt-1">Layout structure and flow</p>
                        </div>
                        <span className="text-2xl">📐</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded ${
                          snapshot.modes_completed?.includes('wireframe')
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                          {snapshot.modes_completed?.includes('wireframe') ? 'Completed' : 'Not run'}
                        </span>
                        {!snapshot.modes_completed?.includes('wireframe') && (
                          <button
                            onClick={() => runAnalysis('wireframe')}
                            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                          >
                            Run →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mode 5: AI Context */}
                    <div className="border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-white">AI Context Pack</h3>
                          <p className="text-sm text-slate-400 mt-1">Prompts and context for LLMs</p>
                        </div>
                        <span className="text-2xl">🤖</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded ${
                          snapshot.modes_completed?.includes('ai')
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                          {snapshot.modes_completed?.includes('ai') ? 'Completed' : 'Not run'}
                        </span>
                        {!snapshot.modes_completed?.includes('ai') && (
                          <button
                            onClick={() => runAnalysis('ai')}
                            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                          >
                            Run →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mode 6: Compare */}
                    <div className="border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-white">Compare</h3>
                          <p className="text-sm text-slate-400 mt-1">Compare with other snapshots</p>
                        </div>
                        <span className="text-2xl">⚖️</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-400">
                          Select 2+ snapshots
                        </span>
                        <Link
                          href="/compare"
                          className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                        >
                          Compare →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'snapshot' && <SnapshotTab snapshotId={params.id as string} />}
            {activeTab === 'design' && <DesignTab snapshotId={params.id as string} />}
            {activeTab === 'ux' && <UXTab snapshotId={params.id as string} />}
            {activeTab === 'wireframe' && <WireframeTab snapshotId={params.id as string} />}
            {activeTab === 'ai' && <AIContextTab snapshotId={params.id as string} />}
            {activeTab === 'compare' && <CompareTab snapshotId={params.id as string} />}
          </>
        )}
      </main>
    </div>
  )
}
