const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('ecommerce.db');

const handleDatabaseError = (err, res) => {
  console.error('Database error:', err);
  res.status(500).json({
    success: false,
    message: 'Database error occurred',
    error: err.message
  });
};

// GET /api/products - List all products with pagination
app.get('/api/products', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const countQuery = 'SELECT COUNT(*) as total FROM products';
  const productsQuery = `
    SELECT 
      p.id,
      p.cost,
      p.category,
      p.name,
      p.brand,
      p.retail_price,
      p.sku,
      p.distribution_center_id,
      d.name as department
    FROM products p
    LEFT JOIN departments d ON p.department_id = d.id
    ORDER BY p.id
    LIMIT ? OFFSET ?
  `;

  db.get(countQuery, (err, countResult) => {
    if (err) return handleDatabaseError(err, res);

    db.all(productsQuery, [limit, offset], (err, products) => {
      if (err) return handleDatabaseError(err, res);

      const totalProducts = countResult.total;
      const totalPages = Math.ceil(totalProducts / limit);

      res.json({
        success: true,
        data: products,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalProducts: totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    });
  });
});

// GET /api/products/search - Search products by name, category, or brand (placed before :id)
app.get('/api/products/search', (req, res) => {
  const query = req.query.q || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  if (!query.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const searchTerm = `%${query}%`;
  
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM products p
    LEFT JOIN departments d ON p.department_id = d.id
    WHERE p.name LIKE ? OR p.category LIKE ? OR p.brand LIKE ? OR d.name LIKE ?
  `;
  
  const searchQuery = `
    SELECT 
      p.id,
      p.cost,
      p.category,
      p.name,
      p.brand,
      p.retail_price,
      p.sku,
      p.distribution_center_id,
      d.name as department
    FROM products p
    LEFT JOIN departments d ON p.department_id = d.id
    WHERE p.name LIKE ? OR p.category LIKE ? OR p.brand LIKE ? OR d.name LIKE ?
    ORDER BY p.id
    LIMIT ? OFFSET ?
  `;

  db.get(countQuery, [searchTerm, searchTerm, searchTerm, searchTerm], (err, countResult) => {
    if (err) return handleDatabaseError(err, res);

    db.all(searchQuery, [searchTerm, searchTerm, searchTerm, searchTerm, limit, offset], (err, products) => {
      if (err) return handleDatabaseError(err, res);

      const totalProducts = countResult.total;
      const totalPages = Math.ceil(totalProducts / limit);

      res.json({
        success: true,
        data: products,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalProducts: totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    });
  });
});

// GET /api/products/:id - Get specific product by ID
app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);

  if (isNaN(productId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID'
    });
  }

  const query = `
    SELECT 
      p.id,
      p.cost,
      p.category,
      p.name,
      p.brand,
      p.retail_price,
      p.sku,
      p.distribution_center_id,
      d.name as department
    FROM products p
    LEFT JOIN departments d ON p.department_id = d.id
    WHERE p.id = ?
  `;

  db.get(query, [productId], (err, product) => {
    if (err) return handleDatabaseError(err, res);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
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
  const query = 'SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != "" ORDER BY category';

  db.all(query, (err, categories) => {
    if (err) return handleDatabaseError(err, res);

    res.json({
      success: true,
      data: categories.map(cat => cat.category)
    });
  });
});

// GET /api/brands - Get all unique brands
app.get('/api/brands', (req, res) => {
  const query = 'SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand != "" ORDER BY brand';

  db.all(query, (err, brands) => {
    if (err) return handleDatabaseError(err, res);

    res.json({
      success: true,
      data: brands.map(brand => brand.brand)
    });
  });
});

// GET /api/departments - Get all departments
app.get('/api/departments', (req, res) => {
  const query = 'SELECT id, name FROM departments ORDER BY name';

  db.all(query, (err, departments) => {
    if (err) return handleDatabaseError(err, res);

    res.json({
      success: true,
      data: departments
    });
  });
});

// GET /api/departments/:id/products - Get products by department
app.get('/api/departments/:id/products', (req, res) => {
  const departmentId = parseInt(req.params.id);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  if (isNaN(departmentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid department ID'
    });
  }

  const countQuery = 'SELECT COUNT(*) as total FROM products WHERE department_id = ?';
  const productsQuery = `
    SELECT 
      p.id,
      p.cost,
      p.category,
      p.name,
      p.brand,
      p.retail_price,
      p.sku,
      p.distribution_center_id,
      d.name as department
    FROM products p
    LEFT JOIN departments d ON p.department_id = d.id
    WHERE p.department_id = ?
    ORDER BY p.id
    LIMIT ? OFFSET ?
  `;

  db.get(countQuery, [departmentId], (err, countResult) => {
    if (err) return handleDatabaseError(err, res);

    db.all(productsQuery, [departmentId, limit, offset], (err, products) => {
      if (err) return handleDatabaseError(err, res);

      const totalProducts = countResult.total;
      const totalPages = Math.ceil(totalProducts / limit);

      res.json({
        success: true,
        data: products,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalProducts: totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
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
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log('🚀 E-commerce API server running on http://localhost:3000');
  console.log('📊 Database: Connected to ecommerce.db');
  console.log('🔗 Health check: http://localhost:3000/api/health');
  console.log('📦 Products API: http://localhost:3000/api/products');
  console.log('🏢 Departments API: http://localhost:3000/api/departments');
  console.log('✅ Milestone 4: Database refactoring completed!');
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close();
  process.exit(0);
}); 