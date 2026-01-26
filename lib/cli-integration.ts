// ============================================
// CLI INTEGRATION LAYER
// Connects CLI commands with actual module functions
// ============================================

import { analyzeDesign } from '../design-forensics/index'
import { analyzeUX } from '../ux-intelligence/index'
import { analyzeWireframe } from '../wireframe-engine/index'
import { analyzeAIContext } from '../ai-context/index'
import { compareSnapshots as compareSnapshotsModule } from '../compare/index'
import { analyzeWithBrain } from '../brain-llm/index'
import { analyzeCopySemantics } from '../copy-semantics/index'
import { analyzeVisualHierarchy } from '../visual-hierarchy/index'

// ============================================
// EXPORT FUNCTIONS FOR CLI
// ============================================

export async function analyzeDesignFromSnapshot(snapshot: any): Promise<any> {
  try {
    const designStyles = snapshot.designStyles || {}
    const result = await analyzeDesign(snapshot)

    return {
      colors: result.colors || {},
      typography: result.typography || {},
      spacing: result.spacing || {},
      tokens: result.tokens || {}
    }
  } catch (error) {
    console.error('Design analysis error:', error)
    return {
      colors: {},
      typography: {},
      spacing: {},
      tokens: {}
    }
  }
}

export async function analyzeUXFromSnapshot(snapshot: any): Promise<any> {
  try {
    const uxData = snapshot.uxData || {}
    const result = await analyzeUX(snapshot)

    return {
      ctas: result.ctaAnalysis?.ctas || [],
      forms: result.formAnalysis?.forms || [],
      navigation: result.navigationAnalysis?.structure || [],
      accessibility: result.accessibilityAnalysis || { score: 50 },
      flows: result.userFlowAnalysis?.flows || []
    }
  } catch (error) {
    console.error('UX analysis error:', error)
    return {
      ctas: [],
      forms: [],
      navigation: [],
      accessibility: { score: 50 },
      flows: []
    }
  }
}

export async function analyzeWireframeFromSnapshot(snapshot: any): Promise<any> {
  try {
    const result = await analyzeWireframe({ snapshot })

    return {
      structure: result.structure,
      blocks: result.blocks,
      flows: result.flows,
      rationale: result.rationale
    }
  } catch (error) {
    console.error('Wireframe analysis error:', error)
    return {
      structure: { type: 'single-column', columns: 1 },
      blocks: [],
      flows: [],
      rationale: {}
    }
  }
}

export async function analyzeAIContextFromSnapshot(snapshot: any): Promise<any> {
  try {
    const result = await analyzeAIContext({ snapshot })

    return {
      systemBrief: result.systemBrief,
      codeSchema: result.codeSchema,
      constraints: result.constraints,
      suggestedTasks: result.suggestedTasks,
      systemPrompts: result.systemPrompts
    }
  } catch (error) {
    console.error('AI Context analysis error:', error)
    return {
      systemBrief: {},
      codeSchema: { components: [] },
      constraints: { technical: [] },
      suggestedTasks: { implementation: [] },
      systemPrompts: {}
    }
  }
}

export async function compareSnapshotsFromDB(snapshot1: any, snapshot2: any): Promise<any> {
  try {
    const result = await compareSnapshotsModule({
      snapshots: [snapshot1, snapshot2]
    })

    return result
  } catch (error) {
    console.error('Compare error:', error)
    return {
      meta: {},
      visualDiff: {},
      uxComparison: {},
      contentComparison: {},
      technicalComparison: {},
      opportunities: [],
      recommendations: []
    }
  }
}

export async function runBrainAnalysis(snapshot: any, modes: any[]): Promise<any> {
  try {
    const brainInput: any = { snapshot }

    // Add modes if available
    if (modes.includes('wireframe')) {
      brainInput.wireframe = await analyzeWireframeFromSnapshot(snapshot)
    }
    if (modes.includes('ai')) {
      brainInput.aiContext = await analyzeAIContextFromSnapshot(snapshot)
    }

    const result = await analyzeWithBrain(brainInput)

    return result
  } catch (error) {
    console.error('Brain analysis error:', error)
    return {
      meta: {},
      insights: [],
      patterns: [],
      intentInference: {},
      crossModeFindings: [],
      explanations: []
    }
  }
}

export async function runFullAnalysis(snapshot: any): Promise<any> {
  try {
    const results: any = {}

    // Run all analysis modes in parallel
    const [
      design,
      ux,
      wireframe,
      aiContext
    ] = await Promise.all([
      analyzeDesignFromSnapshot(snapshot),
      analyzeUXFromSnapshot(snapshot),
      analyzeWireframeFromSnapshot(snapshot),
      analyzeAIContextFromSnapshot(snapshot)
    ])

    results.design = design
    results.ux = ux
    results.wireframe = wireframe
    results.aiContext = aiContext

    // Run brain analysis with all modes
    results.brain = await runBrainAnalysis(snapshot, ['wireframe', 'ai'])

    // Add copy semantics and visual hierarchy
    results.copySemantics = await analyzeCopySemantics(snapshot)
    results.visualHierarchy = await analyzeVisualHierarchy(snapshot)

    return results
  } catch (error) {
    console.error('Full analysis error:', error)
    return {
      error: error.message,
      design: {},
      ux: {},
      wireframe: {},
      aiContext: {},
      brain: {},
      copySemantics: {},
      visualHierarchy: {}
    }
  }
}
