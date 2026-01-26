const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nqzhxukuvmdlpewqytpv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xemh4dWt1dm1kbHBld3F5dHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY1OTQwOSwiZXhwIjoyMDYyMjM1NDA5fQ.KUbJb8fCHADnITIhr-x8R49_BsmicsYAzW9qG2YlTFA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🔍 Checking user_id on snapshots...\n')

  const { data, error } = await supabase
    .from('snappy_snapshots')
    .select('id, title, user_id, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  console.log(`Found ${data.length} snapshots:\n`)

  data.forEach((snap, i) => {
    console.log(`${i + 1}. ${snap.title}`)
    console.log(`   user_id: ${snap.user_id || 'NULL ❌'}`)
    console.log(`   Created: ${snap.created_at}\n`)
  })

  const withUserId = data.filter(s => s.user_id).length
  console.log(`Summary: ${withUserId}/${data.length} snapshots have user_id`)

  if (withUserId === 0) {
    console.log('\n⚠️  NO snapshots have user_id! They will not appear in the API.')
    console.log('\n💡 Options:')
    console.log('   1. Update snapshots to add user_id')
    console.log('   2. Remove user_id filter from API')
    console.log('   3. Disable auth requirement')
  }
}

main()
