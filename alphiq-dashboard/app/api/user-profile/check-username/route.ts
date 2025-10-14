import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// Helper function for safe logging
const safeLog = (level: 'log' | 'warn' | 'error', ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console[level](...args)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const userId = searchParams.get('userId')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const trimmedUsername = username.trim()

    // Basic validation
    if (trimmedUsername.length < 4) {
      return NextResponse.json({
        available: false,
        error: 'Username must be at least 4 characters long'
      })
    }

    if (trimmedUsername.length > 30) {
      return NextResponse.json({
        available: false,
        error: 'Username must be less than 30 characters'
      })
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      return NextResponse.json({
        available: false,
        error: 'Username can only contain letters, numbers, underscores, and hyphens'
      })
    }

    safeLog('log', '🔍 Checking username availability:', trimmedUsername)

    // Check if username exists
    let query = supabase
      .from('user_info')
      .select('user_id')
      .eq('username', trimmedUsername)

    // If userId is provided, exclude the current user's profile
    if (userId) {
      query = query.neq('user_id', userId)
    }

    const { data: existingUser, error } = await query.single()

    if (error && error.code !== 'PGRST116') {
      safeLog('error', '❌ Error checking username:', error)
      return NextResponse.json(
        { error: 'Failed to check username availability' },
        { status: 500 }
      )
    }

    const isAvailable = !existingUser

    safeLog('log', '✅ Username check result:', { username: trimmedUsername, available: isAvailable })

    return NextResponse.json({
      available: isAvailable,
      username: trimmedUsername
    })

  } catch (error) {
    safeLog('error', '❌ Unexpected error in username check:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
