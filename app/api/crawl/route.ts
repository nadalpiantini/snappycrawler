import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time errors
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(supabaseUrl, supabaseKey)
}

// System user UUID for anonymous/crawler snapshots
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const snapshot = await request.json()

    if (!snapshot.url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Insert snapshot into database
    const { data, error } = await supabase
      .from('snappy_snapshots')
      .insert({
        user_id: SYSTEM_USER_ID,
        url: snapshot.url,
        title: snapshot.title || snapshot.url,
        raw_data: snapshot
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving snapshot:', error)
      return NextResponse.json({ error: 'Failed to save snapshot' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
