import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../services/api';
import './ProductDetail.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getProduct(productId);
      if (response.success) {
        setProduct(response.product);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Error loading product: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [loadProduct]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading">Loading product...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-container">
        <div className="error">Error: {error}</div>
        <Link to="/" className="back-button">← Back to Products</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-container">
        <div className="error">Product not found</div>
        <Link to="/" className="back-button">← Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail-header">
        <Link to="/" className="back-button">
          ← Back to Products
        </Link>
        <h1>Product Details</h1>
      </div>

      <div className="product-detail-content">
        <div className="product-image-section">
          <div className="product-image-placeholder">
            {product.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="product-info-section">
          <h2 className="product-name">{product.name}</h2>
          
          <div className="product-meta">
            <div className="meta-item">
              <span className="label">Brand:</span>
              <span className="value">{product.brand}</span>
            </div>
            <div className="meta-item">
              <span className="label">Category:</span>
              <span className="value">{product.category}</span>
            </div>
            <div className="meta-item">
              <span className="label">Department:</span>
              <span className="value">{product.department}</span>
            </div>
            <div className="meta-item">
              <span className="label">SKU:</span>
              <span className="value">{product.sku}</span>
            </div>
          </div>

          <div className="product-pricing">
            <div className="price-item">
              <span className="label">Retail Price:</span>
              <span className="value retail-price">{formatPrice(product.retail_price)}</span>
            </div>
            <div className="price-item">
              <span className="label">Cost:</span>
              <span className="value cost-price">{formatPrice(product.cost)}</span>
            </div>
            <div className="price-item">
              <span className="label">Profit Margin:</span>
              <span className="value profit-margin">
                {((product.retail_price - product.cost) / product.retail_price * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="product-details">
            <div className="detail-item">
              <span className="label">Distribution Center ID:</span>
              <span className="value">{product.distribution_center_id}</span>
            </div>
            <div className="detail-item">
              <span className="label">Product ID:</span>
              <span className="value">{product.id}</span>
            </div>
          </div>

          <div className="product-actions">
            <Link to="/" className="action-button secondary">
              ← Back to Products
            </Link>
            <Link to="/departments" className="action-button secondary">
              Browse Departments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 