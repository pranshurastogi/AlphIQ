// lib/config.ts
export const config = {
  // Database
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Debug environment variables (only in development)
  debug: {
    envVars: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING',
    }
  },
  
  // AI Service (server-side only)
  ai: {
    // Support both old and new variable names for transition
    apiKey: process.env.AIML_API_KEY || process.env.NEXT_PUBLIC_AIMLAPI_KEY,
    apiUrl: 'https://api.aimlapi.com/v1/chat/completions',
    model: 'google/gemma-3n-e4b-it',
  },
  
  // External APIs
  explorer: {
    baseUrl: 'https://backend.mainnet.alephium.org',
  },
  
  // App settings
  app: {
    name: 'AlphIQ Dashboard',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  
  // Security settings
  security: {
    rateLimit: {
      default: 10, // requests per minute
      aiAnalysis: 5, // requests per minute for AI analysis
    },
    timeout: {
      default: 10000, // 10 seconds
      aiAnalysis: 15000, // 15 seconds
    },
  },
}

// Helper function to check if we're in development
const isDevelopment = () => process.env.NODE_ENV === 'development'

// Safe logging function that only logs in development
const safeLog = (level: 'log' | 'warn' | 'error', ...args: any[]) => {
  if (isDevelopment()) {
    console[level](...args)
  }
}

// Validation function
export function validateConfig() {
  if (isDevelopment()) {
    safeLog('log', '🔍 Config Validation Debug:')
    safeLog('log', 'NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'EXISTS' : 'MISSING')
    safeLog('log', 'NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING')
  }
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]
  
  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  )
  
  if (missingVars.length > 0) {
    safeLog('warn', `⚠️  Missing Supabase environment variables: ${missingVars.join(', ')}`)
    safeLog('warn', '   XP components will use mock data only.')
    safeLog('warn', '   To enable real data, create a .env.local file with:')
    safeLog('warn', '   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url')
    safeLog('warn', '   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key')
    return false
  }
  
  // Check for AI API key (either old or new format)
  if (!config.ai.apiKey) {
    safeLog('warn', '⚠️  AIML_API_KEY not found. AI analysis will not work.')
    safeLog('warn', '   Please set AIML_API_KEY (server-side) or NEXT_PUBLIC_AIMLAPI_KEY (client-side)')
  }
  
  // Validate Supabase URL format
  if (config.supabase.url && !config.supabase.url.startsWith('https://')) {
    throw new Error('Invalid Supabase URL format')
  }
  
  return true
} 