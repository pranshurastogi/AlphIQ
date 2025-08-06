// app/api/blogs/route.ts
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
  const maxRequests = 10

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

export async function GET(request: Request) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    
    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Fetch RSS from Medium with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const res = await fetch('https://medium.com/feed/@alephium', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AlphIQ-Dashboard/1.0',
      },
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      safeLog('error', `[Blogs API] Medium fetch failed: ${res.status}`)
      return NextResponse.json(
        { error: 'Failed to fetch blog feed' },
        { status: 502 }
      )
    }

    const xml = await res.text()

    // Validate XML content
    if (!xml.includes('<rss') && !xml.includes('<feed')) {
      safeLog('error', '[Blogs API] Invalid RSS feed format')
      return NextResponse.json(
        { error: 'Invalid feed format' },
        { status: 502 }
      )
    }

    // Parse RSS with better error handling
    const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g))
      .slice(0, 10)
      .map(match => {
        const block = match[1]
        const get = (tag: string) => {
          const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
          return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : ''
        }
        
        const title = get('title')
        const link = get('link')
        const pubDate = get('pubDate')
        const description = get('description')

        // Validate required fields
        if (!title || !link) {
          return null
        }

        return {
          title: title.substring(0, 200), // Limit title length
          link: link.startsWith('http') ? link : '',
          pubDate: pubDate || new Date().toISOString(),
          description: description.substring(0, 500), // Limit description length
        }
      })
      .filter(Boolean) // Remove null items

    return NextResponse.json({ posts: items })
  } catch (error) {
    safeLog('error', '[Blogs API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
