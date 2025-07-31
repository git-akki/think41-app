import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">🛍️ E-Commerce Store</Link>
        </div>
        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            All Products
          </Link>
          <Link 
            to="/departments" 
            className={`nav-link ${location.pathname.startsWith('/departments') ? 'active' : ''}`}
          >
            Departments
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 