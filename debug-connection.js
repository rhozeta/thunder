// Debug script to test Supabase connection
// Run with: node debug-connection.js

const { createClient } = require('@supabase/supabase-js')

// Replace with your actual credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? 'Set' : 'Missing')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test basic connection
    console.log('🔍 Testing basic connection...')
    const { data, error } = await supabase.from('contacts').select('*').limit(1)
    
    if (error) {
      console.error('❌ Connection error:', error.message)
      console.error('Error details:', error)
    } else {
      console.log('✅ Connection successful!')
      console.log('Data:', data)
    }
    
    // Test with demo user ID
    console.log('🔍 Testing with demo user ID...')
    const { data: demoData, error: demoError } = await supabase
      .from('contacts')
      .select('*')
      .eq('assigned_agent_id', '00000000-0000-0000-0000-000000000000')
    
    if (demoError) {
      console.error('❌ Demo user query error:', demoError.message)
    } else {
      console.log('✅ Demo user query successful!')
      console.log('Demo data:', demoData)
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testConnection()
