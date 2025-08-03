const axios = require('axios');

async function debugOrderSchema() {
  try {
    console.log('🔍 Debugging Order Schema Issues...\n');
    
    // Step 1: Test basic connectivity
    console.log('1. Testing basic connectivity...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Server is running\n');
    
    // Step 2: Register and get user info
    console.log('2. Testing user registration and auth...');
    const email = `debug-${Date.now()}@example.com`;
    const regResponse = await axios.post('http://localhost:3001/api/auth/register', {
      email: email,
      password: 'TestPass123',
      firstName: 'Debug',
      lastName: 'User',
      phone: '0555123456'
    });
    
    console.log('User registration response:', {
      success: regResponse.data.success,
      userId: regResponse.data.data?.user?.id,
      userEmail: regResponse.data.data?.user?.email,
      hasTokens: !!regResponse.data.data?.tokens
    });
    
    const token = regResponse.data.data.tokens.accessToken;
    console.log('✅ User registered with token\n');
    
    // Step 3: Test cart functionality
    console.log('3. Testing cart...');
    await axios.post('http://localhost:3001/api/cart/items', {
      productId: '90046061-694c-4ef2-a7e7-6e0d904d8c22',
      quantity: 1
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Item added to cart\n');
    
    // Step 4: Try the simplest possible order creation
    console.log('4. Testing minimal order creation...');
    try {
      const orderResponse = await axios.post('http://localhost:3001/api/orders', {
        billingAddress: {
          firstName: 'Debug',
          lastName: 'User',
          addressLine1: '123 Test Street',
          city: 'Alger',
          stateProvince: 'Alger',
          phone: '0555123456'
        },
        paymentMethod: 'cash_on_delivery'
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Order created successfully!');
      console.log('Order details:', orderResponse.data);
      
    } catch (orderError) {
      console.log('❌ Order creation failed');
      console.log('Status:', orderError.response?.status);
      console.log('Error:', orderError.response?.data);
      
      // Let's also try to see what the server logs show
      console.log('\n5. Let\'s try a different approach - minimal fields only...');
      
      // Try with absolute minimum fields
      try {
        const minimalOrderResponse = await axios.post('http://localhost:3001/api/orders/minimal', {
          paymentMethod: 'cash_on_delivery'
        }, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Minimal order created!');
      } catch (minimalError) {
        console.log('❌ Even minimal order failed');
        console.log('This suggests a fundamental issue with the orders table schema or authentication');
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

debugOrderSchema();
