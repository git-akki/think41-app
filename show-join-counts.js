const sqlite3 = require('sqlite3').verbose();

console.log('🔍 Database JOIN Count Queries Demonstration\n');
console.log('=' .repeat(60));

const db = new sqlite3.Database('ecommerce.db');

// Query 1: Basic department count with JOIN
console.log('1. Basic Department Count with LEFT JOIN');
console.log('-'.repeat(40));

const basicCountQuery = `
  SELECT 
    d.id,
    d.name,
    COUNT(p.id) as product_count
  FROM departments d
  LEFT JOIN products p ON d.id = p.department_id
  GROUP BY d.id, d.name
  ORDER BY d.name
`;

db.all(basicCountQuery, (err, results) => {
  if (err) {
    console.error('❌ Error:', err.message);
    return;
  }
  
  console.log('Results:');
  results.forEach(dept => {
    console.log(`   ${dept.name}: ${dept.product_count} products`);
  });
  
  // Query 2: Advanced count with multiple aggregations
  console.log('\n2. Advanced Count with Multiple Aggregations');
  console.log('-'.repeat(40));
  
  const advancedCountQuery = `
    SELECT 
      d.id,
      d.name,
      COUNT(p.id) as total_products,
      COUNT(DISTINCT p.brand) as unique_brands,
      COUNT(DISTINCT p.category) as unique_categories,
      AVG(p.retail_price) as avg_price,
      MIN(p.retail_price) as min_price,
      MAX(p.retail_price) as max_price
    FROM departments d
    LEFT JOIN products p ON d.id = p.department_id
    GROUP BY d.id, d.name
    ORDER BY d.name
  `;
  
  db.all(advancedCountQuery, (err, results) => {
    if (err) {
      console.error('❌ Error:', err.message);
      return;
    }
    
    console.log('Results:');
    results.forEach(dept => {
      console.log(`   ${dept.name}:`);
      console.log(`     Total Products: ${dept.total_products}`);
      console.log(`     Unique Brands: ${dept.unique_brands}`);
      console.log(`     Unique Categories: ${dept.unique_categories}`);
      console.log(`     Price Range: $${dept.min_price} - $${dept.max_price}`);
      console.log(`     Average Price: $${dept.avg_price.toFixed(2)}`);
      console.log('');
    });
    
    // Query 3: Conditional count with CASE statements
    console.log('3. Conditional Count with CASE Statements');
    console.log('-'.repeat(40));
    
    const conditionalCountQuery = `
      SELECT 
        d.name,
        COUNT(p.id) as total_products,
        COUNT(CASE WHEN p.retail_price > 50 THEN 1 END) as expensive_products,
        COUNT(CASE WHEN p.retail_price <= 50 THEN 1 END) as affordable_products,
        COUNT(CASE WHEN p.retail_price > 100 THEN 1 END) as premium_products
      FROM departments d
      LEFT JOIN products p ON d.id = p.department_id
      GROUP BY d.id, d.name
      ORDER BY d.name
    `;
    
    db.all(conditionalCountQuery, (err, results) => {
      if (err) {
        console.error('❌ Error:', err.message);
        return;
      }
      
      console.log('Results:');
      results.forEach(dept => {
        console.log(`   ${dept.name}:`);
        console.log(`     Total: ${dept.total_products}`);
        console.log(`     Expensive (>$50): ${dept.expensive_products}`);
        console.log(`     Affordable (≤$50): ${dept.affordable_products}`);
        console.log(`     Premium (>$100): ${dept.premium_products}`);
        console.log('');
      });
      
      // Query 4: Count comparison between departments
      console.log('4. Department Count Comparison');
      console.log('-'.repeat(40));
      
      const comparisonQuery = `
        SELECT 
          'Total Products' as metric,
          SUM(CASE WHEN d.name = 'Women' THEN 1 ELSE 0 END) as Women,
          SUM(CASE WHEN d.name = 'Men' THEN 1 ELSE 0 END) as Men
        FROM departments d
        LEFT JOIN products p ON d.id = p.department_id
        UNION ALL
        SELECT 
          'Unique Brands' as metric,
          COUNT(DISTINCT CASE WHEN d.name = 'Women' THEN p.brand END) as Women,
          COUNT(DISTINCT CASE WHEN d.name = 'Men' THEN p.brand END) as Men
        FROM departments d
        LEFT JOIN products p ON d.id = p.department_id
        UNION ALL
        SELECT 
          'Unique Categories' as metric,
          COUNT(DISTINCT CASE WHEN d.name = 'Women' THEN p.category END) as Women,
          COUNT(DISTINCT CASE WHEN d.name = 'Men' THEN p.category END) as Men
        FROM departments d
        LEFT JOIN products p ON d.id = p.department_id
      `;
      
      db.all(comparisonQuery, (err, results) => {
        if (err) {
          console.error('❌ Error:', err.message);
          return;
        }
        
        console.log('Results:');
        console.log('Metric              | Women  | Men');
        console.log('-------------------|--------|------');
        results.forEach(row => {
          console.log(`${row.metric.padEnd(18)} | ${row.Women.toString().padStart(6)} | ${row.Men.toString().padStart(4)}`);
        });
        
        console.log('\n🎉 JOIN Count Queries Demonstration Complete!');
        console.log('✅ All count operations use efficient JOIN queries');
        console.log('✅ LEFT JOIN ensures all departments are included');
        console.log('✅ GROUP BY enables aggregation by department');
        
        db.close();
      });
    });
  });
}); 