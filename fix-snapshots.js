const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nqzhxukuvmdlpewqytpv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xemh4dWt1dm1kbHBld3F5dHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY1OTQwOSwiZXhwIjoyMDYyMjM1NDA5fQ.KUbJb8fCHADnITIhr-x8R49_BsmicsYAzW9qG2YlTFA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🔧 Fixing snapshots with invalid user_id...\n')

  // Get first real user from auth.users
  const { data: users, error: usersError } = await supabase.rpc('get_all_users')

  if (usersError) {
    // Try direct query
    const { data: directUsers } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (!directUsers || directUsers.length === 0) {
      console.error('❌ No users found. Please create a user first.')
      process.exit(1)
    }

    const userId = directUsers[0].id
    console.log(`Found user: ${userId}`)

    // Update all snapshots with invalid user_id
    const { data: snapshots, error: updateError } = await supabase
      .from('snappy_snapshots')
      .update({ user_id: userId })
      .eq('user_id', '00000000-0000-0000-0000-000000000000')
      .select('id', { count: 'exact' })

    if (updateError) {
      console.error('❌ Error updating:', updateError.message)
      process.exit(1)
    }

    console.log(`✅ Updated ${snapshots.length} snapshots to user_id: ${userId}`)
  } else {
    const userId = users[0].id
    console.log(`Found user: ${userId}`)

    const { data: snapshots, error: updateError } = await supabase
      .from('snappy_snapshots')
      .update({ user_id: userId })
      .eq('user_id', '00000000-0000-0000-0000-000000000000')
      .select('id', { count: 'exact' })

    if (updateError) {
      console.error('❌ Error updating:', updateError.message)
      process.exit(1)
    }

    console.log(`✅ Updated ${snapshots.length} snapshots to user_id: ${userId}`)
  }

  // Verify
  console.log('\n🔍 Verifying update...\n')
  const { data: verify } = await supabase
    .from('snappy_snapshots')
    .select('user_id')
    .limit(5)

  console.log('Sample user_ids after update:')
  verify.forEach((snap, i) => {
    console.log(`${i + 1}. ${snap.user_id}`)
  })
}

main()
