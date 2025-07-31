const API_BASE_URL = 'http://localhost:3000/api';

async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API Connection\n');
  
  try {
    // Dynamic import for node-fetch
    const fetch = (await import('node-fetch')).default;
    
    // Test health endpoint
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.message);
    
    // Test products endpoint
    console.log('\n2. Testing Products List...');
    const productsResponse = await fetch(`${API_BASE_URL}/products?limit=3`);
    const productsData = await productsResponse.json();
    console.log('✅ Products List:', `${productsData.data.length} products loaded`);
    console.log('   First product:', productsData.data[0].name);
    
    // Test categories endpoint
    console.log('\n3. Testing Categories...');
    const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories:', `${categoriesData.data.length} categories loaded`);
    
    // Test search endpoint
    console.log('\n4. Testing Search...');
    const searchResponse = await fetch(`${API_BASE_URL}/products/search?q=Calvin&limit=2`);
    const searchData = await searchResponse.json();
    console.log('✅ Search Results:', `${searchData.data.length} products found for "Calvin"`);
    
    console.log('\n🎉 All API tests passed! Frontend can connect to backend successfully.');
    console.log('✅ Milestone 3: Frontend UI is ready for integration!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testFrontendAPI(); 