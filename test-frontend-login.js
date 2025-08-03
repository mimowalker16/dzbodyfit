const axios = require('axios');

async function testFrontendLogin() {
  try {
    console.log('🔍 Testing frontend login flow...');
    
    // Test the exact endpoint the frontend uses
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'logintest@example.com',
      password: 'LoginTest123'
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', response.data);
    
    if (response.data.success && response.data.data.user && response.data.data.token) {
      console.log('✅ Login response format is correct');
      console.log('📊 User data:', response.data.data.user);
      console.log('🔑 Token received:', response.data.data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Login response format is incorrect');
    }
    
  } catch (error) {
    console.error('❌ Frontend login test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
  }
}

testFrontendLogin();
