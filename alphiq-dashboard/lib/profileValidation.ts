// Profile validation utilities
export interface ProfileValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateUsername(username: string): ProfileValidationResult {
  const errors: string[] = []
  
  if (!username || username.trim().length === 0) {
    return { isValid: true, errors: [] } // Username is optional
  }
  
  const trimmed = username.trim()
  
  if (trimmed.length < 4) {
    errors.push('Username must be at least 4 characters long')
  }
  
  if (trimmed.length > 30) {
    errors.push('Username must be less than 30 characters')
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateEmoji(emoji: string): ProfileValidationResult {
  const errors: string[] = []
  
  if (!emoji || emoji.trim().length === 0) {
    return { isValid: true, errors: [] } // Emoji is optional
  }
  
  const trimmed = emoji.trim()
  
  // Allow up to 10 characters (for very complex emojis with multiple modifiers)
  if (trimmed.length > 10) {
    errors.push('Emoji should be 1-10 characters')
  }
  
  // Completely permissive validation - allow any non-empty string
  // This covers all emojis, symbols, special characters, and text
  return { isValid: true, errors: [] }
}

export function validateUrl(url: string, fieldName: string): ProfileValidationResult {
  const errors: string[] = []
  
  if (!url || url.trim().length === 0) {
    return { isValid: true, errors: [] } // URL is optional
  }
  
  const trimmed = url.trim()
  
  try {
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      errors.push(`${fieldName} must be a valid HTTP or HTTPS URL`)
    }
  } catch {
    errors.push(`${fieldName} must be a valid URL`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateSocialHandle(handle: string, platform: string): ProfileValidationResult {
  const errors: string[] = []
  
  if (!handle || handle.trim().length === 0) {
    return { isValid: true, errors: [] } // Social handles are optional
  }
  
  const trimmed = handle.trim()
  
  // Remove @ symbol if present
  const cleanHandle = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed
  
  if (cleanHandle.length < 1) {
    errors.push(`${platform} handle cannot be empty`)
  }
  
  if (cleanHandle.length > 50) {
    errors.push(`${platform} handle must be less than 50 characters`)
  }
  
  // Basic validation for social handles
  if (!/^[a-zA-Z0-9._-]+$/.test(cleanHandle)) {
    errors.push(`${platform} handle can only contain letters, numbers, dots, underscores, and hyphens`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateDiscordHandle(handle: string): ProfileValidationResult {
  const errors: string[] = []
  
  if (!handle || handle.trim().length === 0) {
    return { isValid: true, errors: [] } // Discord handle is optional
  }
  
  const trimmed = handle.trim()
  
  // Discord username format: username#1234 or username
  const discordRegex = /^[a-zA-Z0-9._-]+(#[0-9]{4})?$/
  
  if (!discordRegex.test(trimmed)) {
    errors.push('Discord handle should be in format: username#1234 or username')
  }
  
  if (trimmed.length > 50) {
    errors.push('Discord handle must be less than 50 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateDescription(description: string): ProfileValidationResult {
  const errors: string[] = []
  
  if (!description || description.trim().length === 0) {
    return { isValid: true, errors: [] } // Description is optional
  }
  
  const trimmed = description.trim()
  
  if (trimmed.length > 500) {
    errors.push('Description must be less than 500 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateProfile(profile: {
  username?: string | null
  emoji?: string | null
  description?: string | null
  website?: string | null
  github?: string | null
  twitter?: string | null
  telegram?: string | null
  discord?: string | null
}): ProfileValidationResult {
  const allErrors: string[] = []
  
  // Validate each field
  const usernameResult = validateUsername(profile.username || '')
  const emojiResult = validateEmoji(profile.emoji || '')
  const descriptionResult = validateDescription(profile.description || '')
  const websiteResult = validateUrl(profile.website || '', 'Website')
  const githubResult = validateSocialHandle(profile.github || '', 'GitHub')
  const twitterResult = validateSocialHandle(profile.twitter || '', 'Twitter')
  const telegramResult = validateSocialHandle(profile.telegram || '', 'Telegram')
  const discordResult = validateDiscordHandle(profile.discord || '')
  
  // Collect all errors
  allErrors.push(...usernameResult.errors)
  allErrors.push(...emojiResult.errors)
  allErrors.push(...descriptionResult.errors)
  allErrors.push(...websiteResult.errors)
  allErrors.push(...githubResult.errors)
  allErrors.push(...twitterResult.errors)
  allErrors.push(...telegramResult.errors)
  allErrors.push(...discordResult.errors)
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}
