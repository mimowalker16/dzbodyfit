require('dotenv').config();
const axios = require('axios');

async function debugLoginFlow() {
  const baseURL = 'http://localhost:3001/api';
  const testUser = {
    email: 'logintest@example.com',
    password: 'LoginTest123'
  };

  console.log('🔍 Starting login flow debug...\n');

  try {
    // Test 1: Check if backend is responding
    console.log('1️⃣ Testing backend health...');
    const healthCheck = await axios.get(`${baseURL}/health`);
    console.log('✅ Backend is healthy:', healthCheck.data.message);

    // Test 2: Test login endpoint
    console.log('\n2️⃣ Testing login endpoint...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, testUser, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('✅ Login successful!');
    console.log('📊 Response structure:');
    console.log('- success:', loginResponse.data.success);
    console.log('- user:', loginResponse.data.data.user ? 'present' : 'missing');
    console.log('- tokens:', loginResponse.data.data.tokens ? 'present' : 'missing');
    console.log('- user.firstName:', loginResponse.data.data.user?.firstName);
    console.log('- user.lastName:', loginResponse.data.data.user?.lastName);
    console.log('- accessToken length:', loginResponse.data.data.tokens?.accessToken?.length);

    // Test 3: Test protected endpoint with token
    console.log('\n3️⃣ Testing protected endpoint...');
    const token = loginResponse.data.data.tokens.accessToken;
    const meResponse = await axios.get(`${baseURL}/auth/me`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Protected endpoint works!');
    console.log('📊 Me endpoint response:');
    console.log('- success:', meResponse.data.success);
    console.log('- user data:', meResponse.data.data ? 'present' : 'missing');

    console.log('\n🎉 All backend tests passed! The issue is likely in the frontend.');
    console.log('💡 Check browser console for frontend errors when attempting login.');

  } catch (error) {
    console.error('\n❌ Error in login flow:', error.message);
    if (error.response) {
      console.error('📊 Error details:');
      console.error('- Status:', error.response.status);
      console.error('- Data:', error.response.data);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Backend server might not be running on port 3001');
    }
  }
}

debugLoginFlow();
