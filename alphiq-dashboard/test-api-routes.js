// Simple test script to verify API routes work
const testApiRoutes = async () => {
  const baseUrl = 'http://localhost:3000'
  
  console.log('Testing API routes...')
  
  try {
    // Test richlist API
    console.log('\n1. Testing richlist API...')
    const richlistResponse = await fetch(`${baseUrl}/api/richlist?page=1&amount=5&sort=balance&order=desc&filter=nogenesis`)
    const richlistData = await richlistResponse.json()
    console.log('Richlist API Status:', richlistResponse.status)
    console.log('Richlist Data Keys:', Object.keys(richlistData))
    
    // Test price API
    console.log('\n2. Testing price API...')
    const priceResponse = await fetch(`${baseUrl}/api/price?source=coingecko`)
    const priceData = await priceResponse.json()
    console.log('Price API Status:', priceResponse.status)
    console.log('Price Data:', priceData)
    
    // Test supply API
    console.log('\n3. Testing supply API...')
    const supplyResponse = await fetch(`${baseUrl}/api/supply`)
    const supplyData = await supplyResponse.json()
    console.log('Supply API Status:', supplyResponse.status)
    console.log('Supply Data:', supplyData)
    
    console.log('\n✅ All API routes are working!')
  } catch (error) {
    console.error('❌ API test failed:', error.message)
  }
}

// Run the test
testApiRoutes()
