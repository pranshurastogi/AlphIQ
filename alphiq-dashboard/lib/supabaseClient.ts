// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import { config, validateConfig } from './config'

// Validate configuration
if (typeof window !== 'undefined') {
  // Only validate on client side
  try {
    validateConfig()
  } catch (error) {
    console.error('Configuration validation failed:', error)
  }
}

// Check if environment variables are available
const supabaseUrl = config.supabase.url
const supabaseAnonKey = config.supabase.anonKey

console.log('🔍 Supabase Connection Debug:')
console.log('URL exists:', !!supabaseUrl)
console.log('AnonKey exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing!')
  console.error('Please check your .env.local file contains:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your-url')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key')
  throw new Error('Supabase environment variables are not configured')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test function to verify connection
export async function testSupabaseConnection() {
  try {
    console.log('🧪 Testing Supabase connection...')
    const { data, error } = await supabase
      .from('admin_xp_levels')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    return true
  } catch (err) {
    console.error('❌ Supabase connection error:', err)
    return false
  }
}