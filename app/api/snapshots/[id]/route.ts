import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: snapshot, error } = await supabase
      .from('snapshots')
      .select('*')
      .eq('snapshot_id', id)
      .single()

    if (error) throw error
    if (!snapshot) {
      return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 })
    }

    // Get completed modes
    const modesCompleted: string[] = []
    if (snapshot.snapshot_analysis) modesCompleted.push('snapshot')
    if (snapshot.design_analysis) modesCompleted.push('design')
    if (snapshot.ux_analysis) modesCompleted.push('ux')
    if (snapshot.wireframe_analysis) modesCompleted.push('wireframe')
    if (snapshot.ai_context) modesCompleted.push('ai')

    return NextResponse.json({
      snapshot: {
        ...snapshot,
        modes_completed: modesCompleted
      }
    })
  } catch (error) {
    console.error('Error fetching snapshot:', error)
    return NextResponse.json(
      { error: 'Failed to fetch snapshot' },
      { status: 500 }
    )
  }
}
