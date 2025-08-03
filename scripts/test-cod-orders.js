const axios = require('axios');

class CODOrderTester {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
    this.userToken = null;
    this.testUserId = null;
  }

  async setupTestUser() {
    console.log('🔧 Setting up test user for COD orders...');
    
    try {
      const regResponse = await axios.post(`${this.baseURL}/auth/register`, {
        email: `cod-order-${Date.now()}@example.com`,
        password: 'TestPass123',
        firstName: 'COD',
        lastName: 'Test'
      });
      
      this.userToken = regResponse.data.data.tokens.accessToken;
      this.testUserId = regResponse.data.data.user.id;
      console.log('✅ Test user created');
      
      // Add items to cart
      await axios.post(`${this.baseURL}/cart/items`, {
        productId: '90046061-694c-4ef2-a7e7-6e0d904d8c22',
        quantity: 2
      }, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      
      console.log('✅ Items added to cart');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async testOrderCreation() {
    console.log('\n📦 Testing COD Order Creation...');
    
    try {
      const response = await axios.post(`${this.baseURL}/orders`, {
        billingAddress: {
          firstName: 'Ahmed',
          lastName: 'Benali',
          addressLine1: 'Cité 1000 Logements, Bt A, App 25',
          city: 'Alger',
          stateProvince: 'Alger',
          phone: '+213555123456'
        },
        shippingAddress: {
          firstName: 'Ahmed',
          lastName: 'Benali',
          addressLine1: 'Cité 1000 Logements, Bt A, App 25',
          city: 'Alger',
          stateProvince: 'Alger',
          phone: '+213555123456'
        },
        paymentMethod: 'cash_on_delivery',
        shippingMethod: 'standard',
        notes: 'Livraison après 18h SVP'
      }, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      
      console.log('✅ COD Order created successfully:', {
        orderId: response.data.data.order.id,
        orderNumber: response.data.data.order.order_number,
        status: response.data.data.order.status,
        paymentMethod: response.data.data.order.payment_method,
        paymentStatus: response.data.data.order.payment_status,
        totalAmount: response.data.data.order.total_amount + ' DZD',
        shippingAmount: response.data.data.order.shipping_amount + ' DZD'
      });
      
      return response.data.data.order.id;
      
    } catch (error) {
      console.error('❌ COD Order creation failed:', error.response?.data || error.message);
      return null;
    }
  }

  async testOrderManagement(orderId) {
    if (!orderId) return;
    
    console.log('\n📋 Testing Order Management...');
    
    // Get order details
    try {
      const response = await axios.get(`${this.baseURL}/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      
      console.log('✅ Order details retrieved:', {
        orderId: response.data.data.order.id,
        status: response.data.data.order.status,
        itemsCount: response.data.data.order.items?.length || 0
      });
      
    } catch (error) {
      console.error('❌ Get order details failed:', error.response?.data || error.message);
    }

    // Test order cancellation
    try {
      const response = await axios.put(`${this.baseURL}/orders/${orderId}/cancel`, {
        reason: 'Test cancellation'
      }, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      
      console.log('✅ Order cancelled successfully');
      
    } catch (error) {
      console.error('❌ Order cancellation failed:', error.response?.data || error.message);
    }
  }

  async runCODTests() {
    console.log('🚀 Starting Cash-On-Delivery Order Tests...\n');
    
    try {
      await this.setupTestUser();
      const orderId = await this.testOrderCreation();
      await this.testOrderManagement(orderId);
      
      console.log('\n✨ COD Order tests completed!');
      
    } catch (error) {
      console.error('COD Test suite failed:', error);
    }
  }
}

// Run COD tests
const tester = new CODOrderTester();
tester.runCODTests().catch(error => {
  console.error('COD Test suite failed:', error);
});
