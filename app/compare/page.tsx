'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Snapshot {
  snapshot_id: string
  url: string
  page_type: string
  status: string
  created_at: string
}

export default function ComparePage() {
  const router = useRouter()
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [comparing, setComparing] = useState(false)
  const [comparisonResult, setComparisonResult] = useState<any>(null)

  useEffect(() => {
    loadSnapshots()
  }, [])

  const loadSnapshots = async () => {
    try {
      const baseUrl = window.location.origin
      const res = await fetch(`${baseUrl}/api/snapshots`)
      const data = await res.json()
      setSnapshots(data.snapshots || [])
    } catch (err) {
      console.error('Failed to load snapshots:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(sid => sid !== id)
      }
      if (prev.length >= 4) {
        alert('Maximum 4 snapshots can be compared at once')
        return prev
      }
      return [...prev, id]
    })
  }

  const runComparison = async () => {
    if (selectedIds.length < 2) {
      alert('Please select at least 2 snapshots to compare')
      return
    }

    setComparing(true)
    try {
      const baseUrl = window.location.origin
      const res = await fetch(`${baseUrl}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot_ids: selectedIds })
      })

      if (!res.ok) throw new Error('Comparison failed')

      const data = await res.json()
      setComparisonResult(data.comparison)
    } catch (err) {
      console.error('Comparison error:', err)
      alert('Comparison failed. Please try again.')
    } finally {
      setComparing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-white">SnappyCrawler</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {selectedIds.length} selected
            </span>
            {selectedIds.length >= 2 && (
              <button
                onClick={runComparison}
                disabled={comparing}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {comparing ? 'Comparing...' : 'Compare Now'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading snapshots...</p>
          </div>
        ) : comparisonResult ? (
          <ComparisonResult result={comparisonResult} snapshots={snapshots} />
        ) : (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Compare Snapshots</h1>
              <p className="text-slate-400">
                Select 2-4 snapshots to compare their design tokens, UX patterns, and more
              </p>
            </div>

            {snapshots.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-400 mb-4">No snapshots available for comparison</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Create Snapshots First
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {snapshots.map((snapshot) => {
                  const isSelected = selectedIds.includes(snapshot.snapshot_id)
                  return (
                    <div
                      key={snapshot.snapshot_id}
                      onClick={() => toggleSelection(snapshot.snapshot_id)}
                      className={`
                        cursor-pointer border-2 rounded-xl p-6 transition-all
                        ${isSelected
                          ? 'border-blue-500 bg-blue-500/5'
                          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate">
                            {snapshot.url}
                          </h3>
                          <p className="text-sm text-slate-400 mt-1">
                            {snapshot.page_type || 'Unknown'}
                          </p>
                        </div>
                        <div className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-2
                          ${isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-slate-600'
                          }
                        `}>
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-slate-400">
                        {new Date(snapshot.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function ComparisonResult({ result, snapshots }: { result: any; snapshots: Snapshot[] }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Comparison Results</h1>
          <p className="text-slate-400">
            Analysis of {snapshots.filter(s => result.snapshot_ids.includes(s.snapshot_id)).length} snapshots
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
        >
          New Comparison
        </button>
      </div>

      {/* Visual Differences */}
      {result.visual_differences && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Visual Differences</h2>
          <div className="space-y-4">
            {result.visual_differences.map((diff: any, i: number) => (
              <div key={i} className="border-l-4 border-blue-500 pl-4">
                <p className="text-white">{diff.description}</p>
                <p className="text-sm text-slate-400 mt-1">Confidence: {Math.round(diff.confidence * 100)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Design Comparison */}
      {result.design_comparison && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Design Tokens Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-white mb-3">Colors</h3>
              <div className="space-y-2">
                {result.design_comparison.colors?.map((color: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded border border-slate-700"
                      style={{ backgroundColor: color.value }}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-white">{color.value}</p>
                      <p className="text-xs text-slate-400">{color.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-white mb-3">Typography</h3>
              <div className="space-y-2">
                {result.design_comparison.typography?.map((font: any, i: number) => (
                  <div key={i} className="p-2 bg-slate-800/50 rounded">
                    <p className="text-sm text-white">{font.family}</p>
                    <p className="text-xs text-slate-400">{font.usage}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UX Patterns Comparison */}
      {result.ux_patterns && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">UX Patterns Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.ux_patterns.map((pattern: any, i: number) => (
              <div key={i} className="border border-slate-700 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">{pattern.name}</h3>
                <p className="text-sm text-slate-400 mb-2">{pattern.description}</p>
                <p className="text-xs text-slate-500">
                  Found in {pattern.count} snapshots
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complexity Analysis */}
      {result.complexity && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Complexity Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-400 mb-1">Simplest</p>
              <p className="text-xl font-bold text-white">{result.complexity.simplest}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Most Complex</p>
              <p className="text-xl font-bold text-white">{result.complexity.most_complex}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Average Score</p>
              <p className="text-xl font-bold text-white">{result.complexity.average}</p>
            </div>
          </div>
        </div>
      )}

      {/* Export */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors">
          Download Comparison Report
        </button>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors">
          Export as JSON
        </button>
      </div>
    </div>
  )
}
