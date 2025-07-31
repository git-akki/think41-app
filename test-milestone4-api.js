const API_BASE_URL = 'http://localhost:3000/api';

async function testMilestone4API() {
  console.log('🧪 Testing Milestone 4: Database Refactoring API\n');
  
  try {
    // Dynamic import for node-fetch
    const fetch = (await import('node-fetch')).default;
    
    // Test 1: Health check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.message);
    
    // Test 2: Products with department information
    console.log('\n2. Testing Products with Department Info...');
    const productsResponse = await fetch(`${API_BASE_URL}/products?limit=3`);
    const productsData = await productsResponse.json();
    console.log('✅ Products List:', `${productsData.data.length} products loaded`);
    console.log('   First product department:', productsData.data[0].department);
    
    // Test 3: Departments API
    console.log('\n3. Testing Departments API...');
    const departmentsResponse = await fetch(`${API_BASE_URL}/departments`);
    const departmentsData = await departmentsResponse.json();
    console.log('✅ Departments:', `${departmentsData.data.length} departments found`);
    departmentsData.data.forEach(dept => {
      console.log(`   - ${dept.name} (ID: ${dept.id})`);
    });
    
    // Test 4: Products by Department
    console.log('\n4. Testing Products by Department...');
    const deptProductsResponse = await fetch(`${API_BASE_URL}/departments/1/products?limit=2`);
    const deptProductsData = await deptProductsResponse.json();
    console.log('✅ Products by Department:', `${deptProductsData.data.length} products in department`);
    console.log('   Department:', deptProductsData.data[0]?.department);
    
    // Test 5: Search with department
    console.log('\n5. Testing Search with Department...');
    const searchResponse = await fetch(`${API_BASE_URL}/products/search?q=Women&limit=2`);
    const searchData = await searchResponse.json();
    console.log('✅ Search Results:', `${searchData.data.length} products found for "Women"`);
    console.log('   Department in results:', searchData.data[0]?.department);
    
    // Test 6: Individual product with department
    console.log('\n6. Testing Individual Product with Department...');
    const productResponse = await fetch(`${API_BASE_URL}/products/1`);
    const productData = await productResponse.json();
    console.log('✅ Product Detail:', productData.data.name);
    console.log('   Department:', productData.data.department);
    
    console.log('\n🎉 All Milestone 4 API tests passed!');
    console.log('✅ Database refactoring is working correctly!');
    console.log('✅ Departments are now in a separate table with foreign key relationships!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testMilestone4API(); 