// components/APITestComponent.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export function APITestComponent() {
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)

  const testEndpoints = [
    {
      name: 'Richlist API',
      url: 'https://api-richlist.alephium.notrustverify.ch/addresses?page=1&amount=5&sort=balance&order=desc&filter=nogenesis',
      description: 'Top holders data'
    },
    {
      name: 'Alephium API Supply',
      url: 'https://api.alephium.org/infos/supply/total-alph',
      description: 'Total supply data'
    },
    {
      name: 'Backend Supply',
      url: 'https://backend.mainnet.alephium.org/infos/supply/total-alph',
      description: 'Backend supply data'
    },
    {
      name: 'CoinGecko Price',
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=alephium&vs_currencies=usd',
      description: 'ALPH price data'
    }
  ]

  const testEndpoint = async (endpoint: typeof testEndpoints[0]) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(endpoint.url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'AlphIQ-Dashboard/1.0'
        },
        mode: 'cors',
        credentials: 'omit'
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      setTestResults(prev => ({
        ...prev,
        [endpoint.name]: {
          status: 'success',
          data: data,
          statusCode: response.status,
          timestamp: new Date().toISOString()
        }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [endpoint.name]: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }))
    }
  }

  const testAllEndpoints = async () => {
    setIsLoading(true)
    setTestResults({})
    
    for (const endpoint of testEndpoints) {
      await testEndpoint(endpoint)
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 text-lavender" />
          <span>API Endpoint Test</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button 
            onClick={testAllEndpoints} 
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Testing...' : 'Test All Endpoints'}</span>
          </Button>
        </div>

        <div className="space-y-3">
          {testEndpoints.map((endpoint) => {
            const result = testResults[endpoint.name]
            return (
              <div key={endpoint.name} className="border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {result && getStatusIcon(result.status)}
                    <span className="font-medium text-white">{endpoint.name}</span>
                    {result && getStatusBadge(result.status)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => testEndpoint(endpoint)}
                    disabled={isLoading}
                  >
                    Test
                  </Button>
                </div>
                
                <div className="text-sm text-white/70 mb-2">{endpoint.description}</div>
                <div className="text-xs text-white/50 font-mono break-all">{endpoint.url}</div>
                
                {result && (
                  <div className="mt-3 p-3 bg-white/5 rounded">
                    <div className="text-xs text-white/70 mb-2">
                      Status: {result.statusCode || 'N/A'} | 
                      Time: {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                    {result.status === 'success' && (
                      <div className="text-xs text-green-400">
                        ✓ Data received successfully
                      </div>
                    )}
                    {result.status === 'error' && (
                      <div className="text-xs text-red-400">
                        ✗ {result.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <div className="text-sm text-white/70 mb-2">Test Summary</div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                Successful: {Object.values(testResults).filter(r => r.status === 'success').length}
              </div>
              <div>
                Failed: {Object.values(testResults).filter(r => r.status === 'error').length}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
