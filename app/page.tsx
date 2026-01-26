'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SnapshotUploader } from '@/components/SnapshotUploader'
import { SnapshotViewer } from '@/components/SnapshotViewer'
import { RawSnapshot } from '@/lib/types'
import { ArrowDown, Chrome, Code2, Sparkles, Globe, Zap, Layers, Download, User, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/browser'
import { Header } from '@/components/Header'

const HERO_VIDEOS = [
  '/videos/hero-1.mp4',
  '/videos/hero-2.mp4',
  '/videos/hero-3.mp4',
]

export default function HomePage() {
  const [snapshot, setSnapshot] = useState<RawSnapshot | null>(null)
  const [videoSrc, setVideoSrc] = useState<string>('')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  const supabase = createClient()

  useEffect(() => {
    // Random video on each page load
    const randomIndex = Math.floor(Math.random() * HERO_VIDEOS.length)
    setVideoSrc(HERO_VIDEOS[randomIndex])

    // Check auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }
    checkAuth()
  }, [])

  const handleUpload = (data: RawSnapshot) => {
    setSnapshot(data)
  }

  const handleReset = () => {
    setSnapshot(null)
  }

  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (snapshot) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="app" />
        <div className="container mx-auto px-4 py-8">
          {/* Viewer Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Snapshot Ready</h2>
              <p className="text-muted-foreground truncate max-w-xl">{snapshot.url}</p>
            </div>
            <Button variant="outline" onClick={handleReset}>
              New Snapshot
            </Button>
          </div>

          {/* Viewer */}
          <SnapshotViewer snapshot={snapshot} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Video Background */}
      <section className="video-hero">
        {videoSrc && (
          <video
            autoPlay
            muted
            loop
            playsInline
            key={videoSrc}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
        <div className="video-overlay" />

        <div className="hero-content min-h-screen flex flex-col">
          {/* Navigation */}
          <header className="container mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/images/logo.png"
                alt="Snappy"
                width={240}
                height={240}
                className="rounded-xl w-20 h-20 sm:w-28 sm:h-28 md:w-[180px] md:h-[180px] lg:w-[240px] lg:h-[240px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10" asChild>
                <a href="/snappy-extension.zip" download>
                  <Download className="w-4 h-4 mr-1" />
                  Extension
                </a>
              </Button>
              {isLoggedIn === null ? (
                <div className="w-28 h-8 bg-white/10 rounded-md animate-pulse" />
              ) : isLoggedIn ? (
                <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10" asChild>
                  <Link href="/snapshots">
                    <FolderOpen className="w-4 h-4 mr-1" />
                    My Snapshots
                  </Link>
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10" asChild>
                  <Link href="/login">
                    <User className="w-4 h-4 mr-1" />
                    Login
                  </Link>
                </Button>
              )}
              <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={scrollToUpload}>
                Try Now
              </Button>
            </div>
          </header>

          {/* Hero Content */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-4xl mx-auto hero-text">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                Capture. Extract.{' '}
                <span className="text-primary glow-green">Build.</span>
              </h1>

              <p className="text-xl md:text-2xl text-white/80 mb-4 max-w-2xl mx-auto">
                Point it at any domain. Get component structure, UX flows, and production-ready specs.
              </p>

              <p className="text-base text-white/60 mb-10">
                Automatic full-site crawling. One click, entire .com captured.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8" onClick={scrollToUpload}>
                  Upload Snapshot
                  <ArrowDown className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 text-lg px-8" asChild>
                  <a href="#how-it-works">
                    How It Works
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="pb-8 flex justify-center">
            <button
              onClick={scrollToUpload}
              className="text-white/40 hover:text-white/60 transition-colors animate-bounce"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Key Feature: Auto-Crawl */}
      <section className="py-16 bg-primary/10 border-y border-primary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Automatic Site Crawling
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Point at a domain. Capture everything.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Enter any URL and Snappy crawls the entire site automatically.
              Every page, every component, every flow — captured and normalized.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 text-left">
              <div className="bg-card p-5 rounded-xl border border-border">
                <Globe className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Full Domain Crawl</h3>
                <p className="text-sm text-muted-foreground">
                  Up to 50+ pages per domain. Respects same-domain filtering.
                </p>
              </div>
              <div className="bg-card p-5 rounded-xl border border-border">
                <Layers className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Link Discovery</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically extracts and follows internal links.
                </p>
              </div>
              <div className="bg-card p-5 rounded-xl border border-border">
                <Zap className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Batch Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Saves all snapshots to database. Download or process later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            Three steps from any webpage to clean code specifications
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center p-8 rounded-xl bg-background border border-border">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Chrome className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Capture</h3>
              <p className="text-muted-foreground">
                <a href="/snappy-extension.zip" download className="text-primary hover:underline">Download the extension</a>, load it in Chrome. Enter a URL — Snappy crawls automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center p-8 rounded-xl bg-background border border-border">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Code2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Extract</h3>
              <p className="text-muted-foreground">
                Snappy normalizes each page into components, hierarchy, and UX flow specifications.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center p-8 rounded-xl bg-background border border-border">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Build</h3>
              <p className="text-muted-foreground">
                Feed specs to your LLM. Get React, Next.js, Tailwind code. No hallucinations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Try It Now
            </h2>
            <p className="text-muted-foreground text-center mb-12">
              Upload a snapshot from the Snappy Chrome extension
            </p>

            <SnapshotUploader onUpload={handleUpload} />

            {/* Requirements */}
            <div className="mt-8 p-6 bg-card rounded-xl border border-border">
              <h3 className="font-semibold mb-4">Snapshot Requirements</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">&#10003;</span>
                  JSON format (.json)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">&#10003;</span>
                  Max 10MB file size
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">&#10003;</span>
                  Must include: url, html, text[]
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">&#10003;</span>
                  Generated by Snappy Extension
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            What You Can Build
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="p-6 bg-background rounded-xl border border-border">
              <h3 className="font-semibold mb-2">Clone Any Landing</h3>
              <p className="text-sm text-muted-foreground">
                Capture a reference page, extract component specs, rebuild it cleaner in your stack.
              </p>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border">
              <h3 className="font-semibold mb-2">Extract UX Flows</h3>
              <p className="text-sm text-muted-foreground">
                Snapshot a multi-step flow, get step-by-step UX logic, implement in your app.
              </p>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border">
              <h3 className="font-semibold mb-2">AI Code Generation</h3>
              <p className="text-sm text-muted-foreground">
                Feed normalized specs to GPT/Claude. Get accurate, structured code output.
              </p>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border">
              <h3 className="font-semibold mb-2">Site-Wide Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Crawl entire domains. Understand their information architecture at scale.
              </p>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border">
              <h3 className="font-semibold mb-2">Rapid Prototyping</h3>
              <p className="text-sm text-muted-foreground">
                Start from a working reference instead of blank canvas. Ship faster.
              </p>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border">
              <h3 className="font-semibold mb-2">Competitive Intel</h3>
              <p className="text-sm text-muted-foreground">
                See how competitors structure their sites. Learn from their patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Snappy"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="font-semibold">Snappy</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Built with Next.js + Supabase + Tailwind</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
