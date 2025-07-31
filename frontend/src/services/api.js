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
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get all products with pagination
  async getProducts(page = 1, limit = 20) {
    return this.request(`/products?page=${page}&limit=${limit}`);
  }

  // Get product by ID
  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  // Search products
  async searchProducts(query, page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (query) {
      params.append('q', query);
    }

    return this.request(`/products/search?${params.toString()}`);
  }

  // Get categories
  async getCategories() {
    return this.request('/categories');
  }

  // Get brands
  async getBrands() {
    return this.request('/brands');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService(); 