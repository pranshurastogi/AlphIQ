import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source') || 'coingecko'

    let priceUrl: string
    let response: Response

    if (source === 'coingecko') {
      priceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=alephium&vs_currencies=usd'
    } else if (source === 'coinpaprika') {
      priceUrl = 'https://api.coinpaprika.com/v1/tickers/alph-alephium'
    } else {
      // Default to coingecko
      priceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=alephium&vs_currencies=usd'
    }

    response = await fetch(priceUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AlphIQ-Dashboard/1.0'
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`Price API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Normalize the response format
    let normalizedData
    if (source === 'coinpaprika') {
      normalizedData = { alephium: { usd: data.quotes?.USD?.price || 0.5 } }
    } else {
      normalizedData = data
    }
    
    return NextResponse.json(normalizedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Price API error:', error)
    
    // Return fallback price data
    return NextResponse.json(
      { 
        error: 'Failed to fetch price data',
        message: error instanceof Error ? error.message : 'Unknown error',
        alephium: { usd: 0.5 } // Fallback price
      },
      { 
        status: 200, // Return 200 with fallback data
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    )
  }
}
