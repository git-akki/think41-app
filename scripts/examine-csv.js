const fs = require('fs');
const csv = require('csv-parser');

console.log('Examining products.csv structure...');

const results = [];
let rowCount = 0;

fs.createReadStream('ecommerce-dataset/archive/archive/products.csv')
  .pipe(csv())
  .on('data', (data) => {
    if (rowCount < 5) {
      results.push(data);
    }
    rowCount++;
  })
  .on('end', () => {
    console.log('CSV Structure:');
    if (results.length > 0) {
      console.log('Columns:', Object.keys(results[0]));
      console.log('\nFirst 5 rows:');
      results.forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row);
      });
    }
    console.log(`\nTotal rows in file: ${rowCount}`);
  }); 