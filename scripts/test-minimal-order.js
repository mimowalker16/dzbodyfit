const axios = require('axios');

async function testMinimalOrder() {
  try {
    console.log('Testing minimal order creation...');
    
    // Register user
    const regResponse = await axios.post('http://localhost:3001/api/auth/register', {
      email: `minimal-order-${Date.now()}@example.com`,
      password: 'TestPass123',
      firstName: 'Minimal',
      lastName: 'Order'
    });
    
    const token = regResponse.data.data.tokens.accessToken;
    console.log('✅ User registered');
    
    // Add item to cart
    await axios.post('http://localhost:3001/api/cart/items', {
      productId: '90046061-694c-4ef2-a7e7-6e0d904d8c22',
      quantity: 1
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Item added to cart');
    
    // Try to create order
    const orderResponse = await axios.post('http://localhost:3001/api/orders', {
      billingAddress: {
        firstName: 'Minimal',
        lastName: 'Order',
        addressLine1: '123 Test Street',
        city: 'Alger',
        stateProvince: 'Alger',
        phone: '+213555123456'
      },
      paymentMethod: 'cash_on_delivery'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Order created successfully!');
    console.log('Order ID:', orderResponse.data.data?.order?.id);
    
  } catch (error) {
    console.log('❌ Error details:', error.response?.data?.error);
  }
}

testMinimalOrder();
