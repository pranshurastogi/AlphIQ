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

export const supabase = createClient(
  config.supabase.url!,
  config.supabase.anonKey!
)
