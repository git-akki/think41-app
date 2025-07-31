const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = new sqlite3.Database('ecommerce.db');

// Helper function to handle database errors
const handleDatabaseError = (err, res) => {
  console.error('Database error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Database operation failed'
  });
};

// GET /api/products - List all products with pagination
app.get('/api/products', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  // Get total count for pagination
  db.get('SELECT COUNT(*) as total FROM products', (err, countResult) => {
    if (err) {
      return handleDatabaseError(err, res);
    }
    
    // Get paginated products
    const sql = `
      SELECT id, cost, category, name, brand, retail_price, department, sku, distribution_center_id
      FROM products
      ORDER BY id
      LIMIT ? OFFSET ?
    `;
    
    db.all(sql, [limit, offset], (err, products) => {
      if (err) {
        return handleDatabaseError(err, res);
      }
      
      const totalPages = Math.ceil(countResult.total / limit);
      
      res.json({
        success: true,
        data: products,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalProducts: countResult.total,
          limit: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    });
  });
});

// GET /api/products/search - Search products by name, category, or brand
app.get('/api/products/search', (req, res) => {
  const { q, category, brand, department } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  let conditions = [];
  let params = [];
  
  if (q) {
    conditions.push('(name LIKE ? OR category LIKE ? OR brand LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  
  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  
  if (brand) {
    conditions.push('brand = ?');
    params.push(brand);
  }
  
  if (department) {
    conditions.push('department = ?');
    params.push(department);
  }
  
  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  
  // Get total count for pagination
  const countSql = `SELECT COUNT(*) as total FROM products ${whereClause}`;
  db.get(countSql, params, (err, countResult) => {
    if (err) {
      return handleDatabaseError(err, res);
    }
    
    // Get paginated search results
    const sql = `
      SELECT id, cost, category, name, brand, retail_price, department, sku, distribution_center_id
      FROM products
      ${whereClause}
      ORDER BY id
      LIMIT ? OFFSET ?
    `;
    
    db.all(sql, [...params, limit, offset], (err, products) => {
      if (err) {
        return handleDatabaseError(err, res);
      }
      
      const totalPages = Math.ceil(countResult.total / limit);
      
      res.json({
        success: true,
        data: products,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalProducts: countResult.total,
          limit: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        searchParams: { q, category, brand, department }
      });
    });
  });
});

// GET /api/products/:id - Get specific product by ID
app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  
  if (isNaN(productId)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Invalid product ID. Must be a number.'
    });
  }
  
  const sql = `
    SELECT id, cost, category, name, brand, retail_price, department, sku, distribution_center_id
    FROM products
    WHERE id = ?
  `;
  
  db.get(sql, [productId], (err, product) => {
    if (err) {
      return handleDatabaseError(err, res);
    }
    
    if (!product) {
      return res.status(404).json({
        error: 'Not found',
        message: `Product with ID ${productId} not found`
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  });
});

// GET /api/categories - Get all unique categories
app.get('/api/categories', (req, res) => {
  const sql = 'SELECT DISTINCT category FROM products ORDER BY category';
  
  db.all(sql, [], (err, categories) => {
    if (err) {
      return handleDatabaseError(err, res);
    }
    
    res.json({
      success: true,
      data: categories.map(cat => cat.category)
    });
  });
});

// GET /api/brands - Get all unique brands
app.get('/api/brands', (req, res) => {
  const sql = 'SELECT DISTINCT brand FROM products ORDER BY brand';
  
  db.all(sql, [], (err, brands) => {
    if (err) {
      return handleDatabaseError(err, res);
    }
    
    res.json({
      success: true,
      data: brands.map(brand => brand.brand)
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'E-commerce API is running',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on the server'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 E-commerce API server running on http://localhost:${PORT}`);
  console.log(`📊 Database: Connected to ecommerce.db`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
  console.log('✅ Milestone 2: REST API for Products is ready!');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
}); 