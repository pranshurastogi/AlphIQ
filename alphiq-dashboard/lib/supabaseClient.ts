// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import { config, validateConfig } from './config'

// Helper function to check if we're in development
const isDevelopment = () => process.env.NODE_ENV === 'development'

// Safe logging function that only logs in development
const safeLog = (level: 'log' | 'warn' | 'error', ...args: any[]) => {
  if (isDevelopment()) {
    console[level](...args)
  }
}

// Validate configuration
if (typeof window !== 'undefined') {
  // Only validate on client side
  try {
    validateConfig()
  } catch (error) {
    safeLog('error', 'Configuration validation failed:', error)
  }
}

// Check if environment variables are available
const supabaseUrl = config.supabase.url
const supabaseAnonKey = config.supabase.anonKey

if (isDevelopment()) {
  safeLog('log', '🔍 Supabase Connection Debug:')
  safeLog('log', 'URL exists:', !!supabaseUrl)
  safeLog('log', 'AnonKey exists:', !!supabaseAnonKey)
}

if (!supabaseUrl || !supabaseAnonKey) {
  safeLog('error', '❌ Supabase environment variables are missing!')
  safeLog('error', 'Please check your .env.local file contains:')
  safeLog('error', 'NEXT_PUBLIC_SUPABASE_URL=your-url')
  safeLog('error', 'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key')
  throw new Error('Supabase environment variables are not configured')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test function to verify connection
export async function testSupabaseConnection() {
  try {
    if (isDevelopment()) {
      safeLog('log', '🧪 Testing Supabase connection...')
    }
    
    const { data, error } = await supabase
      .from('admin_xp_levels')
      .select('count')
      .limit(1)
    
    if (error) {
      safeLog('error', '❌ Supabase connection failed:', error)
      return false
    }
    
    if (isDevelopment()) {
      safeLog('log', '✅ Supabase connection successful!')
    }
    return true
  } catch (err) {
    safeLog('error', '❌ Supabase connection error:', err)
    return false
  }
}