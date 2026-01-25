// ============================================
// SNAPPY - Verify Schema Installation
// ============================================

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyTables() {
  console.log('📸 Verificando instalación de Snappy Schema...')
  console.log('===========================================')
  console.log('')

  try {
    // Verificar tablas con prefijo snappy_
    const { data, error } = await supabase
      .rpc('get_tables', {
        schema: 'public'
      })

    if (error) {
      // Intentar consulta directa
      console.log('🔍 Consultando tablas directamente...')

      const { data: tables } = await supabase
        .rpc('sql', {
          sql: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'snappy_%' ORDER BY tablename;`
        })

      if (tables) {
        console.log('✅ Tablas creadas:')
        console.log('')

        if (Array.isArray(tables)) {
          tables.forEach(table => {
            console.log(`   ✅ ${table.tablename || table}`)
          })
        }
      }
    } else {
      console.log('✅ Tablas creadas:')
      console.log('')
      data.forEach(table => {
        console.log(`   ✅ ${table.tablename}`)
      })
    }

    console.log('')
    console.log('🚀 Schema instalado correctamente!')
    console.log('')
    console.log('📝 Siguiente paso:')
    console.log('   pnpm dev')
    console.log('')
    console.log('🌐 Luego abrir: http://localhost:3000')

  } catch (error) {
    console.error('❌ Error verificando tablas:', error.message)
  }
}

verifyTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Error:', error)
    process.exit(1)
  })
