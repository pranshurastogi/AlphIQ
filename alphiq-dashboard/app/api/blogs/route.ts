// app/api/blogs/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  // Fetch RSS from Medium (no CORS on the server)
  const res = await fetch('https://medium.com/feed/@alephium')
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 502 })
  }
  const xml = await res.text()

  // Very naïve RSS-to-JSON parsing (you could swap in a real XML parser)
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0,10).map(match => {
    const block = match[1]
    const get = (tag:string) => {
      const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
      return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g,'').trim() : ''
    }
    return {
      title: get('title'),
      link: get('link'),
      pubDate: get('pubDate'),
      description: get('description'),
    }
  })

  return NextResponse.json({ posts: items })
}
