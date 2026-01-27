import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeDesign } from '@/lib/design-forensics/analyzer'
import { analyzeUX } from '@/lib/ux-intelligence/analyzer'
import { analyzeWireframe } from '@/lib/wireframe-engine/analyzer'
import { analyzeAIContext } from '@/lib/ai-context/analyzer'
import { transformHTMLToDesignStyles } from '@/lib/transformers/design'
import { transformHTMLToUXData } from '@/lib/transformers/ux'
import { transformHTMLToWireframeInput } from '@/lib/transformers/wireframe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { snapshot_id, modes } = body

    if (!snapshot_id || !modes || !Array.isArray(modes)) {
      return NextResponse.json(
        { error: 'Invalid request. Missing snapshot_id or modes' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: snapshot, error } = await supabase
      .from('snapshots')
      .select('*')
      .eq('snapshot_id', snapshot_id)
      .single()

    if (error || !snapshot) {
      return NextResponse.json(
        { error: 'Snapshot not found' },
        { status: 404 }
      )
    }

    const results: Record<string, any> = {}
    const snap = snapshot as any // Use any to avoid type issues

    // Process each requested mode
    for (const mode of modes) {
      try {
        switch (mode) {
          case 'snapshot':
            // Snapshot data already exists from capture
            results.snapshot = { success: true }
            break

          case 'design': {
            // Transform HTML to CapturedDesignStyles
            const designStyles = await transformHTMLToDesignStyles(
              snap.html_raw || '',
              snap.url
            )

            const designResult = await analyzeDesign(
              designStyles,
              snap.url
            )
            results.design = designResult

            // Update database
            await supabase
              .from('snapshots')
              .update({ design_analysis: designResult })
              .eq('snapshot_id', snapshot_id)
            break
          }

          case 'ux': {
            // Transform HTML to CapturedUXData
            const uxData = transformHTMLToUXData(
              snap.html_raw || '',
              snap.url
            )

            const uxResult = analyzeUX(
              uxData,
              snap.url
            )
            results.ux = uxResult

            // Update database
            await supabase
              .from('snapshots')
              .update({ ux_analysis: uxResult })
              .eq('snapshot_id', snapshot_id)
            break
          }

          case 'wireframe': {
            // Transform HTML to WireframeInput
            const wireframeInput = transformHTMLToWireframeInput(
              snap.html_raw || '',
              snap.url,
              snap.ux_analysis
            )

            const wireframeResult = await analyzeWireframe(
              wireframeInput
            )
            results.wireframe = wireframeResult

            // Update database
            await supabase
              .from('snapshots')
              .update({ wireframe_analysis: wireframeResult })
              .eq('snapshot_id', snapshot_id)
            break
          }

          case 'ai': {
            // Use existing analysis results
            const aiResult = await analyzeAIContext({
              snapshot: {
                html: snap.html_raw || '',
                title: snap.title || '',
                text: snap.text_array || [],
                ux: [],  // UX events array - empty for database snapshots
                url: snap.url,
                page_type: snap.page_type || 'unknown'
              },
              designTokens: snap.design_analysis,
              uxAnalysis: snap.ux_analysis
            })
            results.ai = aiResult

            // Update database
            await supabase
              .from('snapshots')
              .update({ ai_context: aiResult })
              .eq('snapshot_id', snapshot_id)
            break
          }

          default:
            results[mode] = { success: false, error: 'Unknown mode' }
        }
      } catch (modeError) {
        console.error(`Error processing mode ${mode}:`, modeError)
        results[mode] = {
          success: false,
          error: modeError instanceof Error ? modeError.message : 'Unknown error'
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Processed ${modes.length} mode(s)`
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
