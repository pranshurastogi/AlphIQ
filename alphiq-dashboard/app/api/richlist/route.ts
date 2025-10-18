import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const amount = searchParams.get('amount') || '50'
    const sort = searchParams.get('sort') || 'balance'
    const order = searchParams.get('order') || 'desc'
    const filter = searchParams.get('filter') || 'nogenesis'

    const richlistUrl = `https://api-richlist.alephium.notrustverify.ch/addresses?page=${page}&amount=${amount}&sort=${sort}&order=${order}&filter=${filter}`
    
    const response = await fetch(richlistUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AlphIQ-Dashboard/1.0'
      },
      // Add timeout
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) {
      throw new Error(`Richlist API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Richlist API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch richlist data',
        message: error instanceof Error ? error.message : 'Unknown error',
        addresses: [],
        active_addresses: 0
      },
      { status: 500 }
    )
  }
}
