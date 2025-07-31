import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 20
  });

  const loadProducts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      let response;
      
      if (searchQuery) {
        response = await apiService.searchProducts(searchQuery, page, pagination.limit);
      } else {
        response = await apiService.getProducts(page, pagination.limit);
      }
      
      if (response.success) {
        setProducts(response.data);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.pagination.total / pagination.limit),
          totalProducts: response.pagination.total,
          limit: pagination.limit
        });
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Error loading products: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, pagination.limit]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success) {
        setCategories(response.categories);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    // You can implement category filtering here if needed
  };

  const handlePageChange = (newPage) => {
    loadProducts(newPage);
  };

  if (loading && products.length === 0) {
    return (
      <div className="product-list-container">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
        
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="category-filter"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="products-header">
        <h2>All Products</h2>
        <p>Showing {products.length} of {pagination.totalProducts} products</p>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="brand">{product.brand}</p>
              <p className="category">{product.category}</p>
              <p className="department">{product.department}</p>
              <p className="price">${product.retail_price}</p>
            </div>
            <Link 
              to={`/products/${product.id}`}
              className="view-details-button"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button 
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList; 