import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import { cases } from '../lib/data.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local')
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_KEY in .env.local')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedCases() {
  console.log('🌱 Starting to seed cases...')

  // ✅ CLEAN PAYLOAD (NO TIMESTAMPS = NO ERRORS)
  const now = new Date().toISOString()

const payload = cases.map((c) => ({
  id: c.id,
  title: c.title,
  category: c.category,
  status: c.status,
  priority: c.priority,
  lead: c.lead,
  team: c.team,
  summary: c.summary,
  created_at: now,
  updated_at: now,
}))
  // ✅ SINGLE SAFE UPSERT (NO DUPLICATES, NO CONFLICTS)
  const { error: upsertError } = await supabase
    .from('investigation_cases')
    .upsert(payload, {
      onConflict: 'id'
    })

  if (upsertError) {
    console.error('❌ Seed failed:', upsertError)
    process.exit(1)
  }

  console.log(`✅ Seeded ${cases.length} cases`)

  // ✅ VERIFY INSERT
  const { data, error: fetchError } = await supabase
    .from('investigation_cases')
    .select('id, title, status')

  if (fetchError) {
    console.error('❌ Fetch failed:', fetchError)
    process.exit(1)
  }

  console.log(`📊 Total cases in DB: ${data?.length || 0}`)

  data?.forEach((c) => {
    console.log(`  - ${c.id}: ${c.title}`)
  })
}

seedCases()