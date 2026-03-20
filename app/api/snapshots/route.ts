import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
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
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
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

// Service role client for when auth is disabled
function getServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: Request) {
  try {
    // Auth requirement controlled via NEXT_PUBLIC_ENABLE_AUTH env var
    const requireAuth = process.env.NEXT_PUBLIC_ENABLE_AUTH === 'true'

    // Use service role when auth is disabled to bypass RLS
    const supabase = requireAuth ? await getSupabaseClient() : getServiceRoleClient()

    // Get current user (only if auth is required)
    let user = null
    let authError = null

    if (requireAuth) {
      const userData = await supabase.auth.getUser()
      user = userData.data.user
      authError = userData.error
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Get single snapshot by ID with normalized data
      let query = supabase
        .from('snappy_snapshots')
        .select(`
          *,
          snappy_normalized_snapshots (
            design_analysis,
            ux_analysis
          )
        `)
        .eq('id', id)

      if (requireAuth && user) {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query.single()

      if (error) {
        console.error('Error fetching snapshot:', error)
        return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 })
      }

      // Flatten normalized data for easier access
      const normalized = data.snappy_normalized_snapshots?.[0] || {}
      const result = {
        ...data,
        design_analysis: normalized.design_analysis || null,
        ux_analysis: normalized.ux_analysis || null
      }
      delete (result as any).snappy_normalized_snapshots

      return NextResponse.json(result)
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