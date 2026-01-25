// ============================================
// SNAPPY - Database Seed Script
// ============================================

const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Sample snapshots
const sampleSnapshots = [
  {
    url: 'https://example.com',
    title: 'Example Domain',
    raw_data: {
      url: 'https://example.com',
      title: 'Example Domain',
      html: '<html><body><h1>Example Domain</h1><p>This domain is for use in illustrative examples.</p></body></html>',
      text: ['Example Domain', 'This domain is for use in illustrative examples.'],
      ux: [],
      timestamp: new Date().toISOString()
    }
  },
  {
    url: 'https://github.com',
    title: 'GitHub: Let\'s build from here',
    raw_data: {
      url: 'https://github.com',
      title: 'GitHub: Let\'s build from here',
      html: '<html><body><nav>...</nav><h1>Let\'s build from here</h1><form><input type="text" name="q"><button>Search</button></form></body></html>',
      text: ['Let\'s build from here', 'Search', 'Sign up'],
      ux: [
        { type: 'click', tag: 'INPUT', text: '', id: 'search-input', class: null }
      ],
      timestamp: new Date().toISOString()
    }
  },
  {
    url: 'https://tailwindcss.com',
    title: 'Tailwind CSS - Rapidly build modern websites',
    raw_data: {
      url: 'https://tailwindcss.com',
      title: 'Tailwind CSS - Rapidly build modern websites',
      html: '<html><body><header>Tailwind CSS</header><h1>Rapidly build modern websites</h1><button>Get Started</button></body></html>',
      text: ['Tailwind CSS', 'Rapidly build modern websites', 'Get Started', 'Documentation'],
      ux: [
        { type: 'click', tag: 'BUTTON', text: 'Get Started', id: null, class: 'btn-primary' }
      ],
      timestamp: new Date().toISOString()
    }
  }
]

// Demo user email
const DEMO_USER_EMAIL = 'demo@snappy.dev'

async function seed() {
  console.log('🌱 Starting database seed...\n')

  try {
    // 1. Create demo user profile
    console.log('1️⃣ Creating demo user profile...')

    // First, we need a valid UUID from auth.users
    // For this demo, we'll insert a profile with a random UUID
    const demoUserId = crypto.randomUUID()

    const { error: profileError } = await supabase
      .from('snappy_profiles')
      .insert({
        id: demoUserId,
        email: DEMO_USER_EMAIL
      })

    if (profileError) {
      // Profile might already exist
      console.log('   ⚠️  Profile might already exist, continuing...')
    } else {
      console.log('   ✅ Demo profile created')
    }

    // 2. Insert sample snapshots
    console.log('\n2️⃣ Inserting sample snapshots...')

    for (let i = 0; i < sampleSnapshots.length; i++) {
      const snapshot = sampleSnapshots[i]

      const { data, error } = await supabase
        .from('snappy_snapshots')
        .insert({
          user_id: demoUserId,
          url: snapshot.url,
          title: snapshot.title,
          raw_data: snapshot.raw_data
        })
        .select()
        .single()

      if (error) {
        console.log(`   ❌ Failed to insert ${snapshot.url}: ${error.message}`)
      } else {
        console.log(`   ✅ Inserted: ${snapshot.url} (ID: ${data.id})`)
      }
    }

    // 3. Create sample project
    console.log('\n3️⃣ Creating sample project...')

    const { data: project, error: projectError } = await supabase
      .from('snappy_projects')
      .insert({
        user_id: demoUserId,
        name: 'Demo Project',
        description: 'Sample project with example snapshots'
      })
      .select()
      .single()

    if (projectError) {
      console.log(`   ⚠️  Project might already exist`)
    } else {
      console.log(`   ✅ Project created (ID: ${project.id})`)
    }

    console.log('\n✅ Seed completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Demo user: ${DEMO_USER_EMAIL}`)
    console.log(`   - Snapshots: ${sampleSnapshots.length}`)
    console.log(`   - Project: 1`)
    console.log('\n🎉 You can now start the dev server and see the sample data!')

  } catch (error) {
    console.error('\n❌ Seed failed:', error)
    process.exit(1)
  }
}

// Run seed
seed()
  .then(() => {
    console.log('\n👋 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error)
    process.exit(1)
  })
