const sqlite3 = require('sqlite3').verbose();

console.log('🔍 Verifying Database Structure After Refactoring\n');

const db = new sqlite3.Database('ecommerce.db');

// Check tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('❌ Error checking tables:', err.message);
    return;
  }
  
  console.log('📋 Tables in database:');
  tables.forEach(table => {
    console.log(`   - ${table.name}`);
  });
  
  // Check departments table structure
  db.all("PRAGMA table_info(departments)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking departments table:', err.message);
      return;
    }
    
    console.log('\n🏢 Departments table structure:');
    columns.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`);
    });
    
    // Check products table structure
    db.all("PRAGMA table_info(products)", (err, columns) => {
      if (err) {
        console.error('❌ Error checking products table:', err.message);
        return;
      }
      
      console.log('\n📦 Products table structure:');
      columns.forEach(col => {
        console.log(`   - ${col.name} (${col.type})`);
      });
      
      // Check sample data
      db.get("SELECT COUNT(*) as count FROM departments", (err, result) => {
        if (err) {
          console.error('❌ Error counting departments:', err.message);
          return;
        }
        
        console.log(`\n📊 Departments count: ${result.count}`);
        
        db.get("SELECT COUNT(*) as count FROM products", (err, result) => {
          if (err) {
            console.error('❌ Error counting products:', err.message);
            return;
          }
          
          console.log(`📊 Products count: ${result.count}`);
          
          // Test a simple query
          db.get("SELECT * FROM products LIMIT 1", (err, product) => {
            if (err) {
              console.error('❌ Error querying products:', err.message);
              return;
            }
            
            console.log('\n🔍 Sample product:');
            console.log(product);
            
            db.close();
          });
        });
      });
    });
  });
}); 