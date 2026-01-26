import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Auth enabled:', process.env.NEXT_PUBLIC_ENABLE_AUTH)

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  // Test simple query
  const { data, error } = await supabase
    .from('snappy_snapshots')
    .select('id, title, url')
    .limit(5)

  console.log('\nError:', error)
  console.log('Data length:', data?.length || 0)
  console.log('First snapshot:', data?.[0])

  // Test with projects
  const { data: data2, error: error2 } = await supabase
    .from('snappy_snapshots')
    .select(`
      id,
      title,
      snappy_project_snapshots (
        project_id,
        snappy_projects (
          id,
          name
        )
      )
    `)
    .limit(5)

  console.log('\nWith projects - Error:', error2)
  console.log('With projects - Length:', data2?.length || 0)
}

test().catch(console.error)
