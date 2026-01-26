import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nqzhxukuvmdlpewqytpv.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xemh4dWt1dm1kbHBld3F5dHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY1OTQwOSwiZXhwIjoyMDYyMjM1NDA5fQ.KUbJb8fCHADnITIhr-x8R49_BsmicsYAzW9qG2YlTFA'

console.log('🔑 Testing with SERVICE_ROLE key...\n')

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function test() {
  console.log('📊 Test 1: Count all snapshots')
  const { count, error: errCount } = await supabase
    .from('snappy_snapshots')
    .select('*', { count: 'exact', head: true })

  console.log('Total snapshots:', count)
  console.log('Count error:', errCount?.message)

  console.log('\n📊 Test 2: Get first 5 snapshots')
  const { data, error } = await supabase
    .from('snappy_snapshots')
    .select('id, title, url, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  console.log('Error:', error?.message || 'None')
  console.log('Snapshots found:', data?.length || 0)

  if (data?.length > 0) {
    console.log('\nMost recent:')
    data.forEach((s, i) => {
      console.log(`  ${i+1}. ${s.title || 'Untitled'}`)
    })
  }

  console.log('\n📊 Test 3: Check RLS policies')
  const { data: policies } = await supabase
    .from('pg_policies')
    .select('policyname, tablename, permissive, qual, with_check')
    .eq('tablename', 'snappy_snapshots')

  console.log('RLS Policies on snappy_snapshots:', policies?.length || 0)
  policies?.forEach(p => {
    console.log(`  - ${p.policyname}`)
    console.log(`    Permissive: ${p.permissive}`)
    console.log(`    Qual: ${p.qual}`)
  })
}

test().catch(console.error)
