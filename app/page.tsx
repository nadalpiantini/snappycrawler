'use client'

import { useState } from 'react'
import { SnapshotUploader } from '@/components/SnapshotUploader'
import { SnapshotViewer } from '@/components/SnapshotViewer'
import { RawSnapshot } from '@/lib/types'
import { Camera, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const [snapshot, setSnapshot] = useState<RawSnapshot | null>(null)

  const handleUpload = (data: RawSnapshot) => {
    setSnapshot(data)
  }

  const handleReset = () => {
    setSnapshot(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary rounded-lg">
            <Camera className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Snappy</h1>
            <p className="text-sm text-muted-foreground">Turn pages into code specifications</p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a
            href="https://github.com/snappy-platform/snappy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </Button>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto">
        {!snapshot ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold tracking-tight">
                Transform Web Pages into
                <span className="text-primary"> Structured Code</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Capture any webpage, extract its structure and UX flows, then generate
                clean, production-ready code with AI.
              </p>
            </div>

            {/* Upload Section */}
            <SnapshotUploader onUpload={handleUpload} />

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-card rounded-lg border">
                <div className="text-4xl mb-3">📸</div>
                <h3 className="font-semibold mb-2">Capture</h3>
                <p className="text-sm text-muted-foreground">
                  Use the Chrome extension or bookmarklet to capture any webpage
                </p>
              </div>
              <div className="p-6 bg-card rounded-lg border">
                <div className="text-4xl mb-3">🔄</div>
                <h3 className="font-semibold mb-2">Normalize</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically extract structure, components, and UX flows
                </p>
              </div>
              <div className="p-6 bg-card rounded-lg border">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="font-semibold mb-2">Sanitize</h3>
                <p className="text-sm text-muted-foreground">
                  Remove branding and copyright, keep only functional logic
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Snapshot Loaded</h2>
                <p className="text-muted-foreground">
                  {snapshot.url}
                </p>
              </div>
              <Button variant="outline" onClick={handleReset}>
                Upload New
              </Button>
            </div>

            {/* Viewer */}
            <SnapshotViewer snapshot={snapshot} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>
          Built with{' '}
          <a href="https://nextjs.org" className="underline hover:text-foreground">
            Next.js
          </a>
          {' + '}
          <a href="https://supabase.com" className="underline hover:text-foreground">
            Supabase
          </a>
          {' + '}
          <a href="https://tailwindcss.com" className="underline hover:text-foreground">
            Tailwind CSS
          </a>
        </p>
        <p className="mt-2">
          MIT License •{' '}
          <a
            href="https://github.com/snappy-platform/snappy"
            className="underline hover:text-foreground"
          >
            Source Code
          </a>
        </p>
      </footer>
    </div>
  )
}
