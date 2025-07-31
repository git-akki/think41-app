import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          🛍️ E-Commerce Store
        </div>
        <nav className="nav">
          <span className="nav-link">
            Products
          </span>
        </nav>
      </div>
    </header>
  );
};

export default Header; 