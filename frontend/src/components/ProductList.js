import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import './ProductList.css';

const ProductList = ({ onProductClick }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const loadCategories = useCallback(async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      if (searchQuery) {
        response = await apiService.searchProducts(searchQuery, currentPage, 20);
      } else {
        response = await apiService.getProducts(currentPage, 20);
      }
      
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage]);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [loadCategories, loadProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleProductClick = (product) => {
    onProductClick(product);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading && products.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={loadProducts} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍 Search
          </button>
        </form>

        <div className="category-filters">
          <button
            onClick={() => handleCategoryChange('')}
            className={`category-button ${selectedCategory === '' ? 'active' : ''}`}
          >
            All Categories
          </button>
          {categories.slice(0, 10).map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <div className="product-placeholder">
                {product.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-brand">{product.brand}</p>
              <p className="product-category">{product.category}</p>
              <p className="product-department">{product.department}</p>
              <p className="product-price">{formatPrice(product.retail_price)}</p>
              <button 
                onClick={() => handleProductClick(product)} 
                className="view-details-button"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {pagination && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="pagination-button"
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="pagination-button"
          >
            Next →
          </button>
        </div>
      )}

      <div className="results-info">
        Showing {products.length} of {pagination.totalProducts || 0} products
      </div>
    </div>
  );
};

export default ProductList; 