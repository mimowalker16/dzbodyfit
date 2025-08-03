const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

class OrderTester {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.userToken = null;
    this.testUserId = null;
  }

  async setupTestUser() {
    console.log('🔧 Setting up test user...');
    
    try {
      // Register test user
      const regResponse = await axios.post(`${this.baseURL}/auth/register`, {
        email: `order-test-${Date.now()}@example.com`,
        password: 'TestPass123',
        firstName: 'Order',
        lastName: 'Test'
      });
      
      this.userToken = regResponse.data.data.tokens.accessToken;
      this.testUserId = regResponse.data.data.user.id;
      console.log('✅ Test user created:', this.testUserId);
      
      // Add item to cart first
      await axios.post(`${this.baseURL}/cart/items`, {
        productId: '90046061-694c-4ef2-a7e7-6e0d904d8c22',
        quantity: 2
      }, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      console.log('✅ Item added to cart');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async testOrderCreation() {
    console.log('\n📦 Testing Order Creation...');
    
    try {
      const response = await axios.post(`${this.baseURL}/orders`, {
        shippingAddress: {
          firstName: 'Order',
          lastName: 'Test',
          address1: '123 Test Street',
          city: 'Algiers',
          postalCode: '16000',
          country: 'DZ'
        },
        paymentMethod: 'cash_on_delivery',
        notes: 'Test order'
      }, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      
      console.log('✅ Order created:', {
        success: response.data.success,
        orderId: response.data.data?.order?.id,
        orderNumber: response.data.data?.order?.orderNumber,
        status: response.data.data?.order?.status
      });
      
      return response.data.data?.order?.id;
      
    } catch (error) {
      console.error('❌ Order creation failed:', error.response?.data || error.message);
      return null;
    }
  }

  async testOrdersList() {
    console.log('\n📋 Testing Orders List...');
    
    try {
      const response = await axios.get(`${this.baseURL}/orders`, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      
      console.log('✅ Orders list:', {
        success: response.data.success,
        count: response.data.data?.orders?.length || 0,
        total: response.data.data?.pagination?.total
      });
      
    } catch (error) {
      console.error('❌ Orders list failed:', error.response?.data || error.message);
    }
  }

  async testOrderDetails(orderId) {
    if (!orderId) return;
    
    console.log('\n🔍 Testing Order Details...');
    
    try {
      const response = await axios.get(`${this.baseURL}/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      
      console.log('✅ Order details:', {
        success: response.data.success,
        orderId: response.data.data?.order?.id,
        status: response.data.data?.order?.status,
        total: response.data.data?.order?.totalAmount
      });
      
    } catch (error) {
      console.error('❌ Order details failed:', error.response?.data || error.message);
    }
  }

  async testOrderCancellation(orderId) {
    if (!orderId) return;
    
    console.log('\n❌ Testing Order Cancellation...');
    
    try {
      const response = await axios.put(`${this.baseURL}/orders/${orderId}/cancel`, {
        reason: 'Test cancellation'
      }, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      
      console.log('✅ Order cancelled:', {
        success: response.data.success,
        message: response.data.message
      });
      
    } catch (error) {
      console.error('❌ Order cancellation failed:', error.response?.data || error.message);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Orders System Tests...\n');
    
    try {
      await this.setupTestUser();
      const orderId = await this.testOrderCreation();
      await this.testOrdersList();
      await this.testOrderDetails(orderId);
      await this.testOrderCancellation(orderId);
      
      console.log('\n✨ Orders tests completed!');
      
    } catch (error) {
      console.error('Test suite failed:', error);
    }
  }
}

// Run tests
const tester = new OrderTester();
tester.runAllTests().catch(error => {
  console.error('Test suite failed:', error);
});
