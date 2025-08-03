const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

class APITester {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async testHealthCheck() {
    console.log('🔍 Testing health check...');
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      console.log('✅ Health check:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', error.response?.data || error.message);
      return null;
    }
  }

  async testProductsEndpoints() {
    console.log('\n📦 Testing products endpoints...');
    
    // Test basic products list
    try {
      const response = await axios.get(`${this.baseURL}/products?limit=3`);
      console.log('✅ Products list:', {
        success: response.data.success,
        count: response.data.data.products.length,
        total: response.data.data.pagination.total
      });
    } catch (error) {
      console.error('❌ Products list failed:', error.response?.data || error.message);
    }

    // Test featured products
    try {
      const response = await axios.get(`${this.baseURL}/products/featured?limit=3`);
      console.log('✅ Featured products:', {
        success: response.data.success,
        count: response.data.data.products.length
      });
    } catch (error) {
      console.error('❌ Featured products failed:', error.response?.data || error.message);
    }

    // Test new products
    try {
      const response = await axios.get(`${this.baseURL}/products/new?limit=3`);
      console.log('✅ New products:', {
        success: response.data.success,
        count: response.data.data.products.length
      });
    } catch (error) {
      console.error('❌ New products failed:', error.response?.data || error.message);
    }

    // Test search
    try {
      const response = await axios.get(`${this.baseURL}/products/search?q=whey&limit=2`);
      console.log('✅ Product search:', {
        success: response.data.success,
        count: response.data.data.products.length,
        searchTerm: response.data.data.searchTerm
      });
    } catch (error) {
      console.error('❌ Product search failed:', error.response?.data || error.message);
    }

    // Test single product
    try {
      const response = await axios.get(`${this.baseURL}/products/whey-gold-standard-2kg`);
      console.log('✅ Single product:', {
        success: response.data.success,
        productName: response.data.data.product.name
      });
    } catch (error) {
      console.error('❌ Single product failed:', error.response?.data || error.message);
    }
  }

  async testCategoriesEndpoints() {
    console.log('\n📂 Testing categories endpoints...');
    
    try {
      const response = await axios.get(`${this.baseURL}/categories`);
      console.log('✅ Categories list:', {
        success: response.data.success,
        count: response.data.data.categories.length
      });
    } catch (error) {
      console.error('❌ Categories list failed:', error.response?.data || error.message);
    }
  }

  async testFilteringAndPagination() {
    console.log('\n🔍 Testing filtering and pagination...');
    
    // Test price filtering
    try {
      const response = await axios.get(`${this.baseURL}/products?minPrice=5000&maxPrice=20000&limit=3`);
      console.log('✅ Price filtering:', {
        success: response.data.success,
        count: response.data.data.products.length
      });
    } catch (error) {
      console.error('❌ Price filtering failed:', error.response?.data || error.message);
    }

    // Test category filtering
    try {
      const response = await axios.get(`${this.baseURL}/products?category=4a9f3b9c-491a-4a2a-9b9d-adc90f2bab24&limit=3`);
      console.log('✅ Category filtering:', {
        success: response.data.success,
        count: response.data.data.products.length
      });
    } catch (error) {
      console.error('❌ Category filtering failed:', error.response?.data || error.message);
    }

    // Test sorting
    try {
      const response = await axios.get(`${this.baseURL}/products?sort=price&order=asc&limit=3`);
      console.log('✅ Price sorting:', {
        success: response.data.success,
        count: response.data.data.products.length
      });
    } catch (error) {
      console.error('❌ Price sorting failed:', error.response?.data || error.message);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting API tests...\n');
    
    await this.testHealthCheck();
    await this.testProductsEndpoints();
    await this.testCategoriesEndpoints();
    await this.testFilteringAndPagination();
    
    console.log('\n✨ API tests completed!');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests().catch(console.error);
}

module.exports = APITester;
