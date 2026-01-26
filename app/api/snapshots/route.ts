import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore if called from Server Component
          }
        },
      },
    }
  )
}

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // TEMPORARY: Disable auth requirement to show all snapshots
    // TODO: Re-enable when proper user accounts are set up
    const requireAuth = process.env.NEXT_PUBLIC_ENABLE_AUTH === 'true'

    if (id) {
      // Get single snapshot by ID
      let query = supabase
        .from('snappy_snapshots')
        .select('*')
        .eq('id', id)

      if (requireAuth && user) {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query.single()

      if (error) {
        console.error('Error fetching snapshot:', error)
        return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 })
      }

      return NextResponse.json(data)
    }

    // Get snapshots with project information (limited to 50)
    let query = supabase
      .from('snappy_snapshots')
      .select(`
        id,
        url,
        title,
        created_at,
        snappy_project_snapshots (
          project_id,
          snappy_projects (
            id,
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (requireAuth && user) {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query

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
