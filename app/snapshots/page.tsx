'use client'

import { useEffect, useState } from 'react'
import { RawSnapshot } from '@/lib/types'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function SnapshotsPage() {
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSnapshot, setSelectedSnapshot] = useState<RawSnapshot | null>(null)

  useEffect(() => {
    loadSnapshots()
  }, [])

  async function loadSnapshots() {
    try {
      const { data, error } = await supabase
        .from('snappy_snapshots')
        .select('id, url, title, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error loading snapshots:', error)
        return
      }

      setSnapshots(data || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadSnapshotDetail(id: string) {
    try {
      const { data, error } = await supabase
        .from('snappy_snapshots')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error loading snapshot:', error)
        return
      }

      setSelectedSnapshot(data.raw_data as RawSnapshot)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  if (selectedSnapshot) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => setSelectedSnapshot(null)}
          className="mb-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          ← Back to list
        </button>
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-2xl font-bold mb-4">{selectedSnapshot.title}</h2>
          <p className="text-muted-foreground mb-6">{selectedSnapshot.url}</p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Text Content ({selectedSnapshot.text?.length || 0} elements)</h3>
              <div className="bg-muted rounded p-4 max-h-60 overflow-y-auto text-sm">
                {selectedSnapshot.text?.slice(0, 20).map((text, i) => (
                  <div key={i} className="mb-1">• {text}</div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">UX Events ({selectedSnapshot.ux?.length || 0})</h3>
              <div className="bg-muted rounded p-4 max-h-60 overflow-y-auto text-sm">
                {selectedSnapshot.ux?.length === 0 ? (
                  <p className="text-muted-foreground">No UX events captured</p>
                ) : (
                  selectedSnapshot.ux?.map((event, i) => (
                    <div key={i} className="mb-2">
                      <span className="font-mono text-xs bg-primary/10 px-2 py-1 rounded">
                        {event.type}
                      </span>
                      <span className="ml-2">{event.tag}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Info</h3>
              <pre className="bg-muted rounded p-4 text-xs overflow-x-auto">
                {JSON.stringify({
                  url: selectedSnapshot.url,
                  title: selectedSnapshot.title,
                  timestamp: selectedSnapshot.timestamp,
                  textCount: selectedSnapshot.text?.length || 0,
                  uxEventsCount: selectedSnapshot.ux?.length || 0
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📸 Snapshots</h1>
        <p className="text-muted-foreground">
          {snapshots.length} snapshots captured
        </p>
        <button
          onClick={loadSnapshots}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          🔄 Refresh
        </button>
      </header>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin text-4xl">⏳</div>
          <p className="mt-4 text-muted-foreground">Loading snapshots...</p>
        </div>
      ) : snapshots.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📸</div>
          <h2 className="text-2xl font-bold mb-2">No snapshots yet</h2>
          <p className="text-muted-foreground">
            Use the Chrome extension to capture your first snapshot
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              onClick={() => loadSnapshotDetail(snapshot.id)}
              className="bg-card rounded-lg border p-4 hover:border-primary cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{snapshot.title || snapshot.url}</h3>
                  <p className="text-sm text-muted-foreground truncate">{snapshot.url}</p>
                </div>
                <button className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:opacity-90">
                  View
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(snapshot.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
