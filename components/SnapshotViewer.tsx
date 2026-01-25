'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, FileJson } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { normalizeSnapshot, sanitizeSnapshot } from '@/lib/normalizer'
import { RawSnapshot, NormalizedSnapshot } from '@/lib/types'

interface SnapshotViewerProps {
  snapshot: RawSnapshot
}

export function SnapshotViewer({ snapshot }: SnapshotViewerProps) {
  const [view, setView] = useState<'raw' | 'normalized' | 'legal'>('raw')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['meta']))

  const normalized = normalize(snapshot)
  const legalSafe = sanitize(normalized)

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const renderValue = (value: any, depth = 0): JSX.Element => {
    if (value === null) return <span className="text-muted-foreground">null</span>
    if (value === undefined) return <span className="text-muted-foreground">undefined</span>
    if (typeof value === 'boolean') return <span className="text-blue-500">{String(value)}</span>
    if (typeof value === 'number') return <span className="text-purple-500">{String(value)}</span>
    if (typeof value === 'string') return <span className="text-green-600">"{value}"</span>

    if (Array.isArray(value)) {
      return (
        <div className="ml-4">
          <span className="text-muted-foreground">[</span>
          {value.map((item, i) => (
            <div key={i} className="ml-4">
              {renderValue(item, depth + 1)}
              {i < value.length - 1 && <span className="text-muted-foreground">,</span>}
            </div>
          ))}
          <span className="text-muted-foreground">]</span>
        </div>
      )
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value)
      return (
        <div className="ml-4">
          <span className="text-muted-foreground">{'{'}</span>
          {entries.map(([key, val], i) => (
            <div key={key} className="ml-4">
              <span className="text-blue-600">{key}</span>: {renderValue(val, depth + 1)}
              {i < entries.length - 1 && <span className="text-muted-foreground">,</span>}
            </div>
          ))}
          <span className="text-muted-foreground">{'}'}</span>
        </div>
      )
    }

    return <span>{String(value)}</span>
  }

  const renderSection = (title: string, data: any) => {
    const isExpanded = expandedSections.has(title)

    return (
      <div key={title} className="border-b pb-4 last:border-0">
        <button
          onClick={() => toggleSection(title)}
          className="flex items-center gap-2 w-full text-left py-2 hover:bg-accent px-2 rounded"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span className="font-medium">{title}</span>
          {typeof data === 'object' && data !== null && !Array.isArray(data) && (
            <span className="text-xs text-muted-foreground ml-2">
              {Object.keys(data).length} keys
            </span>
          )}
        </button>

        {isExpanded && (
          <div className="mt-2 px-4 text-sm font-mono bg-muted/50 rounded p-4 overflow-x-auto">
            {renderValue(data)}
          </div>
        )}
      </div>
    )
  }

  const data = view === 'raw' ? snapshot : view === 'normalized' ? normalized : legalSafe

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              Snapshot Viewer
            </CardTitle>
            <CardDescription>{snapshot.url}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={view === 'raw' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('raw')}
            >
              Raw
            </Button>
            <Button
              variant={view === 'normalized' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('normalized')}
            >
              Normalized
            </Button>
            <Button
              variant={view === 'legal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('legal')}
            >
              Legal-Safe
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) =>
            renderSection(key, value)
          )}
        </div>
      </CardContent>
    </Card>
  )
}
