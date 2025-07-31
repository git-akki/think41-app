import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import DepartmentList from './components/DepartmentList';
import DepartmentPage from './components/DepartmentPage';

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleBackToList = () => {
    setSelectedProduct(null);
  };

  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Home page with all products */}
            <Route 
              path="/" 
              element={
                selectedProduct ? (
                  <ProductDetail 
                    product={selectedProduct} 
                    onBack={handleBackToList}
                  />
                ) : (
                  <ProductList onProductClick={handleProductClick} />
                )
              } 
            />
            
            {/* Departments list page */}
            <Route path="/departments" element={<DepartmentList />} />
            
            {/* Individual department page */}
            <Route path="/departments/:departmentId" element={<DepartmentPage />} />
            
            {/* Product detail page */}
            <Route 
              path="/products/:productId" 
              element={<ProductDetail product={null} onBack={() => window.history.back()} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
