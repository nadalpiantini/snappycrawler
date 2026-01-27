'use client'

import { useState, useEffect } from 'react'
import { Copy, Download, ChevronDown, ChevronRight } from 'lucide-react'

// ============================================
// SNAPSHOT TAB - MODE 1
// ============================================

export function SnapshotTab({ snapshotId }: { snapshotId: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSnapshotData()
  }, [snapshotId])

  const loadSnapshotData = async () => {
    try {
      const baseUrl = window.location.origin
      const res = await fetch(`${baseUrl}/api/snapshots/${snapshotId}/mode/snapshot`)
      const result = await res.json()
      setData(result.data)
    } catch (err) {
      console.error('Failed to load snapshot:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading snapshot data...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
        <p className="text-slate-400 mb-4">No snapshot data available</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors"
        >
          Run Analysis
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Raw HTML Preview */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Raw HTML</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Copy className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        <pre className="p-6 text-sm text-slate-300 overflow-x-auto max-h-96 overflow-y-auto">
          <code>{data.html_raw?.substring(0, 5000)}...</code>
        </pre>
      </div>

      {/* Text Content */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Extracted Text</h2>
        <div className="space-y-2">
          {data.text_array?.slice(0, 20).map((text: string, i: number) => (
            <div key={i} className="text-sm text-slate-300 p-2 bg-slate-800/50 rounded">
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Layout Tree */}
      {data.layout_tree && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Layout Tree</h2>
          <pre className="text-sm text-slate-300 overflow-x-auto">
            <code>{JSON.stringify(data.layout_tree, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

// ============================================
// DESIGN FORENSICS TAB - MODE 2
// ============================================

export function DesignTab({ snapshotId }: { snapshotId: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDesignData()
  }, [snapshotId])

  const loadDesignData = async () => {
    try {
      const baseUrl = window.location.origin
      const res = await fetch(`${baseUrl}/api/snapshots/${snapshotId}/mode/design`)
      const result = await res.json()
      setData(result.data)
    } catch (err) {
      console.error('Failed to load design data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Analyzing design tokens..." />
  }

  if (!data) {
    return <EmptyState mode="design" />
  }

  return (
    <div className="space-y-6">
      {/* Colors */}
      {data.colors && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.colors.map((color: any, i: number) => (
              <div key={i} className="space-y-2">
                <div
                  className="w-full aspect-square rounded-lg border border-slate-700"
                  style={{ backgroundColor: color.value }}
                />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-white">{color.value}</p>
                  <p className="text-xs text-slate-400">
                    {color.role} • {Math.round(color.usage * 100)}% used
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Typography */}
      {data.typography && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Typography</h2>
          <div className="space-y-4">
            {data.typography.map((font: any, i: number) => (
              <div key={i} className="border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{font.family}</h3>
                  <span className="text-xs text-slate-400">
                    {Math.round(font.usage * 100)}% usage
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  {font.weights.map((weight: string, j: number) => (
                    <span key={j} className="px-2 py-1 bg-slate-800 text-slate-300 rounded">
                      {weight}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spacing Scale */}
      {data.spacing && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Spacing Scale</h2>
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
            {data.spacing.map((space: any, i: number) => (
              <div key={i} className="flex-shrink-0">
                <div
                  className="bg-blue-500/20 border border-blue-500/50 rounded"
                  style={{ width: space.value, height: '24px' }}
                />
                <p className="text-xs text-slate-400 mt-2">{space.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Components */}
      {data.components && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Detected Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.components.map((component: any, i: number) => (
              <div key={i} className="border border-slate-700 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">{component.type}</h3>
                <p className="text-sm text-slate-400 mb-2">{component.count} instances</p>
                <div className="text-xs text-slate-500">
                  Confidence: {Math.round(component.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Buttons */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
          <Download className="w-4 h-4" />
          Download JSON
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
          <Download className="w-4 h-4" />
          Download CSS
        </button>
      </div>
    </div>
  )
}

// ============================================
// UX INTELLIGENCE TAB - MODE 3
// ============================================

export function UXTab({ snapshotId }: { snapshotId: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUXData()
  }, [snapshotId])

  const loadUXData = async () => {
    try {
      const baseUrl = window.location.origin
      const res = await fetch(`${baseUrl}/api/snapshots/${snapshotId}/mode/ux`)
      const result = await res.json()
      setData(result.data)
    } catch (err) {
      console.error('Failed to load UX data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Analyzing UX patterns..." />
  }

  if (!data) {
    return <EmptyState mode="ux" />
  }

  return (
    <div className="space-y-6">
      {/* Primary Intent */}
      {data.primary_intent && (
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Primary Intent</h2>
          <p className="text-xl text-white">{data.primary_intent}</p>
          <div className="mt-4 text-sm text-slate-400">
            Confidence: {Math.round(data.intent_confidence * 100)}%
          </div>
        </div>
      )}

      {/* User Flow */}
      {data.flow && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Detected User Flow</h2>
          <div className="space-y-3">
            {data.flow.map((step: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 text-sm font-medium">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white">{step.action}</p>
                  {step.element && (
                    <p className="text-sm text-slate-400 mt-1">{step.element}</p>
                  )}
                </div>
                {step.friction && (
                  <span className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded">
                    Friction
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UX Patterns */}
      {data.patterns && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">UX Patterns Detected</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.patterns.map((pattern: any, i: number) => (
              <div key={i} className="border border-slate-700 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">{pattern.name}</h3>
                <p className="text-sm text-slate-400 mb-2">{pattern.description}</p>
                <div className="text-xs text-slate-500">
                  Found at {pattern.locations.length} locations
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Stories */}
      {data.job_stories && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Job Stories</h2>
          <div className="space-y-4">
            {data.job_stories.map((story: any, i: number) => (
              <div key={i} className="border-l-4 border-blue-500 pl-4">
                <p className="text-white">
                  <span className="text-slate-400">When </span>
                  <span className="font-medium">{story.situation}</span>
                  <span className="text-slate-400">, I want to </span>
                  <span className="font-medium">{story.motivation}</span>
                  <span className="text-slate-400">, so that I can </span>
                  <span className="font-medium">{story.outcome}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence */}
      {data.evidence && (
        <DetailsSection title="Evidence Layer" data={data.evidence} />
      )}

      {/* Export */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
          <Download className="w-4 h-4" />
          Download UX Report
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
          <Copy className="w-4 h-4" />
          Copy for LLM
        </button>
      </div>
    </div>
  )
}

// ============================================
// WIREFRAME TAB - MODE 4
// ============================================

export function WireframeTab({ snapshotId }: { snapshotId: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWireframeData()
  }, [snapshotId])

  const loadWireframeData = async () => {
    try {
      const baseUrl = window.location.origin
      const res = await fetch(`${baseUrl}/api/snapshots/${snapshotId}/mode/wireframe`)
      const result = await res.json()
      setData(result.data)
    } catch (err) {
      console.error('Failed to load wireframe data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Generating wireframe..." />
  }

  if (!data) {
    return <EmptyState mode="wireframe" />
  }

  return (
    <div className="space-y-6">
      {/* ASCII Wireframe */}
      {data.ascii && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">ASCII Wireframe</h2>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <pre className="text-sm text-slate-300 overflow-x-auto bg-slate-950 p-4 rounded-lg">
            <code>{data.ascii}</code>
          </pre>
        </div>
      )}

      {/* Visual Hierarchy */}
      {data.hierarchy && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Visual Hierarchy</h2>
          <div className="space-y-3">
            {data.hierarchy.map((level: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg"
                style={{ marginLeft: `${level.depth * 24}px` }}
              >
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="text-white">{level.element}</span>
                <span className="text-xs text-slate-400 ml-auto">{level.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layout Logic */}
      {data.layout_logic && (
        <DetailsSection title="Layout Logic" data={data.layout_logic} />
      )}

      {/* Rationale */}
      {data.rationale && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">UX Rationale</h2>
          <div className="prose prose-invert max-w-none text-slate-300">
            {data.rationale.split('\n').map((paragraph: string, i: number) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      {/* Export */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
          <Download className="w-4 h-4" />
          Download Wireframe
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
          <Copy className="w-4 h-4" />
          Copy Prompt for Designer
        </button>
      </div>
    </div>
  )
}

// ============================================
// AI CONTEXT TAB - MODE 5
// ============================================

export function AIContextTab({ snapshotId }: { snapshotId: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activePrompt, setActivePrompt] = useState<string>('developer')

  useEffect(() => {
    loadAIData()
  }, [snapshotId])

  const loadAIData = async () => {
    try {
      const baseUrl = window.location.origin
      const res = await fetch(`${baseUrl}/api/snapshots/${snapshotId}/mode/ai`)
      const result = await res.json()
      setData(result.data)
    } catch (err) {
      console.error('Failed to load AI data:', err)
    } finally {
      setLoading(false)
    }
  }

  const prompts = [
    { id: 'developer', label: 'For Developer', icon: '💻' },
    { id: 'designer', label: 'For Designer', icon: '🎨' },
    { id: 'pm', label: 'For PM', icon: '📋' },
    { id: 'llm', label: 'LLM Assistant', icon: '🤖' },
  ]

  if (loading) {
    return <LoadingState message="Generating AI context..." />
  }

  if (!data) {
    return <EmptyState mode="ai" />
  }

  return (
    <div className="space-y-6">
      {/* Prompt Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => setActivePrompt(prompt.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all
              ${activePrompt === prompt.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }
            `}
          >
            <span>{prompt.icon}</span>
            <span>{prompt.label}</span>
          </button>
        ))}
      </div>

      {/* System Brief */}
      {data.system_brief && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">System Brief</h2>
          <div className="space-y-4 text-slate-300">
            <div>
              <span className="text-slate-400">Page Type:</span>
              <span className="ml-2 text-white">{data.system_brief.page_type}</span>
            </div>
            <div>
              <span className="text-slate-400">Primary Purpose:</span>
              <span className="ml-2 text-white">{data.system_brief.primary_purpose}</span>
            </div>
            <div>
              <span className="text-slate-400">Target Users:</span>
              <span className="ml-2 text-white">
                {data.system_brief.target_users?.join(', ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Display */}
      {data.prompts && data.prompts[activePrompt] && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white capitalize">
              {activePrompt} Prompt
            </h2>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <pre className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-950 p-4 rounded-lg max-h-96 overflow-y-auto">
              <code>{data.prompts[activePrompt]}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Constraints */}
      {data.constraints && (
        <DetailsSection title="Constraints" data={data.constraints} />
      )}

      {/* Code Schema */}
      {data.code_schema && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Code Schema</h2>
          <pre className="text-sm text-slate-300 overflow-x-auto">
            <code>{JSON.stringify(data.code_schema, null, 2)}</code>
          </pre>
        </div>
      )}

      {/* Export All */}
      <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors">
        <Download className="w-4 h-4" />
        Download AI Context Bundle
      </button>
    </div>
  )
}

// ============================================
// COMPARE TAB - MODE 6
// ============================================

export function CompareTab({ snapshotId }: { snapshotId: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚖️</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Compare Snapshots</h2>
        <p className="text-slate-400 mb-6">
          Select 2 or more snapshots to compare their design tokens, UX patterns, and more.
        </p>
        <a
          href="/compare"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors"
        >
          Go to Compare Mode
        </a>
      </div>
    </div>
  )
}

// ============================================
// HELPER COMPONENTS
// ============================================

function LoadingState({ message }: { message: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-slate-400">{message}</p>
    </div>
  )
}

function EmptyState({ mode }: { mode: string }) {
  const modeNames: Record<string, string> = {
    snapshot: 'Snapshot',
    design: 'Design Forensics',
    ux: 'UX Intelligence',
    wireframe: 'Wireframe',
    ai: 'AI Context',
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">📊</span>
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">
        No {modeNames[mode]} Data
      </h2>
      <p className="text-slate-400 mb-6">
        Run the {modeNames[mode]} analysis to see results here
      </p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors"
      >
        Run Analysis
      </button>
    </div>
  )
}

function DetailsSection({ title, data }: { title: string; data: any }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <pre className="text-sm text-slate-300 overflow-x-auto">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  )
}
