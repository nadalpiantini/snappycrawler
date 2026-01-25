import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS for reading
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Get single snapshot by ID
      const { data, error } = await supabase
        .from('snappy_snapshots')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching snapshot:', error)
        return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 })
      }

      return NextResponse.json(data)
    }

    // Get all snapshots (limited to 50)
    const { data, error } = await supabase
      .from('snappy_snapshots')
      .select('id, url, title, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching snapshots:', error)
      return NextResponse.json({ error: 'Failed to fetch snapshots' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
