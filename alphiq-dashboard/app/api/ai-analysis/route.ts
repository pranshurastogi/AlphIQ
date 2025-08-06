// app/api/ai-analysis/route.ts
import { NextResponse } from 'next/server'

// Helper function to check if we're in development
const isDevelopment = () => process.env.NODE_ENV === 'development'

// Safe logging function that only logs in development
const safeLog = (level: 'log' | 'warn' | 'error', ...args: any[]) => {
  if (isDevelopment()) {
    console[level](...args)
  }
}

// Rate limiting helper
const rateLimit = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 5 // Lower limit for AI analysis

  const record = rateLimit.get(ip)
  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

function validateAddress(address: string): boolean {
  // Alephium address validation - accept longer addresses
  // Alephium addresses can be alphanumeric and vary in length
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(address) && address.length >= 26
}

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    
    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { address } = body

    // Input validation
    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    if (!validateAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      )
    }

    // Check if API key is available
    const AIML_API_KEY = process.env.AIML_API_KEY
    if (!AIML_API_KEY) {
      safeLog('error', '[AI Analysis] Missing AIML_API_KEY')
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }

    // Debug API key status
    safeLog('log', '[AI Analysis] API Key exists:', !!AIML_API_KEY)
    safeLog('log', '[AI Analysis] API Key length:', AIML_API_KEY?.length || 0)
    safeLog('log', '[AI Analysis] API Key first 10 chars:', AIML_API_KEY?.slice(0, 10))

    // Fetch transactions with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

    const txRes = await fetch(
      `https://backend.mainnet.alephium.org/addresses/${address}/transactions`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'AlphIQ-Dashboard/1.0',
        },
      }
    )

    clearTimeout(timeoutId)

    if (!txRes.ok) {
      safeLog('error', `[AI Analysis] Transaction fetch failed: ${txRes.status}`)
      return NextResponse.json(
        { error: 'Failed to fetch transaction data' },
        { status: 502 }
      )
    }

    const rawTxs: any[] = await txRes.json()

    // Process transactions (last 30 days, up to 50 most recent)
    const thirtyAgo = Date.now() - 30 * 24 * 3600 * 1000
    const recent = rawTxs
      .filter(tx => tx.timestamp >= thirtyAgo)
      .slice(-50)
      .map(tx => ({
        hash: tx.hash,
        date: new Date(tx.timestamp).toLocaleDateString(),
        in: Number(BigInt(tx.inputs?.[0]?.attoAlphAmount ?? '0') / BigInt('1000000000000000000')),
        out: Number(BigInt(tx.outputs?.[0]?.attoAlphAmount ?? '0') / BigInt('1000000000000000000')),
        fee: Number((BigInt(tx.gasAmount) * BigInt(tx.gasPrice)) / BigInt('1000000000000000000'))
      }))

    // Build prompt
    const prompt = `
You are a friendly on-chain AI analyst. Provide a **Markdown** summary of this wallet's past 30 days on Alephium:
- **H2 headings** for sections.
- **Bullet points** with **bold** key figures.
- One "fun fact" or interesting insight at the end.

Here are the transactions JSON:
\`\`\`json
${JSON.stringify(recent, null, 2)}
\`\`\`
    `.trim()

    // Call AI API
    const aiRes = await fetch('https://api.aimlapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_API_KEY}`
      },
      body: JSON.stringify({
        model: 'google/gemma-3n-e4b-it',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      })
    })

    if (!aiRes.ok) {
      safeLog('error', `[AI Analysis] AI API error: ${aiRes.status}`)
      safeLog('error', `[AI Analysis] AI API response:`, await aiRes.text())
      
      if (aiRes.status === 401) {
        return NextResponse.json(
          { error: 'AI API key is invalid or missing' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: 'AI analysis service unavailable' },
        { status: 502 }
      )
    }

    const aiJson = await aiRes.json()
    const summary = aiJson.choices?.[0]?.message?.content || 'No insights available.'

    return NextResponse.json({ summary })
  } catch (error) {
    safeLog('error', '[AI Analysis] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}