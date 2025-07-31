import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import './DepartmentList.css';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDepartments();
      if (response.success) {
        setDepartments(response.departments);
      } else {
        setError('Failed to load departments');
      }
    } catch (err) {
      setError('Error loading departments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="department-list-container">
        <div className="loading">Loading departments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="department-list-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="department-list-container">
      <h2>Shop by Department</h2>
      <div className="departments-grid">
        {departments.map((department) => (
          <Link 
            key={department.id} 
            to={`/departments/${department.id}`}
            className="department-card"
          >
            <div className="department-icon">
              {department.name === 'Women' ? '👗' : '👔'}
            </div>
            <div className="department-info">
              <h3>{department.name}</h3>
              <p>{department.product_count} products</p>
              <div className="department-stats">
                <span>Avg: ${department.avg_price}</span>
                <span>${department.min_price} - ${department.max_price}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DepartmentList; 