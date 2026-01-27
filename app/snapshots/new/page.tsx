'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewSnapshotPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [crawling, setCrawling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) {
      setError('Please enter a URL')
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)')
      return
    }

    setError(null)
    setCrawling(true)

    try {
      const baseUrl = window.location.origin
      const res = await fetch(`${baseUrl}/api/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Crawl failed')
      }

      const data = await res.json()

      // Redirect to the new snapshot
      router.push(`/snapshots/${data.snapshot_id}`)
    } catch (err) {
      console.error('Crawl error:', err)
      setError(err instanceof Error ? err.message : 'Failed to crawl URL')
    } finally {
      setCrawling(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-white">SnappyCrawler</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Snapshot</h1>
          <p className="text-slate-400">
            Enter a URL to crawl and analyze its design, UX, and structure
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <label htmlFor="url" className="block text-sm font-medium text-white mb-2">
              URL to Crawl
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={crawling}
            />
            <p className="mt-2 text-sm text-slate-400">
              Enter the full URL including https:// or http://
            </p>
          </div>

          {/* Options */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Crawl Options</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Full Site Crawl</p>
                  <p className="text-sm text-slate-400">Crawl all pages on the domain (up to 50)</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Auto-run Analysis</p>
                  <p className="text-sm text-slate-400">Automatically run all analysis modes</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Save Screenshots</p>
                  <p className="text-sm text-slate-400">Capture visual previews of each page</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={crawling || !url}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {crawling ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Crawling...
              </span>
            ) : (
              'Start Crawling'
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-600/10 border border-blue-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">What happens next?</h3>
          <ol className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-medium">1</span>
              <span>We crawl the URL and extract HTML, text, and structure</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-medium">2</span>
              <span>Design Forensics extracts colors, fonts, spacing, and components</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-medium">3</span>
              <span>UX Intelligence identifies flows, patterns, and friction points</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-medium">4</span>
              <span>Wireframe Engine generates layout structure and visual hierarchy</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-medium">5</span>
              <span>AI Context Pack creates optimized prompts for LLMs</span>
            </li>
          </ol>
        </div>

        {/* Cancel Button */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
