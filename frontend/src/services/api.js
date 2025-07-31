const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Product methods
  async getProducts(page = 1, limit = 20) {
    return this.request(`/products?page=${page}&limit=${limit}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async searchProducts(query, page = 1, limit = 20) {
    return this.request(`/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  // Department methods
  async getDepartments() {
    return this.request('/departments');
  }

  async getDepartment(id) {
    return this.request(`/departments/${id}`);
  }

  async getDepartmentProducts(departmentId, page = 1, limit = 20) {
    return this.request(`/departments/${departmentId}/products?page=${page}&limit=${limit}`);
  }

  // Utility methods
  async getCategories() {
    return this.request('/categories');
  }

  async getBrands() {
    return this.request('/brands');
  }

  async healthCheck() {
    return this.request('/health');
  }
}

const apiService = new ApiService();
export default apiService; 