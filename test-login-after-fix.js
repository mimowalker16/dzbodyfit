const axios = require('axios');

async function testLoginAfterFix() {
  try {
    console.log('🔧 Testing login after fixing API URL...');
    
    // Test the corrected endpoint
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'logintest@example.com',
      password: 'LoginTest123'
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response structure check:');
    console.log('   - success:', response.data.success);
    console.log('   - data.user:', !!response.data.data.user);
    console.log('   - data.tokens:', !!response.data.data.tokens);
    console.log('   - data.tokens.accessToken:', !!response.data.data.tokens.accessToken);
    console.log('   - data.tokens.refreshToken:', !!response.data.data.tokens.refreshToken);
    
    console.log('🎉 Frontend should now be able to connect to backend on correct port!');
    console.log('📋 Next steps:');
    console.log('   1. Visit http://localhost:3004/auth/login');
    console.log('   2. Enter email: logintest@example.com');
    console.log('   3. Enter password: LoginTest123');
    console.log('   4. Click Login - should work now!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginAfterFix();
