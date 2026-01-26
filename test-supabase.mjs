import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load env vars
dotenv.config({ path: '.env.local' })

const supabaseUrl = 'https://nqzhxukuvmdlpewqytpv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xemh4dWt1dm1kbHBld3F5dHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTk0MDksImV4cCI6MjA2MjIzNTQwOX0.9raKtf_MAUoZ7lUOek4lazhWTfmxPvufW1-al82UHmk'

console.log('🔍 Testing Supabase connection...\n')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('\n📊 Test 1: Simple query')
  const { data, error } = await supabase
    .from('snappy_snapshots')
    .select('id, title, url')
    .limit(5)

  console.log('Error:', error?.message || 'None')
  console.log('Snapshots found:', data?.length || 0)

  if (data?.length > 0) {
    console.log('\nFirst snapshot:', data[0])
  }

  console.log('\n📊 Test 2: Query with projects (like API)')
  const { data: data2, error: error2 } = await supabase
    .from('snappy_snapshots')
    .select(`
      id,
      title,
      url,
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
    .limit(5)

  console.log('Error:', error2?.message || 'None')
  console.log('Snapshots with projects:', data2?.length || 0)

  if (data2?.length > 0) {
    console.log('\nSample snapshot:')
    console.log(JSON.stringify(data2[0], null, 2))
  }
}

test().catch(console.error)
