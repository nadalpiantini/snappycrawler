import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { analyzeDesign, validateCapturedStyles } from '@/lib/design-forensics'
import { analyzeUX, validateCapturedData, generateUXSummary } from '@/lib/ux-intelligence'
import type { CapturedUXData } from '@/lib/ux-intelligence'

// Initialize Supabase client lazily to avoid build-time errors
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()
  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    return NextResponse.json({}, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const snapshot = await request.json()

    // Validate required fields
    if (!snapshot.url || !snapshot.html || !Array.isArray(snapshot.text)) {
      return NextResponse.json(
        { error: 'Invalid snapshot format. Missing: url, html, or text array' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Get user from auth header (optional, for anonymous snapshots generate system ID)
    const authHeader = request.headers.get('authorization')
    let userId = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id || null
    }

    // For anonymous snapshots (no auth), use a system user ID
    if (!userId) {
      // Use a consistent UUID for anonymous/system snapshots
      userId = '00000000-0000-0000-0000-000000000000'
    }

    // Insert snapshot
    const { data: snapData, error: snapError } = await supabase
      .from('snappy_snapshots')
      .insert({
        user_id: userId,
        url: snapshot.url,
        title: snapshot.title || snapshot.url,
        raw_data: snapshot
      })
      .select()
      .single()

    if (snapError) {
      console.error('Supabase insert error:', snapError)
      throw new Error('Failed to save snapshot')
    }

    // Check if normalization is needed
    const shouldNormalize = true // Always normalize for now
    const normalized = {
      url: snapshot.url,
      title: snapshot.title || snapshot.url,
      description: snapshot.text?.slice(0, 500)?.join(' ') || '',
      headings: snapshot.html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || [],
      links: extractLinks(snapshot.html) || [],
      images: snapshot.html.match(/<img[^>]+src=["']([^"']+)["']/gi) || [],
      forms: snapshot.html.match(/<form[^>]*>[\s\S]*?<\/form>/gi) || []
    }

    // Run Design Forensics analysis if design styles are captured
    let designAnalysis = null
    if (snapshot.designStyles && validateCapturedStyles(snapshot.designStyles)) {
      try {
        designAnalysis = await analyzeDesign(snapshot.designStyles, snapshot.url)
      } catch (analysisError) {
        console.error('Design Forensics analysis error:', analysisError)
        // Don't fail the request, just skip design analysis
      }
    }

    // Run UX Intelligence analysis if UX data is captured
    let uxAnalysis = null
    if (snapshot.uxData && validateCapturedData(snapshot.uxData as CapturedUXData)) {
      try {
        uxAnalysis = analyzeUX(snapshot.uxData as CapturedUXData, snapshot.url)
      } catch (uxError) {
        console.error('UX Intelligence analysis error:', uxError)
        // Don't fail the request, just skip UX analysis
      }
    }

    // Insert normalized snapshot with design analysis and UX analysis
    const { error: normError } = await supabase
      .from('snappy_normalized_snapshots')
      .insert({
        snapshot_id: snapData.id,
        normalized_data: normalized,
        design_analysis: designAnalysis,
        ux_analysis: uxAnalysis,
        legal_safe: false
      })

    if (normError) {
      console.error('Normalization error:', normError)
      // Don't throw, snapshot was saved successfully
    }

    return NextResponse.json({
      success: true,
      snapshot_id: snapData.id,
      url: snapshot.url,
      normalized: !!normError ? null : {
        headings_count: normalized.headings?.length || 0,
        links_count: normalized.links?.length || 0,
        forms_count: normalized.forms?.length || 0
      },
      design_analysis: designAnalysis ? {
        confidence: designAnalysis.meta.confidence,
        primary_color: designAnalysis.colors.primary,
        heading_font: designAnalysis.typography.fontFamilies.heading,
        body_font: designAnalysis.typography.fontFamilies.body,
        spacing_unit: designAnalysis.spacing.unit
      } : null,
      ux_analysis: uxAnalysis ? generateUXSummary(uxAnalysis) : null
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}

function extractLinks(html: string): string[] {
  const links: string[] = []
  const regex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi
  let match

  while ((match = regex.exec(html)) !== null) {
    const url = match[1]
    // Filter out javascript:, mailto:, anchors, etc.
    if (url.startsWith('http://') || url.startsWith('https://')) {
      links.push(url)
    }
  }

  return [...new Set(links)] // Deduplicate
}
