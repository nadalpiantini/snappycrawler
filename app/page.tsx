'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SnapshotUploader } from '@/components/SnapshotUploader'
import { SnapshotViewer } from '@/components/SnapshotViewer'
import { RawSnapshot } from '@/lib/types'
import { ArrowDown, Chrome, Code2, Sparkles, Globe, Zap, Layers, Download, User, FolderOpen, Menu, X, Github, Twitter, Mail, FileText, Shield, HelpCircle, Upload, Check, AlertCircle, Copy, Route, Bot, Target, ChevronDown } from 'lucide-react'
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
  const [activeSection, setActiveSection] = useState<string>('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

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

    // Scroll spy for active section
    const handleScroll = () => {
      const sections = ['features', 'how-it-works', 'use-cases', 'upload-section']
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleUpload = (data: RawSnapshot) => {
    handleUploadComplete(data)
  }

  const handleReset = () => {
    setSnapshot(null)
  }

  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index)
  }

  const handleUploadStart = () => {
    setIsUploading(true)
  }

  const handleUploadComplete = (data: RawSnapshot) => {
    setIsUploading(false)
    setSnapshot(data)
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
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" asChild>
                <a href="/snappy-extension.zip?v=2.0.1" download>
                  <Download className="w-4 h-4 mr-1" />
                  Download Extension
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
              <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10" onClick={scrollToUpload}>
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
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8" asChild>
                  <a href="/snappy-extension.zip?v=2.0.1" download>
                    <Download className="w-5 h-5 mr-2" />
                    Download Extension
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 text-lg px-8" onClick={scrollToUpload}>
                  Upload Snapshot
                  <ArrowDown className="w-5 h-5 ml-2" />
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

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection('features')}
                className={`text-sm font-medium transition-colors min-h-[44px] px-3 flex items-center ${
                  activeSection === 'features' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className={`text-sm font-medium transition-colors min-h-[44px] px-3 flex items-center ${
                  activeSection === 'how-it-works' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('use-cases')}
                className={`text-sm font-medium transition-colors min-h-[44px] px-3 flex items-center ${
                  activeSection === 'use-cases' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Use Cases
              </button>
              <button
                onClick={() => scrollToSection('upload-section')}
                className={`text-sm font-medium transition-colors min-h-[44px] px-3 flex items-center ${
                  activeSection === 'upload-section' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Try It
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-left text-sm font-medium py-3 px-4 hover:bg-muted rounded-lg min-h-[44px] flex items-center"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-left text-sm font-medium py-3 px-4 hover:bg-muted rounded-lg min-h-[44px] flex items-center"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection('use-cases')}
                  className="text-left text-sm font-medium py-3 px-4 hover:bg-muted rounded-lg min-h-[44px] flex items-center"
                >
                  Use Cases
                </button>
                <button
                  onClick={() => scrollToSection('upload-section')}
                  className="text-left text-sm font-medium py-3 px-4 hover:bg-muted rounded-lg min-h-[44px] flex items-center"
                >
                  Try It
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Key Feature: Auto-Crawl */}
      <section id="features" className="py-16 bg-primary/10 border-y border-primary/20">
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
                <a href="/snappy-extension.zip?v=2.0.1" download className="text-primary hover:underline">Download the extension</a>, load it in Chrome. Enter a URL — Snappy crawls automatically.
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

      {/* Use Cases */}
      <section id="use-cases" className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            What You Can Build
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Real examples of what developers are building with Snappy
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Copy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Clone Any Landing</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Capture a reference page, extract component specs, rebuild it cleaner in your stack.
              </p>
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <span className="font-medium">Example:</span> Capture Vercel's landing, extract hero section, rebuild with Next.js + Tailwind
              </div>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Route className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Extract UX Flows</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Snapshot a multi-step flow, get step-by-step UX logic, implement in your app.
              </p>
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <span className="font-medium">Example:</span> Stripe checkout flow → 5 steps → Auth → Payment → Confirmation
              </div>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">AI Code Generation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Feed normalized specs to GPT/Claude. Get accurate, structured code output.
              </p>
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <span className="font-medium">Example:</span> Prompt: "Build this component" + Snappy spec → React code
              </div>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Site-Wide Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crawl entire domains. Understand their information architecture at scale.
              </p>
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <span className="font-medium">Example:</span> Crawl 50+ pages → Map navigation → Identify content patterns
              </div>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Rapid Prototyping</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start from a working reference instead of blank canvas. Ship faster.
              </p>
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <span className="font-medium">Example:</span> Reference site → Extract layout → Customize → Deploy
              </div>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Competitive Intel</h3>
              <p className="text-sm text-muted-foreground mb-4">
                See how competitors structure their sites. Learn from their patterns.
              </p>
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <span className="font-medium">Example:</span> Analyze top 5 competitors → Compare IA → Find gaps
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <HelpCircle className="w-4 h-4" />
                FAQ
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about Snappy
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "What browsers does Snappy support?",
                  a: "Snappy currently works with Chrome and Chromium-based browsers (Edge, Brave, Opera). We're working on Firefox and Safari support."
                },
                {
                  q: "Is my data private and secure?",
                  a: "Yes. All snapshots are stored securely in your own database. We don't access or analyze your captured data unless you explicitly share it."
                },
                {
                  q: "Can I use Snappy for commercial projects?",
                  a: "Absolutely. Snappy is perfect for commercial work - clone landing pages, analyze competitors, extract UX patterns for client projects."
                },
                {
                  q: "What's the difference between Free and Pro?",
                  a: "Free tier includes basic snapshots and manual crawling. Pro adds auto-crawl, visual previews, text extraction, and AI-ready JSON exports."
                },
                {
                  q: "How does auto-crawl work?",
                  a: "Enter a domain URL and Snappy automatically discovers and crawls all linked pages (up to 50 pages). It respects same-domain filtering and saves everything to your gallery."
                },
                {
                  q: "Can I export the data?",
                  a: "Yes. Each snapshot can be downloaded as JSON. Pro users can batch export entire domains and get CSV exports for analysis."
                }
              ].map((faq, index) => (
                <div key={index} className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors min-h-[56px]"
                    aria-expanded={faqOpen === index}
                  >
                    <span className="font-semibold pr-4">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                        faqOpen === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {faqOpen === index && (
                    <div className="px-6 pb-6 text-muted-foreground">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
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
            <p className="text-muted-foreground text-center mb-8">
              Upload a snapshot generated by the Snappy Chrome extension
            </p>

            {/* Extension CTA Box */}
            <div className="mb-8 p-6 bg-primary/10 border border-primary/30 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Need the Extension First?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download the Snappy Chrome extension to capture any website automatically.
                  </p>
                  <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                    <a href="/snappy-extension.zip?v=2.0.1" download>
                      <Download className="w-4 h-4 mr-2" />
                      Download Extension
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <SnapshotUploader onUpload={handleUpload} />

            {/* Requirements with Tooltips */}
            <div className="mt-8 p-6 bg-card rounded-xl border border-border">
              <h3 className="font-semibold mb-4">File Requirements</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2 group">
                  <span className="text-primary mt-0.5">&#10003;</span>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">JSON format (.json)</span>
                    <p className="text-xs mt-1 opacity-70">Standard JSON file with proper syntax</p>
                  </div>
                  <HelpCircle className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
                </li>
                <li className="flex items-start gap-2 group">
                  <span className="text-primary mt-0.5">&#10003;</span>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Max 10MB file size</span>
                    <p className="text-xs mt-1 opacity-70">Ensures fast upload and processing</p>
                  </div>
                  <HelpCircle className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
                </li>
                <li className="flex items-start gap-2 group">
                  <span className="text-primary mt-0.5">&#10003;</span>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Must include: url, html, text[]</span>
                    <p className="text-xs mt-1 opacity-70">Core fields for snapshot processing</p>
                  </div>
                  <HelpCircle className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
                </li>
                <li className="flex items-start gap-2 group">
                  <span className="text-primary mt-0.5">&#10003;</span>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Generated by Snappy Extension</span>
                    <p className="text-xs mt-1 opacity-70">Ensures consistent data structure</p>
                  </div>
                  <HelpCircle className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/logo.png"
                  alt="Snappy"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="font-semibold text-lg">Snappy</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Capture. Extract. Build. The fastest way to turn any website into production-ready code.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/nadalpiantini/snappycrawler"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com/snappycrawler"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="mailto:hello@snappycrawler.com"
                  className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="/snappy-extension.zip" download className="text-muted-foreground hover:text-foreground transition-colors">
                    Download Extension
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#use-cases" className="text-muted-foreground hover:text-foreground transition-colors">
                    Use Cases
                  </a>
                </li>
                <li>
                  <Link href="/snapshots" className="text-muted-foreground hover:text-foreground transition-colors">
                    Gallery
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>&copy; 2025 Snappy. Built with Next.js + Supabase + Tailwind</p>
              <p>Made with love for developers who ship fast</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
