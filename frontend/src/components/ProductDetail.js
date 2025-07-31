import React from 'react';
import './ProductDetail.css';

const ProductDetail = ({ product, onBack }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (!product) {
    return (
      <div className="error-container">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <button onClick={onBack} className="back-button">
          ← Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail-header">
        <button onClick={onBack} className="back-button">
          ← Back to Products
        </button>
        <h1>Product Details</h1>
      </div>

      <div className="product-detail-content">
        <div className="product-image-section">
          <div className="product-image-large">
            <div className="product-placeholder-large">
              {product.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="product-info-section">
          <h2 className="product-name-large">{product.name}</h2>
          
          <div className="product-price-large">
            {formatPrice(product.retail_price)}
          </div>

          <div className="product-details-grid">
            <div className="detail-item">
              <span className="detail-label">Brand:</span>
              <span className="detail-value">{product.brand}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{product.category}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Department:</span>
              <span className="detail-value">{product.department}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">SKU:</span>
              <span className="detail-value">{product.sku}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Cost:</span>
              <span className="detail-value">{formatPrice(product.cost)}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Distribution Center:</span>
              <span className="detail-value">#{product.distribution_center_id}</span>
            </div>
          </div>

          <div className="product-actions">
            <button className="add-to-cart-button">
              🛒 Add to Cart
            </button>
            <button className="wishlist-button">
              ❤️ Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 