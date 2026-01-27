import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { compareSnapshots } from '@/lib/compare/analyzer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { snapshot_ids } = body

    if (!snapshot_ids || !Array.isArray(snapshot_ids) || snapshot_ids.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 snapshot IDs required' },
        { status: 400 }
      )
    }

    if (snapshot_ids.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 snapshots can be compared at once' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch all snapshots
    const { data: snapshots, error } = await supabase
      .from('snapshots')
      .select('*')
      .in('snapshot_id', snapshot_ids)

    if (error) throw error
    if (!snapshots || snapshots.length === 0) {
      return NextResponse.json(
        { error: 'Snapshots not found' },
        { status: 404 }
      )
    }

    // Run comparison analysis
    const comparison = await compareSnapshots({
      snapshots: snapshots.map(s => ({
        html: s.html_raw || '',
        title: s.title || '',
        text: s.text_array || [],
        ux: [],  // UX events array - empty for database snapshots
        url: s.url,
        page_type: s.page_type,
        timestamp: s.created_at
      }))
    })

    return NextResponse.json({
      success: true,
      comparison: {
        snapshot_ids,
        ...comparison
      }
    })
  } catch (error) {
    console.error('Comparison error:', error)
    return NextResponse.json(
      { error: 'Comparison failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
