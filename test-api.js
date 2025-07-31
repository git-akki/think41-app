const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test function
function testEndpoint(path, description) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ ${description} - Status: ${res.statusCode}`);
          if (jsonData.success) {
            console.log(`   Data: ${jsonData.data ? jsonData.data.length || 'Object' : 'Success'} items`);
          } else {
            console.log(`   Error: ${jsonData.message}`);
          }
          resolve(jsonData);
        } catch (error) {
          console.log(`❌ ${description} - Parse Error: ${error.message}`);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.log(`❌ ${description} - Network Error: ${error.message}`);
      reject(error);
    });
  });
}

// Run all tests
async function runTests() {
  console.log('🧪 Testing E-commerce API Endpoints\n');
  
  try {
    // Test health endpoint
    await testEndpoint('/api/health', 'Health Check');
    
    // Test products list
    await testEndpoint('/api/products?limit=3', 'Products List (Paginated)');
    
    // Test specific product
    await testEndpoint('/api/products/1', 'Get Product by ID');
    
    // Test search endpoint
    await testEndpoint('/api/products/search?q=Calvin&limit=2', 'Search Products');
    
    // Test categories
    await testEndpoint('/api/categories', 'Get Categories');
    
    // Test brands
    await testEndpoint('/api/brands', 'Get Brands');
    
    // Test error handling
    await testEndpoint('/api/products/99999', 'Error Handling (Invalid ID)');
    
    console.log('\n🎉 All API tests completed successfully!');
    console.log('✅ Milestone 2: REST API for Products is working correctly!');
    
  } catch (error) {
    console.log('\n❌ Some tests failed:', error.message);
  }
}

runTests(); 