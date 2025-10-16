import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

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

// POST - Validate XP and handle spending for profile updates
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      safeLog('error', '❌ Supabase not configured - missing environment variables')
      return NextResponse.json(
        { 
          error: 'Database not configured',
          details: 'Please configure Supabase environment variables'
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { 
      userAddress, 
      currentUsername, 
      currentEmoji, 
      newUsername, 
      newEmoji 
    } = body

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      )
    }

    safeLog('log', '🔍 Validating XP for user:', userAddress)

    // Get user's current XP from users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('admin_total_xp, address')
      .eq('address', userAddress)
      .single()

    if (userError) {
      safeLog('error', '❌ Error fetching user XP:', userError)
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

    const currentXP = user.admin_total_xp || 0

    // Determine the cost based on current state
    let xpCost = 0
    let reason = ''
    let featureValue = ''

    // Check if user has existing username or emoji
    const hasExistingUsername = currentUsername && currentUsername.trim() !== ''
    const hasExistingEmoji = currentEmoji && currentEmoji.trim() !== ''
    const isUpdatingUsername = newUsername && newUsername.trim() !== '' && newUsername !== currentUsername
    const isUpdatingEmoji = newEmoji && newEmoji.trim() !== '' && newEmoji !== currentEmoji

    // Determine cost based on current state and what's being updated
    if (!hasExistingUsername && !hasExistingEmoji) {
      // First time setting username or emoji - 100 XP
      if (isUpdatingUsername || isUpdatingEmoji) {
        xpCost = 100
        reason = 'Initial profile setup'
        featureValue = 'username_emoji_setup'
      }
    } else if (hasExistingUsername || hasExistingEmoji) {
      // Updating existing username or emoji - 500 XP
      if (isUpdatingUsername || isUpdatingEmoji) {
        xpCost = 500
        reason = 'Profile update'
        featureValue = 'username_emoji_update'
      }
    }

    // Check if user has enough XP
    if (xpCost > 0 && currentXP < xpCost) {
      return NextResponse.json({
        success: false,
        canProceed: false,
        error: 'Insufficient XP',
        details: `You need ${xpCost} XP to update your profile, but you only have ${currentXP} XP`,
        requiredXP: xpCost,
        currentXP: currentXP,
        shortfall: xpCost - currentXP
      })
    }

    // If no cost required, return success
    if (xpCost === 0) {
      return NextResponse.json({
        success: true,
        canProceed: true,
        xpCost: 0,
        currentXP: currentXP,
        message: 'No XP cost required for this update'
      })
    }

    // User has enough XP - proceed with spending
    try {
      // Start transaction by inserting spending record first
      const { data: spendingRecord, error: spendingError } = await supabase
        .from('admin_user_xp_spending')
        .insert({
          user_address: userAddress,
          xp_spent: xpCost,
          reason: reason,
          feature_value: featureValue
        })
        .select()
        .single()

      if (spendingError) {
        safeLog('error', '❌ Error creating spending record:', spendingError)
        return NextResponse.json(
          { error: 'Failed to record XP spending' },
          { status: 500 }
        )
      }

      // Update user's XP by subtracting the cost
      const newXP = currentXP - xpCost
      const { error: updateError } = await supabase
        .from('users')
        .update({ admin_total_xp: newXP })
        .eq('address', userAddress)

      if (updateError) {
        safeLog('error', '❌ Error updating user XP:', updateError)
        // Try to rollback the spending record
        await supabase
          .from('admin_user_xp_spending')
          .delete()
          .eq('id', spendingRecord.id)
        
        return NextResponse.json(
          { error: 'Failed to update user XP' },
          { status: 500 }
        )
      }

      safeLog('log', '✅ XP spending successful:', {
        userAddress,
        xpSpent: xpCost,
        newXP,
        spendingRecordId: spendingRecord.id
      })

      return NextResponse.json({
        success: true,
        canProceed: true,
        xpCost: xpCost,
        currentXP: newXP,
        spendingRecordId: spendingRecord.id,
        message: `Successfully spent ${xpCost} XP for profile update`
      })

    } catch (transactionError) {
      safeLog('error', '❌ Transaction error:', transactionError)
      return NextResponse.json(
        { error: 'Failed to process XP spending' },
        { status: 500 }
      )
    }

  } catch (error) {
    safeLog('error', '❌ Unexpected error in XP validation:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Check user's current XP without spending
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('address')

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      )
    }

    // Get user's current XP
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('admin_total_xp, address')
      .eq('address', userAddress)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      currentXP: user.admin_total_xp || 0,
      address: user.address
    })

  } catch (error) {
    safeLog('error', '❌ Unexpected error in GET XP check:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
