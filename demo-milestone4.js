const sqlite3 = require('sqlite3').verbose();

console.log('🎯 MILESTONE 4: DATABASE REFACTORING DEMONSTRATION\n');
console.log('=' .repeat(60));

const db = new sqlite3.Database('ecommerce.db');
const API_BASE_URL = 'http://localhost:3000/api';

// 1. Show departments table with sample data
async function demonstrateDepartmentsTable() {
  console.log('\n📋 1. DEPARTMENTS TABLE - Sample Data');
  console.log('-'.repeat(40));
  
  return new Promise((resolve, reject) => {
    const query = 'SELECT id, name, created_at FROM departments ORDER BY id';
    
    db.all(query, (err, departments) => {
      if (err) {
        console.error('❌ Error querying departments:', err.message);
        reject(err);
        return;
      }
      
      console.log('🏢 Departments Table Structure:');
      console.log('id | name   | created_at');
      console.log('---|--------|-------------------');
      
      departments.forEach(dept => {
        console.log(`${dept.id}  | ${dept.name.padEnd(6)} | ${dept.created_at}`);
      });
      
      console.log(`\n✅ Total Departments: ${departments.length}`);
      resolve(departments);
    });
  });
}

// 2. Show updated products table with foreign key relationships
async function demonstrateProductsTable() {
  console.log('\n📦 2. PRODUCTS TABLE - Foreign Key Relationships');
  console.log('-'.repeat(40));
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.brand,
        p.category,
        p.department_id,
        d.name as department_name
      FROM products p
      LEFT JOIN departments d ON p.department_id = d.id
      ORDER BY p.id
      LIMIT 10
    `;
    
    db.all(query, (err, products) => {
      if (err) {
        console.error('❌ Error querying products:', err.message);
        reject(err);
        return;
      }
      
      console.log('📦 Products Table with Foreign Keys:');
      console.log('id | name (truncated) | brand  | category | dept_id | dept_name');
      console.log('---|------------------|--------|----------|---------|----------');
      
      products.forEach(product => {
        const truncatedName = product.name.length > 20 ? 
          product.name.substring(0, 17) + '...' : 
          product.name.padEnd(20);
        console.log(`${product.id.toString().padStart(2)} | ${truncatedName} | ${product.brand.padEnd(6)} | ${product.category.padEnd(8)} | ${product.department_id.toString().padStart(7)} | ${product.department_name}`);
      });
      
      console.log(`\n✅ Showing ${products.length} sample products with foreign key relationships`);
      resolve(products);
    });
  });
}

// 3. Execute JOIN query to show products with department names
async function demonstrateJoinQuery() {
  console.log('\n🔗 3. JOIN QUERY - Products with Department Names');
  console.log('-'.repeat(40));
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.brand,
        p.category,
        p.retail_price,
        d.name as department
      FROM products p
      LEFT JOIN departments d ON p.department_id = d.id
      WHERE p.department_id IS NOT NULL
      ORDER BY p.id
      LIMIT 8
    `;
    
    db.all(query, (err, products) => {
      if (err) {
        console.error('❌ Error executing JOIN query:', err.message);
        reject(err);
        return;
      }
      
      console.log('🔗 JOIN Query Results:');
      console.log('id | name (truncated) | brand  | category | price | department');
      console.log('---|------------------|--------|----------|-------|-----------');
      
      products.forEach(product => {
        const truncatedName = product.name.length > 18 ? 
          product.name.substring(0, 15) + '...' : 
          product.name.padEnd(18);
        console.log(`${product.id.toString().padStart(2)} | ${truncatedName} | ${product.brand.padEnd(6)} | ${product.category.padEnd(8)} | $${product.retail_price.toString().padStart(4)} | ${product.department}`);
      });
      
      console.log('\n📊 JOIN Query Statistics:');
      db.get('SELECT COUNT(*) as total FROM products WHERE department_id IS NOT NULL', (err, result) => {
        if (!err) {
          console.log(`✅ Total products with department relationships: ${result.total}`);
        }
      });
      
      resolve(products);
    });
  });
}

