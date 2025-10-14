import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { validateProfile } from '@/lib/profileValidation'

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

// Helper function for safe logging
const safeLog = (level: 'log' | 'warn' | 'error', ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console[level](...args)
  }
}

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      safeLog('error', '❌ Supabase not configured - missing environment variables')
      return NextResponse.json(
        { 
          error: 'Database not configured',
          details: 'Please configure Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)'
        },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    safeLog('log', '🔍 Fetching user profile for userId:', userId)

    // First, get the user by ID to verify they exist
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, address')
      .eq('id', userId)
      .single()

    if (userError) {
      safeLog('error', '❌ Error fetching user:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch user profile information
    const { data: profile, error: profileError } = await supabase
      .from('user_info')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      safeLog('error', '❌ Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    safeLog('log', '✅ User profile fetched successfully:', profile)

    return NextResponse.json({
      success: true,
      profile: profile || null,
      user: {
        id: user.id,
        address: user.address
      }
    })

  } catch (error) {
    safeLog('error', '❌ Unexpected error in GET /api/user-profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create or update user profile
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      safeLog('error', '❌ Supabase not configured - missing environment variables')
      return NextResponse.json(
        { 
          error: 'Database not configured',
          details: 'Please configure Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)'
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { 
      userId, 
      address, 
      username, 
      emoji, 
      description, 
      website, 
      github, 
      twitter, 
      telegram, 
      discord 
    } = body

    if (!userId || !address) {
      return NextResponse.json(
        { error: 'User ID and address are required' },
        { status: 400 }
      )
    }

    // Validate profile data
    const validation = validateProfile({
      username,
      emoji,
      description,
      website,
      github,
      twitter,
      telegram,
      discord
    })

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      )
    }

    safeLog('log', '🔍 Updating user profile for userId:', userId, 'address:', address)

    // First, verify the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, address')
      .eq('id', userId)
      .eq('address', address)
      .single()

    if (userError) {
      safeLog('error', '❌ Error verifying user:', userError)
      return NextResponse.json(
        { error: 'User not found or address mismatch' },
        { status: 404 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found or address mismatch' },
        { status: 404 }
      )
    }

    // Check if username is unique (if provided)
    if (username) {
      const { data: existingUser, error: usernameError } = await supabase
        .from('user_info')
        .select('user_id')
        .eq('username', username)
        .neq('user_id', userId)
        .single()

      if (usernameError && usernameError.code !== 'PGRST116') {
        safeLog('error', '❌ Error checking username uniqueness:', usernameError)
        return NextResponse.json(
          { error: 'Failed to check username availability' },
          { status: 500 }
        )
      }

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        )
      }
    }

    // Prepare profile data
    const profileData = {
      user_id: userId,
      username: username || null,
      emoji: emoji || null,
      description: description || null,
      website: website || null,
      github: github || null,
      twitter: twitter || null,
      telegram: telegram || null,
      discord: discord || null,
      updated_at: new Date().toISOString()
    }

    // Check if profile exists first
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_info')
      .select('id')
      .eq('user_id', userId)
      .single()

    let profile, upsertError

    if (checkError && checkError.code !== 'PGRST116') {
      // Error other than "not found" - something went wrong
      safeLog('error', '❌ Error checking existing profile:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing profile' },
        { status: 500 }
      )
    }

    if (existingProfile) {
      // Profile exists - update it
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_info')
        .update(profileData)
        .eq('user_id', userId)
        .select()
        .single()
      
      profile = updatedProfile
      upsertError = updateError
    } else {
      // Profile doesn't exist - insert it
      const { data: newProfile, error: insertError } = await supabase
        .from('user_info')
        .insert(profileData)
        .select()
        .single()
      
      profile = newProfile
      upsertError = insertError
    }

    if (upsertError) {
      safeLog('error', '❌ Error upserting user profile:', upsertError)
      return NextResponse.json(
        { error: 'Failed to save profile' },
        { status: 500 }
      )
    }

    safeLog('log', '✅ User profile updated successfully:', profile)

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: profile
    })

  } catch (error) {
    safeLog('error', '❌ Unexpected error in POST /api/user-profile:', error)
    safeLog('error', '❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete user profile
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    safeLog('log', '🔍 Deleting user profile for userId:', userId)

    const { error: deleteError } = await supabase
      .from('user_info')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      safeLog('error', '❌ Error deleting user profile:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete profile' },
        { status: 500 }
      )
    }

    safeLog('log', '✅ User profile deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully'
    })

  } catch (error) {
    safeLog('error', '❌ Unexpected error in DELETE /api/user-profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
