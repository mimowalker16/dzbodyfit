const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

class CartTester {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.sessionId = null;
    this.userToken = null;
    this.testUserId = null;
  }

  // Helper to generate random session ID
  generateSessionId() {
    return 'test-session-' + Math.random().toString(36).substr(2, 9);
  }

  async testGuestCart() {
    console.log('\n🛒 Testing Guest Cart Functionality...');
    this.sessionId = this.generateSessionId();
    
    // Test empty cart
    try {
      const response = await axios.get(`${this.baseURL}/cart`, {
        headers: { 'x-session-id': this.sessionId }
      });
      console.log('✅ Empty guest cart:', {
        success: response.data.success,
        itemCount: response.data.data.cart.totals.itemCount,
        subtotal: response.data.data.cart.totals.subtotal
      });
    } catch (error) {
      console.error('❌ Empty guest cart failed:', error.response?.data || error.message);
    }

    // Add item to guest cart
    try {
      const response = await axios.post(`${this.baseURL}/cart/items`, {
        productId: '90046061-694c-4ef2-a7e7-6e0d904d8c22', // Valid product ID
        quantity: 2
      }, {
        headers: { 'x-session-id': this.sessionId }
      });
      console.log('✅ Add item to guest cart:', {
        success: response.data.success,
        message: response.data.message
      });
    } catch (error) {
      console.error('❌ Add item to guest cart failed:', error.response?.data || error.message);
    }

    // Get cart with items
    try {
      const response = await axios.get(`${this.baseURL}/cart`, {
        headers: { 'x-session-id': this.sessionId }
      });
      console.log('✅ Guest cart with items:', {
        success: response.data.success,
        itemCount: response.data.data.cart.totals.itemCount,
        subtotal: response.data.data.cart.totals.subtotal,
        items: response.data.data.cart.items.length
      });
    } catch (error) {
      console.error('❌ Guest cart with items failed:', error.response?.data || error.message);
    }
  }

  async testUserRegistrationAndLogin() {
    console.log('\n👤 Testing User Registration and Login...');
    
    const testEmail = `test-user-${Date.now()}@example.com`;
    const testPassword = 'TestPass123';
    
    // Register test user
    try {
      const response = await axios.post(`${this.baseURL}/auth/register`, {
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        phone: '+213555123456'
      });
      console.log('✅ User registration:', {
        success: response.data.success,
        userId: response.data.data.user.id,
        email: response.data.data.user.email
      });
      this.userToken = response.data.data.tokens.accessToken;
      this.testUserId = response.data.data.user.id;
    } catch (error) {
      console.error('❌ User registration failed:', error.response?.data || error.message);
    }

    // Test login
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: testEmail,
        password: testPassword
      });
      console.log('✅ User login:', {
        success: response.data.success,
        userId: response.data.data.user.id
      });
      this.userToken = response.data.data.tokens.accessToken;
    } catch (error) {
      console.error('❌ User login failed:', error.response?.data || error.message);
    }
  }

  async testUserCart() {
    if (!this.userToken) {
      console.log('⚠️ Skipping user cart tests - no user token');
      return;
    }

    console.log('\n🛒 Testing User Cart Functionality...');

    // Test empty user cart
    try {
      const response = await axios.get(`${this.baseURL}/cart`, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      console.log('✅ Empty user cart:', {
        success: response.data.success,
        itemCount: response.data.data.cart.totals.itemCount,
        subtotal: response.data.data.cart.totals.subtotal
      });
    } catch (error) {
      console.error('❌ Empty user cart failed:', error.response?.data || error.message);
    }

    // Add item to user cart
    try {
      const response = await axios.post(`${this.baseURL}/cart/items`, {
        productId: '90046061-694c-4ef2-a7e7-6e0d904d8c22',
        quantity: 3
      }, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      console.log('✅ Add item to user cart:', {
        success: response.data.success,
        message: response.data.message
      });
    } catch (error) {
      console.error('❌ Add item to user cart failed:', error.response?.data || error.message);
    }

    // Get user cart with items
    try {
      const response = await axios.get(`${this.baseURL}/cart`, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      console.log('✅ User cart with items:', {
        success: response.data.success,
        itemCount: response.data.data.cart.totals.itemCount,
        subtotal: response.data.data.cart.totals.subtotal,
        items: response.data.data.cart.items.length
      });
    } catch (error) {
      console.error('❌ User cart with items failed:', error.response?.data || error.message);
    }
  }

  async testCartItemManagement() {
    if (!this.userToken) {
      console.log('⚠️ Skipping cart item management tests - no user token');
      return;
    }

    console.log('\n🔧 Testing Cart Item Management...');

    // Get current cart to find an item ID
    let itemId = null;
    try {
      const response = await axios.get(`${this.baseURL}/cart`, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      if (response.data.data.cart.items.length > 0) {
        itemId = response.data.data.cart.items[0].id;
      }
    } catch (error) {
      console.error('❌ Failed to get cart for item management:', error.response?.data || error.message);
    }

    if (itemId) {
      // Update item quantity
      try {
        const response = await axios.put(`${this.baseURL}/cart/items/${itemId}`, {
          quantity: 5
        }, {
          headers: { 'Authorization': `Bearer ${this.userToken}` }
        });
        console.log('✅ Update cart item quantity:', {
          success: response.data.success,
          message: response.data.message
        });
      } catch (error) {
        console.error('❌ Update cart item failed:', error.response?.data || error.message);
      }

      // Remove item
      try {
        const response = await axios.delete(`${this.baseURL}/cart/items/${itemId}`, {
          headers: { 'Authorization': `Bearer ${this.userToken}` }
        });
        console.log('✅ Remove cart item:', {
          success: response.data.success,
          message: response.data.message
        });
      } catch (error) {
        console.error('❌ Remove cart item failed:', error.response?.data || error.message);
      }
    }
  }

  async testUserProfile() {
    if (!this.userToken) {
      console.log('⚠️ Skipping user profile tests - no user token');
      return;
    }

    console.log('\n👤 Testing User Profile Management...');

    // Get user profile
    try {
      const response = await axios.get(`${this.baseURL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      console.log('✅ Get user profile:', {
        success: response.data.success,
        email: response.data.data.user.email,
        firstName: response.data.data.user.firstName
      });
    } catch (error) {
      console.error('❌ Get user profile failed:', error.response?.data || error.message);
    }

    // Update user profile
    try {
      const response = await axios.put(`${this.baseURL}/users/profile`, {
        firstName: 'Updated',
        lastName: 'User',
        phone: '+213555654321'
      }, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      console.log('✅ Update user profile:', {
        success: response.data.success,
        message: response.data.message
      });
    } catch (error) {
      console.error('❌ Update user profile failed:', error.response?.data || error.message);
    }
  }

  async testErrorHandling() {
    console.log('\n⚠️ Testing Error Handling...');

    // Test adding invalid product
    try {
      const response = await axios.post(`${this.baseURL}/cart/items`, {
        productId: 'invalid-product-id',
        quantity: 1
      }, {
        headers: { 'x-session-id': 'test-session' }
      });
      console.log('⚠️ Invalid product should have failed');
    } catch (error) {
      console.log('✅ Invalid product ID properly rejected:', {
        status: error.response?.status,
        message: error.response?.data?.error?.message
      });
    }

    // Test adding zero/negative quantity
    try {
      const response = await axios.post(`${this.baseURL}/cart/items`, {
        productId: '90046061-694c-4ef2-a7e7-6e0d904d8c22',
        quantity: 0
      }, {
        headers: { 'x-session-id': 'test-session' }
      });
      console.log('⚠️ Zero quantity should have failed');
    } catch (error) {
      console.log('✅ Zero quantity properly rejected:', {
        status: error.response?.status,
        message: error.response?.data?.error?.message
      });
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Cart & User Tests...\n');
    
    await this.testGuestCart();
    await this.testUserRegistrationAndLogin();
    await this.testUserCart();
    await this.testCartItemManagement();
    await this.testUserProfile();
    await this.testErrorHandling();
    
    console.log('\n✨ Comprehensive tests completed!');
  }
}

// Run tests
const tester = new CartTester();
tester.runAllTests().catch(error => {
  console.error('Test suite failed:', error);
});