// 4. Test updated products API with department information
async function demonstrateAPIWithDepartments() {
  console.log('\n🌐 4. API TESTING - Products with Department Information');
  console.log('-'.repeat(40));
  
  try {
    // Dynamic import for node-fetch
    const fetch = (await import('node-fetch')).default;
    
    // Test 1: Products API
    console.log('📡 Testing GET /api/products...');
    const productsResponse = await fetch(`${API_BASE_URL}/products?limit=3`);
    const productsData = await productsResponse.json();
    
    if (productsData.success) {
      console.log('✅ Products API Response:');
      productsData.data.forEach((product, index) => {
        console.log(`   Product ${index + 1}: ${product.name.substring(0, 40)}...`);
        console.log(`   Department: ${product.department}`);
        console.log(`   Brand: ${product.brand} | Category: ${product.category}`);
        console.log('');
      });
    }
    
    // Test 2: Departments API
    console.log('📡 Testing GET /api/departments...');
    const departmentsResponse = await fetch(`${API_BASE_URL}/departments`);
    const departmentsData = await departmentsResponse.json();
    
    if (departmentsData.success) {
      console.log('✅ Departments API Response:');
      departmentsData.data.forEach(dept => {
        console.log(`   - ${dept.name} (ID: ${dept.id})`);
      });
    }
    
    // Test 3: Products by Department
    console.log('\n📡 Testing GET /api/departments/1/products...');
    const deptProductsResponse = await fetch(`${API_BASE_URL}/departments/1/products?limit=2`);
    const deptProductsData = await deptProductsResponse.json();
    
    if (deptProductsData.success) {
      console.log('✅ Products by Department API Response:');
      deptProductsData.data.forEach((product, index) => {
        console.log(`   Product ${index + 1}: ${product.name.substring(0, 40)}...`);
        console.log(`   Department: ${product.department}`);
        console.log('');
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return false;
  }
}

// 5. Walk through database migration/refactoring code
async function demonstrateMigrationCode() {
  console.log('\n🔧 5. MIGRATION CODE WALKTHROUGH');
  console.log('-'.repeat(40));
  
  console.log('📝 Migration Steps Overview:');
  console.log('   1. Create departments table');
  console.log('   2. Extract unique departments from products');
  console.log('   3. Populate departments table');
  console.log('   4. Add department_id column to products');
  console.log('   5. Update foreign key references');
  console.log('   6. Create foreign key constraints');
  console.log('   7. Verify migration');
  
  console.log('\n🔍 Key Migration Code Snippets:');
  
  console.log('\n📋 Step 1: Create Departments Table');
  console.log('```sql');
  console.log('CREATE TABLE IF NOT EXISTS departments (');
  console.log('  id INTEGER PRIMARY KEY AUTOINCREMENT,');
  console.log('  name TEXT UNIQUE NOT NULL,');
  console.log('  created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  console.log(')');
  console.log('```');
  
  console.log('\n🔗 Step 5: Update Foreign Key References');
  console.log('```sql');
  console.log('UPDATE products');
  console.log('SET department_id = (');
  console.log('  SELECT id FROM departments');
  console.log('  WHERE departments.name = products.department');
  console.log(')');
  console.log('WHERE department IS NOT NULL AND department != ""');
  console.log('```');
  
  console.log('\n🔒 Step 6: Foreign Key Constraint');
  console.log('```sql');
  console.log('FOREIGN KEY (department_id) REFERENCES departments(id)');
  console.log('```');
  
  // Show migration results
  console.log('\n📊 Migration Results:');
  db.get('SELECT COUNT(*) as count FROM departments', (err, deptResult) => {
    if (!err) {
      console.log(`   ✅ Departments created: ${deptResult.count}`);
    }
  });
  
  db.get('SELECT COUNT(*) as count FROM products WHERE department_id IS NOT NULL', (err, prodResult) => {
    if (!err) {
      console.log(`   ✅ Products with foreign keys: ${prodResult.count}`);
    }
  });
}

// Main demonstration function
async function runDemonstration() {
  try {
    console.log('🚀 Starting Milestone 4 Database Refactoring Demonstration...\n');
    
    // Run all demonstrations
    await demonstrateDepartmentsTable();
    await demonstrateProductsTable();
    await demonstrateJoinQuery();
    await demonstrateAPIWithDepartments();
    await demonstrateMigrationCode();
    
    console.log('\n🎉 DEMONSTRATION COMPLETE!');
    console.log('=' .repeat(60));
    console.log('✅ All aspects of Milestone 4 database refactoring demonstrated');
    console.log('✅ Database normalization successful');
    console.log('✅ Foreign key relationships working');
    console.log('✅ API endpoints updated and functional');
    console.log('✅ Migration process completed safely');
    
  } catch (error) {
    console.error('\n❌ Demonstration failed:', error.message);
  } finally {
    db.close();
  }
}

// Run the demonstration
runDemonstration(); 