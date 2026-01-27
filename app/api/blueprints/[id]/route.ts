import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeBlueprint } from '@/lib/blueprint/analyzer'
import type { RawSnapshot } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get snapshot data
    const { data: snapshot, error: snapshotError } = await supabase
      .from('snappy_snapshots')
      .select('*')
      .eq('id', id)
      .single()

    if (snapshotError || !snapshot) {
      return NextResponse.json(
        { error: 'Snapshot not found' },
        { status: 404 }
      )
    }

    // Check if blueprint already exists in cache (future optimization)
    // For now, generate fresh each time

    const rawData = snapshot.raw_data as RawSnapshot

    // Generate blueprint
    const blueprint = await analyzeBlueprint(rawData)

    return NextResponse.json({
      success: true,
      blueprint,
      snapshot: {
        id: snapshot.id,
        url: snapshot.url,
        title: snapshot.title,
        created_at: snapshot.created_at,
      }
    })

  } catch (error) {
    console.error('Blueprint generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate blueprint' },
      { status: 500 }
    )
  }
}

// POST to regenerate blueprint with specific options
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { depth = 'standard' } = body

    const supabase = await createClient()

    // Get snapshot data
    const { data: snapshot, error: snapshotError } = await supabase
      .from('snappy_snapshots')
      .select('*')
      .eq('id', id)
      .single()

    if (snapshotError || !snapshot) {
      return NextResponse.json(
        { error: 'Snapshot not found' },
        { status: 404 }
      )
    }

    const rawData = snapshot.raw_data as RawSnapshot

    // Generate blueprint with options
    const blueprint = await analyzeBlueprint(rawData)

    return NextResponse.json({
      success: true,
      blueprint,
      depth,
    })

  } catch (error) {
    console.error('Blueprint regeneration error:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate blueprint' },
      { status: 500 }
    )
  }
}
