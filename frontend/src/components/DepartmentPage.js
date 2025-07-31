import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../services/api';
import './DepartmentPage.css';

const DepartmentPage = () => {
  const { departmentId } = useParams();
  const [department, setDepartment] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 20
  });

  const loadDepartmentProducts = useCallback(async (page) => {
    try {
      const response = await apiService.getDepartmentProducts(departmentId, page, pagination.limit);
      if (response.success) {
        setProducts(response.products);
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
    }
  }, [departmentId, pagination.limit]);

  const loadDepartmentData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load department details
      const departmentResponse = await apiService.getDepartment(departmentId);
      if (departmentResponse.success) {
        setDepartment(departmentResponse.department);
      } else {
        setError('Department not found');
        return;
      }

      // Load department products
      await loadDepartmentProducts(1);
    } catch (err) {
      setError('Error loading department: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [departmentId, loadDepartmentProducts]);

  useEffect(() => {
    loadDepartmentData();
  }, [loadDepartmentData]);

  const handlePageChange = (newPage) => {
    loadDepartmentProducts(newPage);
  };

  const handleProductClick = (product) => {
    // Navigate to product detail
    window.location.href = `/products/${product.id}`;
  };

  if (loading) {
    return (
      <div className="department-page-container">
        <div className="loading">Loading department...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="department-page-container">
        <div className="error">Error: {error}</div>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="department-page-container">
        <div className="error">Department not found</div>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="department-page-container">
      {/* Department Header */}
      <div className="department-header">
        <div className="department-header-content">
          <Link to="/" className="back-link">← Back to All Products</Link>
          <div className="department-info">
            <h1>{department.name}</h1>
            <div className="department-stats">
              <span className="product-count">{department.product_count} products</span>
              <span className="avg-price">Average Price: ${department.avg_price}</span>
              <span className="price-range">Price Range: ${department.min_price} - ${department.max_price}</span>
            </div>
            <div className="department-details">
              <span>{department.unique_brands} unique brands</span>
              <span>{department.unique_categories} categories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="products-section">
        {products.length === 0 ? (
          <div className="no-products">
            <p>No products found in this department.</p>
            <Link to="/" className="back-link">← Back to All Products</Link>
          </div>
        ) : (
          <>
            <div className="products-header">
              <h2>Products in {department.name}</h2>
              <p>Showing {products.length} of {pagination.totalProducts} products</p>
            </div>
            
            {/* Product Grid */}
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card" onClick={() => handleProductClick(product)}>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="brand">{product.brand}</p>
                    <p className="category">{product.category}</p>
                    <p className="price">${product.retail_price}</p>
                  </div>
                  <button className="view-details-button">View Details</button>
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
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentPage; 