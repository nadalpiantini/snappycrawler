import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mode: string }> }
) {
  try {
    const { id, mode } = await params
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

    let data: any = null

    switch (mode) {
      case 'snapshot':
        data = {
          html_raw: snapshot.html_raw?.substring(0, 10000),
          text_array: snapshot.text_array?.slice(0, 50),
          layout_tree: snapshot.layout_tree,
          url: snapshot.url,
          page_type: snapshot.page_type
        }
        break

      case 'design':
        if (snapshot.design_analysis) {
          data = snapshot.design_analysis
        }
        break

      case 'ux':
        if (snapshot.ux_analysis) {
          data = snapshot.ux_analysis
        }
        break

      case 'wireframe':
        if (snapshot.wireframe_analysis) {
          data = snapshot.wireframe_analysis
        }
        break

      case 'ai':
        if (snapshot.ai_context) {
          data = snapshot.ai_context
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching mode data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mode data' },
      { status: 500 }
    )
  }
}
