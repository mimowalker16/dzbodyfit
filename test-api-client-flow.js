const axios = require('axios');

async function testApiClientFlow() {
  try {
    console.log('🔍 Testing exact API client flow...');
    
    // Simulate what the API client does
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'logintest@example.com',
      password: 'LoginTest123'
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    console.log('✅ Full response status:', response.status);
    console.log('✅ Full response data:', JSON.stringify(response.data, null, 2));
    
    // Extract data.data like the API client does
    const extractedData = response.data.data;
    console.log('✅ Extracted data (response.data.data):', JSON.stringify(extractedData, null, 2));
    
    if (extractedData && extractedData.user && extractedData.tokens) {
      console.log('✅ Extracted data has correct structure');
      console.log('📊 User:', extractedData.user);
      console.log('🔑 Tokens:', extractedData.tokens);
      
      if (extractedData.tokens.accessToken && extractedData.tokens.refreshToken) {
        console.log('✅ Tokens have correct structure');
      } else {
        console.log('❌ Tokens missing accessToken or refreshToken');
      }
    } else {
      console.log('❌ Extracted data is missing user or tokens');
    }
    
  } catch (error) {
    console.error('❌ API client flow test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testApiClientFlow();
