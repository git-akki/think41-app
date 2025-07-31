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

// ===== MILESTONE 5: DEPARTMENTS API ENDPOINTS =====

// GET /api/departments - List all departments with product count
app.get('/api/departments', (req, res) => {
  const query = `
    SELECT 
      d.id,
      d.name,
      COUNT(p.id) as product_count,
      AVG(p.retail_price) as avg_price,
      MIN(p.retail_price) as min_price,
      MAX(p.retail_price) as max_price
    FROM departments d
    LEFT JOIN products p ON d.id = p.department_id
    GROUP BY d.id, d.name
    ORDER BY d.name
  `;

  db.all(query, (err, departments) => {
    if (err) return handleDatabaseError(err, res);

    res.json({
      success: true,
      departments: departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        product_count: dept.product_count,
        avg_price: dept.avg_price ? parseFloat(dept.avg_price.toFixed(2)) : 0,
        min_price: dept.min_price ? parseFloat(dept.min_price) : 0,
        max_price: dept.max_price ? parseFloat(dept.max_price) : 0
      }))
    });
  });
});

// GET /api/departments/:id - Get specific department details
app.get('/api/departments/:id', (req, res) => {
  const departmentId = parseInt(req.params.id);

  if (isNaN(departmentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid department ID'
    });
  }

  const query = `
    SELECT 
      d.id,
      d.name,
      d.created_at,
      COUNT(p.id) as product_count,
      AVG(p.retail_price) as avg_price,
      MIN(p.retail_price) as min_price,
      MAX(p.retail_price) as max_price,
      COUNT(DISTINCT p.brand) as unique_brands,
      COUNT(DISTINCT p.category) as unique_categories
    FROM departments d
    LEFT JOIN products p ON d.id = p.department_id
    WHERE d.id = ?
    GROUP BY d.id, d.name, d.created_at
  `;

  db.get(query, [departmentId], (err, department) => {
    if (err) return handleDatabaseError(err, res);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      department: {
        id: department.id,
        name: department.name,
        created_at: department.created_at,
        product_count: department.product_count,
        avg_price: department.avg_price ? parseFloat(department.avg_price.toFixed(2)) : 0,
        min_price: department.min_price ? parseFloat(department.min_price) : 0,
        max_price: department.max_price ? parseFloat(department.max_price) : 0,
        unique_brands: department.unique_brands,
        unique_categories: department.unique_categories
      }
    });
  });
});

// GET /api/departments/:id/products - Get all products in a department
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

  // First, check if department exists
  db.get('SELECT id, name FROM departments WHERE id = ?', [departmentId], (err, department) => {
    if (err) return handleDatabaseError(err, res);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
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
          department: department.name,
          products: products,
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
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'E-commerce API is running',
    timestamp: new Date().toISOString(),
    database: 'Connected',
    endpoints: {
      products: '/api/products',
      departments: '/api/departments',
      categories: '/api/categories',
      brands: '/api/brands'
    }
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
  console.log('✅ Milestone 5: Departments API completed!');
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close();
  process.exit(0);
}); 