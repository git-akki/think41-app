const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

console.log('🔄 Starting Database Refactoring: Departments Table Migration\n');

const db = new sqlite3.Database('ecommerce.db');

// Step 1: Create departments table
const createDepartmentsTable = () => {
  return new Promise((resolve, reject) => {
    console.log('📋 Step 1: Creating departments table...');
    
    const sql = `
      CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    db.run(sql, (err) => {
      if (err) {
        console.error('❌ Error creating departments table:', err.message);
        reject(err);
      } else {
        console.log('✅ Departments table created successfully');
        resolve();
      }
    });
  });
};

// Step 2: Extract unique departments from products
const extractUniqueDepartments = () => {
  return new Promise((resolve, reject) => {
    console.log('\n📊 Step 2: Extracting unique departments from products...');
    
    const sql = 'SELECT DISTINCT department FROM products WHERE department IS NOT NULL AND department != ""';
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('❌ Error extracting departments:', err.message);
        reject(err);
      } else {
        console.log(`✅ Found ${rows.length} unique departments`);
        resolve(rows);
      }
    });
  });
};

// Step 3: Populate departments table
const populateDepartmentsTable = (departments) => {
  return new Promise((resolve, reject) => {
    console.log('\n📝 Step 3: Populating departments table...');
    
    if (departments.length === 0) {
      console.log('⚠️ No departments to insert');
      resolve();
      return;
    }
    
    const placeholders = departments.map(() => '(?)').join(', ');
    const values = departments.map(dept => dept.department);
    
    const sql = `INSERT OR IGNORE INTO departments (name) VALUES ${placeholders}`;
    
    db.run(sql, values, function(err) {
      if (err) {
        console.error('❌ Error populating departments:', err.message);
        reject(err);
      } else {
        console.log(`✅ Inserted ${this.changes} departments into departments table`);
        resolve();
      }
    });
  });
};

// Step 4: Add department_id column to products table
const addDepartmentIdColumn = () => {
  return new Promise((resolve, reject) => {
    console.log('\n🔧 Step 4: Adding department_id column to products table...');
    
    const sql = 'ALTER TABLE products ADD COLUMN department_id INTEGER';
    
    db.run(sql, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('❌ Error adding department_id column:', err.message);
        reject(err);
      } else {
        console.log('✅ department_id column added to products table');
        resolve();
      }
    });
  });
};

// Step 5: Update products table with department_id foreign keys
const updateProductDepartmentIds = () => {
  return new Promise((resolve, reject) => {
    console.log('\n🔗 Step 5: Updating products with department foreign keys...');
    
    const sql = `
      UPDATE products 
      SET department_id = (
        SELECT id 
        FROM departments 
        WHERE departments.name = products.department
      )
      WHERE department IS NOT NULL AND department != ""
    `;
    
    db.run(sql, function(err) {
      if (err) {
        console.error('❌ Error updating department foreign keys:', err.message);
        reject(err);
      } else {
        console.log(`✅ Updated ${this.changes} products with department foreign keys`);
        resolve();
      }
    });
  });
};

// Step 6: Create foreign key constraint
const createForeignKeyConstraint = () => {
  return new Promise((resolve, reject) => {
    console.log('\n🔒 Step 6: Creating foreign key constraint...');
    
    // SQLite doesn't support adding foreign key constraints to existing tables
    // We'll create a new table with the constraint and migrate data
    const createNewProductsTable = `
      CREATE TABLE products_new (
        id INTEGER PRIMARY KEY,
        cost REAL,
        category TEXT,
        name TEXT,
        brand TEXT,
        retail_price REAL,
        department_id INTEGER,
        sku TEXT UNIQUE,
        distribution_center_id INTEGER,
        FOREIGN KEY (department_id) REFERENCES departments(id)
      )
    `;
    
    const copyData = `
      INSERT INTO products_new 
      SELECT id, cost, category, name, brand, retail_price, department_id, sku, distribution_center_id 
      FROM products
    `;
    
    const dropOldTable = 'DROP TABLE products';
    const renameTable = 'ALTER TABLE products_new RENAME TO products';
    
    db.serialize(() => {
      db.run('PRAGMA foreign_keys = ON');
      
      db.run(createNewProductsTable, (err) => {
        if (err) {
          console.error('❌ Error creating new products table:', err.message);
          reject(err);
        } else {
          console.log('✅ New products table created with foreign key constraint');
          
          db.run(copyData, function(err) {
            if (err) {
              console.error('❌ Error copying data:', err.message);
              reject(err);
            } else {
              console.log(`✅ Copied ${this.changes} products to new table`);
              
              db.run(dropOldTable, (err) => {
                if (err) {
                  console.error('❌ Error dropping old table:', err.message);
                  reject(err);
                } else {
                  console.log('✅ Old products table dropped');
                  
                  db.run(renameTable, (err) => {
                    if (err) {
                      console.error('❌ Error renaming table:', err.message);
                      reject(err);
                    } else {
                      console.log('✅ Table renamed successfully');
                      resolve();
                    }
                  });
                }
              });
            }
          });
        }
      });
    });
  });
};

// Step 7: Verify the migration
const verifyMigration = () => {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Step 7: Verifying migration...');
    
    const queries = [
      'SELECT COUNT(*) as count FROM departments',
      'SELECT COUNT(*) as count FROM products WHERE department_id IS NOT NULL',
      'SELECT d.name, COUNT(p.id) as product_count FROM departments d LEFT JOIN products p ON d.id = p.department_id GROUP BY d.id, d.name'
    ];
    
    Promise.all(queries.map(query => {
      return new Promise((resolve, reject) => {
        db.get(query, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    })).then(results => {
      console.log(`✅ Departments table has ${results[0].count} departments`);
      console.log(`✅ Products table has ${results[1].count} products with department_id`);
      console.log('\n📊 Department distribution:');
      
      db.all(queries[2], (err, rows) => {
        if (err) {
          console.error('❌ Error getting department distribution:', err.message);
          reject(err);
        } else {
          rows.forEach(row => {
            console.log(`   ${row.name}: ${row.product_count} products`);
          });
          console.log('\n🎉 Database refactoring completed successfully!');
          resolve();
        }
      });
    }).catch(reject);
  });
};

// Main migration function
const runMigration = async () => {
  try {
    await createDepartmentsTable();
    const departments = await extractUniqueDepartments();
    await populateDepartmentsTable(departments);
    await addDepartmentIdColumn();
    await updateProductDepartmentIds();
    await createForeignKeyConstraint();
    await verifyMigration();
    
    console.log('\n✅ Milestone 4: Database refactoring completed!');
    console.log('📋 Departments are now in a separate table with proper foreign key relationships');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
};

// Run the migration
runMigration(); 