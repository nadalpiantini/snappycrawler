const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nqzhxukuvmdlpewqytpv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xemh4dWt1dm1kbHBld3F5dHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY1OTQwOSwiZXhwIjoyMDYyMjM1NDA5fQ.KUbJb8fCHADnITIhr-x8R49_BsmicsYAzW9qG2YlTFA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🔍 Checking snapshots table...\n')

  const { data, error } = await supabase
    .from('snappy_snapshots')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  console.log(`✅ Total snapshots found: ${data.length}\n`)

  if (data.length > 0) {
    console.log('Most recent snapshots:')
    data.forEach((snap, i) => {
      console.log(`\n${i + 1}. ${snap.title || 'Untitled'}`)
      console.log(`   URL: ${snap.url}`)
      console.log(`   Created: ${snap.created_at}`)
      console.log(`   ID: ${snap.id}`)
    })

    // Check projects
    console.log('\n📂 Checking project relationships...')
    const { data: withProjects } = await supabase
      .from('snappy_snapshots')
      .select(`
        id,
        title,
        snappy_project_snapshots (
          snappy_projects (
            id,
            name
          )
        )
      `)
      .limit(5)

    console.log(`\nWith projects: ${withProjects.length}`)
    withProjects.forEach((snap) => {
      const projects = snap.snappy_project_snapshots?.map(p => p.snappy_projects?.name).filter(Boolean)
      console.log(`- ${snap.title}: ${projects.length > 0 ? projects.join(', ') : 'No project'}`)
    })
  } else {
    console.log('⚠️  No snapshots found in database.')
  }
}

main()
