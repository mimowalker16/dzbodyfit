const axios = require('axios');

async function testOrderEndpoints() {
  try {
    console.log('🧪 Testing Order Endpoints...\n');
    
    const baseURL = 'http://localhost:3001/api';
    
    // 1. Register user
    console.log('1. Registering user...');
    const regResponse = await axios.post(`${baseURL}/auth/register`, {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPass123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    const token = regResponse.data.data.tokens.accessToken;
    console.log('✅ User registered');
    
    // 2. Add item to cart
    console.log('2. Adding item to cart...');
    await axios.post(`${baseURL}/cart/items`, {
      productId: '90046061-694c-4ef2-a7e7-6e0d904d8c22',
      quantity: 1
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Item added to cart');
    
    // 3. Test main orders endpoint
    console.log('3. Testing main orders endpoint...');
    try {
      const orderResponse = await axios.post(`${baseURL}/orders`, {
        billingAddress: {
          firstName: 'Test',
          lastName: 'User',
          addressLine1: '123 Test Street',
          city: 'Alger',
          stateProvince: 'Alger',
          phone: '0555123456'
        },
        paymentMethod: 'cash_on_delivery'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Main orders endpoint works!');
      console.log('   Order ID:', orderResponse.data.data.order.id);
    } catch (error) {
      console.log('❌ Main orders endpoint failed:', error.response?.data?.error);
    }
    
    // 4. Test minimal orders endpoint
    console.log('4. Testing minimal orders endpoint...');
    try {
      const minimalResponse = await axios.post(`${baseURL}/orders/minimal`, {
        paymentMethod: 'cash_on_delivery'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Minimal orders endpoint works!');
      console.log('   Order ID:', minimalResponse.data.data.order.id);
    } catch (error) {
      console.log('❌ Minimal orders endpoint failed:', error.response?.data?.error);
    }
    
    // 5. Test orders list
    console.log('5. Testing orders list...');
    const listResponse = await axios.get(`${baseURL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Orders list works!');
    console.log('   Orders count:', listResponse.data.data.orders.length);
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testOrderEndpoints();
