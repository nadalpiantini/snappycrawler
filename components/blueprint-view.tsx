'use client'

import { useState, useEffect } from 'react'
import { Copy, Download, ChevronRight, AlertTriangle, CheckCircle, Info, XCircle, Sparkles, Lightbulb, Target, Layout, Route, Palette, Wrench, GraduationCap } from 'lucide-react'
import type { Blueprint } from '@/lib/blueprint/types'

// ============================================
// MAIN BLUEPRINT VIEW
// ============================================

interface BlueprintViewProps {
  snapshotId: string
}

export function BlueprintView({ snapshotId }: BlueprintViewProps) {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    loadBlueprint()
  }, [snapshotId])

  const loadBlueprint = async () => {
    try {
      const baseUrl = window.location.origin
      const res = await fetch(`${baseUrl}/api/blueprints/${snapshotId}`)

      if (!res.ok) {
        throw new Error('Failed to load blueprint')
      }

      const data = await res.json()
      setBlueprint(data.blueprint)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blueprint')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <BlueprintLoading />
  }

  if (error || !blueprint) {
    return <BlueprintError error={error} snapshotId={snapshotId} onRetry={loadBlueprint} />
  }

  const sections = [
    { id: 'overview', label: 'Overview', icon: Target, description: 'Executive summary' },
    { id: 'intent', label: 'Intent', icon: Lightbulb, description: 'What it tries to do' },
    { id: 'structure', label: 'Structure', icon: Layout, description: 'How it\'s built' },
    { id: 'journey', label: 'Journey', icon: Route, description: 'User path' },
    { id: 'design', label: 'Design DNA', icon: Palette, description: 'Visual personality' },
    { id: 'insights', label: 'Reuse & Improve', icon: Wrench, description: 'What to steal/fix' },
    { id: 'takeaways', label: 'Takeaways', icon: GraduationCap, description: 'Builder lessons' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Blueprint Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Blueprint</h1>
              </div>
              <p className="text-slate-400 max-w-2xl">{blueprint.meta.url}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm font-medium rounded-full capitalize">
                  {blueprint.overview.pageType}
                </span>
                <ClarityBadge level={blueprint.overview.clarityScore} />
                <ComplexityBadge level={blueprint.overview.complexityScore} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
                <Copy className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Narrative Navigation */}
          <nav className="w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4 px-3">
                Blueprint Sections
              </p>
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all
                      ${isActive
                        ? 'bg-blue-500/10 border border-blue-500/20 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                    <div>
                      <span className="font-medium block">{section.label}</span>
                      <span className="text-xs text-slate-500">{section.description}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {activeSection === 'overview' && <OverviewSection blueprint={blueprint} />}
            {activeSection === 'intent' && <IntentSection blueprint={blueprint} />}
            {activeSection === 'structure' && <StructureSection blueprint={blueprint} />}
            {activeSection === 'journey' && <JourneySection blueprint={blueprint} />}
            {activeSection === 'design' && <DesignDNASection blueprint={blueprint} />}
            {activeSection === 'insights' && <InsightsSection blueprint={blueprint} />}
            {activeSection === 'takeaways' && <TakeawaysSection blueprint={blueprint} />}
          </main>
        </div>
      </div>
    </div>
  )
}

// ============================================
// SECTION 1: OVERVIEW
// ============================================

function OverviewSection({ blueprint }: { blueprint: Blueprint }) {
  const { overview } = blueprint

  return (
    <div className="space-y-6">
      {/* One-liner */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6">
        <p className="text-lg text-white leading-relaxed">{overview.oneLiner}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Page Type"
          value={overview.pageType}
          icon="📄"
          capitalize
        />
        <MetricCard
          label="Clarity"
          value={overview.clarityScore}
          icon={overview.clarityScore === 'high' ? '✅' : overview.clarityScore === 'medium' ? '⚠️' : '❌'}
          capitalize
        />
        <MetricCard
          label="Complexity"
          value={overview.complexityScore}
          icon="📊"
          capitalize
        />
        <MetricCard
          label="Interactivity"
          value={overview.interactivityLevel}
          icon="⚡"
          capitalize
        />
      </div>

      {/* Primary Goal */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Primary Goal</h3>
        <p className="text-white text-lg">{overview.primaryGoal}</p>
      </div>

      {/* Alerts */}
      {overview.alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Alerts</h3>
          {overview.alerts.map((alert, i) => (
            <AlertCard key={i} alert={alert} />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// SECTION 2: INTENT
// ============================================

function IntentSection({ blueprint }: { blueprint: Blueprint }) {
  const { intent } = blueprint

  return (
    <div className="space-y-6">
      {/* Primary Action */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">What This Page Wants Users To Do</h3>
        <p className="text-xl text-white">{intent.primaryAction}</p>
      </div>

      {/* Value Proposition */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Value Proposition</h3>
        <p className="text-white italic">"{intent.valueProposition}"</p>
      </div>

      {/* Coherence Score */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Message Coherence</h3>
          <span className="text-2xl font-bold text-white">{Math.round(intent.coherenceScore * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              intent.coherenceScore > 0.7 ? 'bg-green-500' :
              intent.coherenceScore > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${intent.coherenceScore * 100}%` }}
          />
        </div>
        <p className="text-sm text-slate-400 mt-2">
          {intent.coherenceScore > 0.7
            ? 'Message is well-aligned with actions'
            : intent.coherenceScore > 0.4
            ? 'Some misalignment between message and actions'
            : 'Significant coherence issues detected'
          }
        </p>
      </div>

      {/* Target Audience */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Target Audience</h3>
        <div className="flex flex-wrap gap-2">
          {intent.targetAudience.map((audience, i) => (
            <span key={i} className="px-3 py-1.5 bg-slate-800 text-white rounded-full text-sm">
              {audience}
            </span>
          ))}
        </div>
      </div>

      {/* Persuasion Techniques */}
      {intent.persuasionTechniques.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Persuasion Techniques</h3>
          <div className="space-y-3">
            {intent.persuasionTechniques.map((technique, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  technique.effectiveness === 'strong' ? 'bg-green-500/20 text-green-400' :
                  technique.effectiveness === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {technique.effectiveness}
                </span>
                <div>
                  <p className="text-white font-medium">{technique.name}</p>
                  <p className="text-sm text-slate-400">{technique.evidence}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friction Points */}
      {intent.frictionPoints.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Friction Points</h3>
          <div className="space-y-3">
            {intent.frictionPoints.map((fp, i) => (
              <div key={i} className="border-l-4 border-red-500/50 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">{fp.location}</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    fp.impact === 'major' ? 'bg-red-500/20 text-red-400' :
                    fp.impact === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {fp.impact}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{fp.issue}</p>
                <p className="text-blue-400 text-sm mt-1">💡 {fp.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-green-400 uppercase tracking-wider mb-3">✅ Strengths</h3>
          <ul className="space-y-2">
            {intent.strengths.map((strength, i) => (
              <li key={i} className="text-slate-300 text-sm">{strength}</li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider mb-3">⚠️ Weaknesses</h3>
          <ul className="space-y-2">
            {intent.weaknesses.map((weakness, i) => (
              <li key={i} className="text-slate-300 text-sm">{weakness}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ============================================
// SECTION 3: STRUCTURE
// ============================================

function StructureSection({ blueprint }: { blueprint: Blueprint }) {
  const { structure } = blueprint

  return (
    <div className="space-y-6">
      {/* Flow Direction */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Flow Direction</h3>
        <p className="text-xl text-white capitalize">{structure.flowDirection}</p>
        <p className="text-slate-400 text-sm mt-2">
          {structure.flowDirection === 'linear' && 'Content flows top to bottom in a sequential manner'}
          {structure.flowDirection === 'branching' && 'Multiple paths available from main content'}
          {structure.flowDirection === 'circular' && 'Users may return to previous sections'}
          {structure.flowDirection === 'scattered' && 'No clear content flow - may cause confusion'}
        </p>
      </div>

      {/* Sections */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Page Sections</h3>
        <div className="space-y-3">
          {structure.sections.map((section, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg">
              <div className={`w-2 h-10 rounded-full ${
                section.importance === 'critical' ? 'bg-blue-500' :
                section.importance === 'supporting' ? 'bg-slate-500' :
                'bg-slate-700'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium capitalize">{section.type.replace('-', ' ')}</span>
                  <span className="text-xs text-slate-500">{section.position}</span>
                </div>
                <p className="text-sm text-slate-400">{section.label}</p>
              </div>
              <div className="flex items-center gap-2">
                {section.hasContent && <span className="text-xs px-2 py-1 bg-slate-700 rounded">Content</span>}
                {section.hasCta && <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">CTA</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layout Balance */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Layout Balance</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <p className="text-2xl mb-2">⚖️</p>
            <p className="text-sm text-slate-400">Visual Weight</p>
            <p className="text-white font-medium capitalize">{structure.balance.visualWeight}</p>
          </div>
          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <p className="text-2xl mb-2">📐</p>
            <p className="text-sm text-slate-400">Whitespace</p>
            <p className="text-white font-medium capitalize">{structure.balance.whitespace}</p>
          </div>
          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <p className="text-2xl mb-2">📊</p>
            <p className="text-sm text-slate-400">Density</p>
            <p className="text-white font-medium capitalize">{structure.balance.density}</p>
          </div>
        </div>
      </div>

      {/* Patterns */}
      {structure.patterns.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Structural Patterns</h3>
          <div className="space-y-3">
            {structure.patterns.map((pattern, i) => (
              <div key={i} className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-medium">{pattern.name}</span>
                  {pattern.isCommon && (
                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">Common</span>
                  )}
                </div>
                <p className="text-sm text-slate-400">{pattern.effectiveness}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Redundancies */}
      {structure.redundancies.length > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6">
          <h3 className="text-sm font-medium text-yellow-400 uppercase tracking-wider mb-4">⚠️ Redundancies Detected</h3>
          <div className="space-y-3">
            {structure.redundancies.map((redundancy, i) => (
              <div key={i} className="text-slate-300">
                <span className="text-white font-medium">{redundancy.type}</span>
                <span className="text-slate-400"> × {redundancy.count}</span>
                <p className="text-sm text-slate-400 mt-1">💡 {redundancy.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// SECTION 4: JOURNEY
// ============================================

function JourneySection({ blueprint }: { blueprint: Blueprint }) {
  const { journey } = blueprint

  return (
    <div className="space-y-6">
      {/* Journey Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Entry Point" value={journey.entryPoint} icon="🚪" />
        <MetricCard label="Ideal Exit" value={journey.idealExit} icon="🎯" />
        <MetricCard label="Time on Page" value={journey.estimatedTimeOnPage} icon="⏱️" />
        <MetricCard label="Scroll Depth" value={journey.scrollDepthExpected} icon="📜" />
      </div>

      {/* Journey Stages */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">User Journey</h3>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700" />

          <div className="space-y-6">
            {journey.stages.map((stage, i) => (
              <div key={i} className="relative flex gap-6">
                {/* Circle */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10
                  ${stage.emotion === 'ready' ? 'bg-green-500/20 text-green-400' :
                    stage.emotion === 'interested' ? 'bg-blue-500/20 text-blue-400' :
                    stage.emotion === 'hesitant' || stage.emotion === 'confused' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-800 text-slate-400'
                  }
                `}>
                  <span className="font-bold">{stage.order}</span>
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{stage.action}</span>
                      <span className={`text-xs px-2 py-1 rounded capitalize ${
                        stage.emotion === 'ready' ? 'bg-green-500/20 text-green-400' :
                        stage.emotion === 'interested' ? 'bg-blue-500/20 text-blue-400' :
                        stage.emotion === 'curious' ? 'bg-purple-500/20 text-purple-400' :
                        stage.emotion === 'hesitant' || stage.emotion === 'confused' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-700 text-slate-400'
                      }`}>
                        {stage.emotion}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{stage.element}</p>
                    {stage.friction > 0.3 && (
                      <div className="mt-2 flex items-center gap-2 text-yellow-400 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Potential friction point
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drop-off Risks */}
      {journey.dropOffRisks.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
          <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider mb-4">🚨 Drop-off Risks</h3>
          <div className="space-y-4">
            {journey.dropOffRisks.map((risk, i) => (
              <div key={i} className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{risk.location}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    risk.probability === 'high' ? 'bg-red-500/20 text-red-400' :
                    risk.probability === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {risk.probability} probability
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{risk.reason}</p>
                <p className="text-blue-400 text-sm mt-2">💡 {risk.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// SECTION 5: DESIGN DNA
// ============================================

function DesignDNASection({ blueprint }: { blueprint: Blueprint }) {
  const { designDna } = blueprint

  return (
    <div className="space-y-6">
      {/* Personality */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Design Personality</h3>
        <p className="text-xl text-white mb-6">{designDna.personality.description}</p>

        {/* Spectrum */}
        <div className="space-y-4">
          <SpectrumBar label="Minimal" value={designDna.personality.spectrum.minimal} opposite="Dense" oppositeValue={designDna.personality.spectrum.dense} />
          <SpectrumBar label="Conservative" value={designDna.personality.spectrum.conservative} opposite="Expressive" oppositeValue={designDna.personality.spectrum.expressive} />
          <SpectrumBar label="Systematic" value={designDna.personality.spectrum.systematic} opposite="Improvised" oppositeValue={designDna.personality.spectrum.improvised} />
          <SpectrumBar label="Playful" value={designDna.personality.spectrum.playful} opposite="Serious" oppositeValue={designDna.personality.spectrum.serious} />
        </div>
      </div>

      {/* Mood Board */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Mood Board</h3>
        <div className="flex flex-wrap gap-2">
          {designDna.moodBoard.map((word, i) => (
            <span key={i} className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/20 text-white rounded-full">
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Design System Maturity */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Design System</h3>
          <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${
            designDna.system.maturityLevel === 'polished' ? 'bg-green-500/20 text-green-400' :
            designDna.system.maturityLevel === 'developing' ? 'bg-blue-500/20 text-blue-400' :
            designDna.system.maturityLevel === 'inconsistent' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {designDna.system.maturityLevel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <CheckItem label="Consistent Typography" checked={designDna.system.hasConsistentTypography} />
          <CheckItem label="Consistent Spacing" checked={designDna.system.hasConsistentSpacing} />
          <CheckItem label="Color System" checked={designDna.system.hasColorSystem} />
          <CheckItem label="Component Patterns" checked={designDna.system.hasComponentPatterns} />
        </div>

        {designDna.system.observations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-sm font-medium text-slate-400 mb-2">Observations:</p>
            <ul className="space-y-1">
              {designDna.system.observations.map((obs, i) => (
                <li key={i} className="text-sm text-slate-300">• {obs}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Characteristics */}
      {designDna.characteristics.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Design Characteristics</h3>
          <div className="space-y-3">
            {designDna.characteristics.map((char, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <span className={`w-2 h-2 rounded-full mt-2 ${
                  char.impact === 'positive' ? 'bg-green-500' :
                  char.impact === 'negative' ? 'bg-red-500' :
                  'bg-slate-500'
                }`} />
                <div>
                  <p className="text-white font-medium">{char.trait}</p>
                  <p className="text-sm text-slate-400">{char.evidence}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Influences */}
      {designDna.influences.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Design Influences</h3>
          <div className="flex flex-wrap gap-2">
            {designDna.influences.map((influence, i) => (
              <span key={i} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm">
                {influence}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// SECTION 6: INSIGHTS (Reuse & Improve)
// ============================================

function InsightsSection({ blueprint }: { blueprint: Blueprint }) {
  const { insights } = blueprint

  return (
    <div className="space-y-6">
      {/* Steal This */}
      <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-400 mb-4">✨ Steal This</h3>
        <div className="space-y-4">
          {insights.stealThis.map((item, i) => (
            <div key={i} className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{item.what}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  item.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                  item.difficulty === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {item.difficulty}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-2">{item.why}</p>
              <p className="text-sm text-slate-500">📍 {item.where}</p>
              <p className="text-blue-400 text-sm mt-2">→ {item.howToUse}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fix This */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-4">🔧 Fix This</h3>
        <div className="space-y-4">
          {insights.fixThis.map((item, i) => (
            <div key={i} className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{item.issue}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                    item.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {item.impact} impact
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.effort === 'quick-fix' ? 'bg-green-500/20 text-green-400' :
                    item.effort === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {item.effort}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-500">📍 {item.location}</p>
              <p className="text-blue-400 text-sm mt-2">💡 {item.suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reusable Patterns */}
      {insights.patterns.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📋 Reusable Patterns</h3>
          <div className="space-y-4">
            {insights.patterns.map((pattern, i) => (
              <div key={i} className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-white font-medium mb-2">{pattern.name}</p>
                <p className="text-slate-400 text-sm">{pattern.description}</p>
                <div className="mt-3 p-3 bg-slate-900 rounded border border-slate-700">
                  <p className="text-xs text-slate-500 mb-1">Use case:</p>
                  <p className="text-sm text-slate-300">{pattern.useCase}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anti-Patterns */}
      {insights.antiPatterns.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">⚠️ Anti-Patterns to Avoid</h3>
          <div className="space-y-4">
            {insights.antiPatterns.map((ap, i) => (
              <div key={i} className="border-l-4 border-yellow-500/50 pl-4 py-2">
                <p className="text-white font-medium">{ap.name}</p>
                <p className="text-slate-400 text-sm">{ap.issue}</p>
                <p className="text-red-400 text-sm mt-1">❌ {ap.consequence}</p>
                <p className="text-green-400 text-sm">✅ {ap.alternative}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// SECTION 7: TAKEAWAYS
// ============================================

function TakeawaysSection({ blueprint }: { blueprint: Blueprint }) {
  const { takeaways } = blueprint

  return (
    <div className="space-y-6">
      {/* Top Insights */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">💡 Top Insights</h3>
        <div className="space-y-4">
          {takeaways.topInsights.map((insight, i) => (
            <div key={i} className="flex items-start gap-4">
              <span className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                {i + 1}
              </span>
              <div>
                <p className="text-white font-medium">{insight.title}</p>
                <p className="text-slate-400 text-sm">{insight.description}</p>
                <span className="text-xs text-slate-500 mt-1 inline-block capitalize">{insight.applicability}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Errors to Avoid */}
      {takeaways.errorsToAvoid.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">🚫 Errors to Avoid</h3>
          <ul className="space-y-2">
            {takeaways.errorsToAvoid.map((error, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actionable Idea */}
      <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-400 mb-4">🚀 Actionable Idea</h3>
        <div className="mb-4">
          <p className="text-xl text-white font-medium mb-2">{takeaways.actionableIdea.title}</p>
          <p className="text-slate-400">{takeaways.actionableIdea.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm">
            ⏱️ {takeaways.actionableIdea.timeToImplement}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            takeaways.actionableIdea.impact === 'transformative' ? 'bg-green-500/20 text-green-400' :
            takeaways.actionableIdea.impact === 'meaningful' ? 'bg-blue-500/20 text-blue-400' :
            'bg-slate-800 text-slate-300'
          }`}>
            {takeaways.actionableIdea.impact} impact
          </span>
        </div>
      </div>

      {/* Learning Moment */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">📚 Learning Moment</h3>
        <p className="text-slate-300 italic text-lg">"{takeaways.learningMoment}"</p>
      </div>

      {/* Builder Question */}
      <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-purple-400 mb-3">🤔 Ask Yourself</h3>
        <p className="text-white text-xl">{takeaways.builderQuestion}</p>
      </div>
    </div>
  )
}

// ============================================
// HELPER COMPONENTS
// ============================================

function BlueprintLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Generating Blueprint...</p>
        <p className="text-slate-500 text-sm mt-2">Analyzing structure, intent, and patterns</p>
      </div>
    </div>
  )
}

function BlueprintError({ error, snapshotId, onRetry }: { error: string | null; snapshotId: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Blueprint Not Available</h2>
        <p className="text-slate-400 mb-6">{error || 'Unable to generate blueprint for this snapshot'}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors"
        >
          Generate Blueprint
        </button>
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon, capitalize = false }: { label: string; value: string; icon: string; capitalize?: boolean }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-white font-medium ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  )
}

function AlertCard({ alert }: { alert: { type: string; message: string; severity: string } }) {
  const icons = {
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
    error: XCircle,
  }
  const colors = {
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    success: 'bg-green-500/10 border-green-500/20 text-green-400',
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
  }

  const Icon = icons[alert.type as keyof typeof icons] || Info
  const color = colors[alert.type as keyof typeof colors] || colors.info

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${color}`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-slate-200">{alert.message}</p>
        <span className="text-xs opacity-70 capitalize">{alert.severity} severity</span>
      </div>
    </div>
  )
}

function ClarityBadge({ level }: { level: string }) {
  const colors = {
    high: 'bg-green-500/10 text-green-400',
    medium: 'bg-yellow-500/10 text-yellow-400',
    low: 'bg-red-500/10 text-red-400',
  }
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${colors[level as keyof typeof colors] || colors.medium}`}>
      {level} Clarity
    </span>
  )
}

function ComplexityBadge({ level }: { level: string }) {
  return (
    <span className="px-3 py-1 bg-slate-800 text-slate-300 text-sm font-medium rounded-full capitalize">
      {level}
    </span>
  )
}

function SpectrumBar({ label, value, opposite, oppositeValue }: { label: string; value: number; opposite: string; oppositeValue: number }) {
  const leftActive = value > oppositeValue
  return (
    <div className="flex items-center gap-3">
      <span className={`w-24 text-sm text-right ${leftActive ? 'text-white font-medium' : 'text-slate-500'}`}>{label}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full flex">
          <div className="bg-blue-500" style={{ width: `${value}%` }} />
        </div>
      </div>
      <span className={`w-24 text-sm ${!leftActive ? 'text-white font-medium' : 'text-slate-500'}`}>{opposite}</span>
    </div>
  )
}

function CheckItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded flex items-center justify-center ${checked ? 'bg-green-500/20' : 'bg-slate-800'}`}>
        {checked ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-slate-600" />}
      </div>
      <span className={`text-sm ${checked ? 'text-slate-300' : 'text-slate-500'}`}>{label}</span>
    </div>
  )
}

export default BlueprintView
