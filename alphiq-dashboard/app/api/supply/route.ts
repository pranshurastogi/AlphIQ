import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supplyEndpoints = [
      'https://api.alephium.org/infos/supply/total-alph',
      'https://backend.mainnet.alephium.org/infos/supply/total-alph',
      'https://api-richlist.alephium.notrustverify.ch/supply'
    ]

    for (const endpoint of supplyEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'AlphIQ-Dashboard/1.0'
          },
          signal: AbortSignal.timeout(10000)
        })

        if (response.ok) {
          const data = await response.json()
          
          // Normalize different response formats
          let totalSupply
          if (typeof data === 'number') {
            totalSupply = data
          } else if (data.totalAlph) {
            totalSupply = data.totalAlph
          } else if (data.total) {
            totalSupply = data.total
          } else {
            totalSupply = 1e9 // Fallback to 1B ALPH
          }
          
          return NextResponse.json(
            { totalAlph: totalSupply },
            {
              headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
              }
            }
          )
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${endpoint}:`, error)
        continue
      }
    }

    // If all endpoints fail, return fallback
    throw new Error('All supply endpoints failed')
  } catch (error) {
    console.error('Supply API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch supply data',
        message: error instanceof Error ? error.message : 'Unknown error',
        totalAlph: 1e9 // Fallback to 1B ALPH
      },
      { 
        status: 200, // Return 200 with fallback data
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    )
  }
}
