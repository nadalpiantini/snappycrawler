/**
 * Debug script to check snapshots in Supabase
 * Run with: node debug-snapshots.js
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

async function checkSnapshots() {
  console.log('🔍 Checking snapshots...')
  console.log('📍 Supabase URL:', supabaseUrl)

  try {
    // Check auth
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })

    console.log('📡 Auth Status:', authResponse.status)

    if (authResponse.status === 401) {
      console.log('⚠️  Not authenticated - this is expected')
      console.log('💡 You need to be logged in to fetch snapshots')
    }

    // Try to fetch snapshots
    const snapshotsResponse = await fetch(`${supabaseUrl}/rest/v1/snappy_snapshots?select=*&limit=5`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📸 Snapshots Status:', snapshotsResponse.status)

    if (snapshotsResponse.ok) {
      const data = await snapshotsResponse.json()
      console.log('✅ Found', data.length, 'snapshots')

      if (data.length > 0) {
        console.log('📄 Sample snapshot:', {
          id: data[0].id,
          url: data[0].url,
          title: data[0].title,
          created_at: data[0].created_at
        })
      }
    } else {
      const error = await snapshotsResponse.text()
      console.error('❌ Error fetching snapshots:', error)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkSnapshots()
