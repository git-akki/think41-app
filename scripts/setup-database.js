const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Create database connection
const db = new sqlite3.Database('ecommerce.db');

console.log('Setting up database...');

// Create products table
const createProductsTable = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        cost REAL,
        category TEXT,
        name TEXT,
        brand TEXT,
        retail_price REAL,
        department TEXT,
        sku TEXT UNIQUE,
        distribution_center_id INTEGER
      )
    `;
    
    db.run(sql, (err) => {
      if (err) {
        console.error('Error creating products table:', err);
        reject(err);
      } else {
        console.log('Products table created successfully');
        resolve();
      }
    });
  });
};

// Load CSV data into database
const loadCSVData = () => {
  return new Promise((resolve, reject) => {
    console.log('Loading CSV data...');
    
    const results = [];
    let rowCount = 0;
    
    fs.createReadStream('ecommerce-dataset/archive/archive/products.csv')
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
        rowCount++;
        
        // Process in batches of 1000
        if (results.length >= 1000) {
          insertBatch(results);
          results.length = 0; // Clear array
        }
      })
      .on('end', () => {
        // Insert remaining rows
        if (results.length > 0) {
          insertBatch(results);
        }
        console.log(`Total rows processed: ${rowCount}`);
        resolve();
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
};

// Insert batch of records
const insertBatch = (records) => {
  return new Promise((resolve, reject) => {
    const placeholders = records.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const values = records.flatMap(record => [
      parseInt(record.id),
      parseFloat(record.cost),
      record.category,
      record.name,
      record.brand,
      parseFloat(record.retail_price),
      record.department,
      record.sku,
      parseInt(record.distribution_center_id)
    ]);
    
    const sql = `INSERT OR REPLACE INTO products (id, cost, category, name, brand, retail_price, department, sku, distribution_center_id) VALUES ${placeholders}`;
    
    db.run(sql, values, function(err) {
      if (err) {
        console.error('Error inserting batch:', err);
        reject(err);
      } else {
        console.log(`Inserted ${this.changes} records`);
        resolve();
      }
    });
  });
};

// Verify data was loaded correctly
const verifyData = () => {
  return new Promise((resolve, reject) => {
    console.log('\nVerifying data...');
    
    // Count total records
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      if (err) {
        console.error('Error counting records:', err);
        reject(err);
      } else {
        console.log(`Total products in database: ${row.count}`);
        
        // Show sample records
        db.all('SELECT * FROM products LIMIT 5', (err, rows) => {
          if (err) {
            console.error('Error fetching sample records:', err);
            reject(err);
          } else {
            console.log('\nSample records:');
            rows.forEach((row, index) => {
              console.log(`Record ${index + 1}:`, row);
            });
            resolve();
          }
        });
      }
    });
  });
};

// Main execution
const main = async () => {
  try {
    await createProductsTable();
    await loadCSVData();
    await verifyData();
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('✅ Milestone 1 completed: Database Design and Data Loading');
    
    db.close();
  } catch (error) {
    console.error('❌ Error during database setup:', error);
    db.close();
    process.exit(1);
  }
};

main(); 