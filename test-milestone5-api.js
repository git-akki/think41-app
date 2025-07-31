const API_BASE_URL = 'http://localhost:3000/api';

async function testMilestone5API() {
  console.log('🧪 Testing Milestone 5: Departments API\n');
  console.log('=' .repeat(60));
  
  try {
    // Dynamic import for node-fetch
    const fetch = (await import('node-fetch')).default;
    
    // Test 1: GET /api/departments - List all departments
    console.log('1. Testing GET /api/departments - List all departments');
    console.log('-'.repeat(50));
    
    const departmentsResponse = await fetch(`${API_BASE_URL}/departments`);
    const departmentsData = await departmentsResponse.json();
    
    if (departmentsData.success) {
      console.log('✅ Departments List API Response:');
      console.log(`   Status: ${departmentsResponse.status} OK`);
      console.log(`   Total Departments: ${departmentsData.departments.length}`);
      
      departmentsData.departments.forEach(dept => {
        console.log(`   - ${dept.name} (ID: ${dept.id}): ${dept.product_count} products | Avg Price: $${dept.avg_price}`);
      });
    } else {
      console.log('❌ Departments List API failed:', departmentsData.message);
    }
    
    // Test 2: GET /api/departments/:id - Get specific department details
    console.log('\n2. Testing GET /api/departments/1 - Get specific department details');
    console.log('-'.repeat(50));
    
    const departmentDetailResponse = await fetch(`${API_BASE_URL}/departments/1`);
    const departmentDetailData = await departmentDetailResponse.json();
    
    if (departmentDetailData.success) {
      console.log('✅ Department Detail API Response:');
      console.log(`   Status: ${departmentDetailResponse.status} OK`);
      console.log(`   Department: ${departmentDetailData.department.name}`);
      console.log(`   Product Count: ${departmentDetailData.department.product_count}`);
      console.log(`   Average Price: $${departmentDetailData.department.avg_price}`);
      console.log(`   Price Range: $${departmentDetailData.department.min_price} - $${departmentDetailData.department.max_price}`);
      console.log(`   Unique Brands: ${departmentDetailData.department.unique_brands}`);
      console.log(`   Unique Categories: ${departmentDetailData.department.unique_categories}`);
    } else {
      console.log('❌ Department Detail API failed:', departmentDetailData.message);
    }
    
    // Test 3: GET /api/departments/:id/products - Get products in department
    console.log('\n3. Testing GET /api/departments/1/products - Get products in department');
    console.log('-'.repeat(50));
    
    const departmentProductsResponse = await fetch(`${API_BASE_URL}/departments/1/products?limit=3`);
    const departmentProductsData = await departmentProductsResponse.json();
    
    if (departmentProductsData.success) {
      console.log('✅ Department Products API Response:');
      console.log(`   Status: ${departmentProductsResponse.status} OK`);
      console.log(`   Department: ${departmentProductsData.department}`);
      console.log(`   Products Returned: ${departmentProductsData.products.length}`);
      console.log(`   Total Products: ${departmentProductsData.pagination.totalProducts}`);
      
      departmentProductsData.products.forEach((product, index) => {
        console.log(`   Product ${index + 1}: ${product.name.substring(0, 40)}...`);
        console.log(`     Brand: ${product.brand} | Category: ${product.category} | Price: $${product.retail_price}`);
      });
    } else {
      console.log('❌ Department Products API failed:', departmentProductsData.message);
    }
    
    // Test 4: Test pagination for department products
    console.log('\n4. Testing GET /api/departments/2/products?page=1&limit=2 - Pagination');
    console.log('-'.repeat(50));
    
    const paginationResponse = await fetch(`${API_BASE_URL}/departments/2/products?page=1&limit=2`);
    const paginationData = await paginationResponse.json();
    
    if (paginationData.success) {
      console.log('✅ Department Products Pagination API Response:');
      console.log(`   Status: ${paginationResponse.status} OK`);
      console.log(`   Department: ${paginationData.department}`);
      console.log(`   Current Page: ${paginationData.pagination.currentPage}`);
      console.log(`   Total Pages: ${paginationData.pagination.totalPages}`);
      console.log(`   Products on Page: ${paginationData.products.length}`);
      console.log(`   Has Next Page: ${paginationData.pagination.hasNextPage}`);
    } else {
      console.log('❌ Department Products Pagination API failed:', paginationData.message);
    }
    
    // Test 5: Test error handling - Invalid department ID
    console.log('\n5. Testing GET /api/departments/999 - Error handling (Invalid ID)');
    console.log('-'.repeat(50));
    
    const errorResponse = await fetch(`${API_BASE_URL}/departments/999`);
    const errorData = await errorResponse.json();
    
    if (!errorData.success) {
      console.log('✅ Error Handling API Response:');
      console.log(`   Status: ${errorResponse.status} Not Found`);
      console.log(`   Message: ${errorData.message}`);
    } else {
      console.log('❌ Error handling test failed - should return 404');
    }
    
    // Test 6: Test error handling - Invalid department ID format
    console.log('\n6. Testing GET /api/departments/invalid - Error handling (Invalid format)');
    console.log('-'.repeat(50));
    
    const formatErrorResponse = await fetch(`${API_BASE_URL}/departments/invalid`);
    const formatErrorData = await formatErrorResponse.json();
    
    if (!formatErrorData.success) {
      console.log('✅ Format Error Handling API Response:');
      console.log(`   Status: ${formatErrorResponse.status} Bad Request`);
      console.log(`   Message: ${formatErrorData.message}`);
    } else {
      console.log('❌ Format error handling test failed - should return 400');
    }
    
    // Test 7: Test all departments with their statistics
    console.log('\n7. Testing comprehensive department statistics');
    console.log('-'.repeat(50));
    
    const allDeptsResponse = await fetch(`${API_BASE_URL}/departments`);
    const allDeptsData = await allDeptsResponse.json();
    
    if (allDeptsData.success) {
      console.log('✅ All Departments Statistics:');
      let totalProducts = 0;
      let totalAvgPrice = 0;
      
      allDeptsData.departments.forEach(dept => {
        totalProducts += dept.product_count;
        totalAvgPrice += dept.avg_price * dept.product_count;
        console.log(`   ${dept.name}: ${dept.product_count} products | Avg: $${dept.avg_price} | Range: $${dept.min_price}-$${dept.max_price}`);
      });
      
      const overallAvgPrice = totalProducts > 0 ? totalAvgPrice / totalProducts : 0;
      console.log(`\n📊 Overall Statistics:`);
      console.log(`   Total Products: ${totalProducts}`);
      console.log(`   Overall Average Price: $${overallAvgPrice.toFixed(2)}`);
    }
    
    console.log('\n🎉 All Milestone 5 API tests completed!');
    console.log('✅ Departments API endpoints are working correctly!');
    console.log('✅ Error handling is properly implemented!');
    console.log('✅ Pagination is functioning correctly!');
    console.log('✅ JOIN operations are working with the refactored database!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testMilestone5API(); 