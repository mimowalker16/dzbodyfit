require('dotenv').config();

async function debugLogin() {
  try {
    console.log('🔐 Testing login endpoint...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@ri.gym.pro',
        password: 'admin123'
      })
    });

    const loginResult = await loginResponse.json();
    
    console.log('Response status:', loginResponse.status);
    console.log('Full response:', JSON.stringify(loginResult, null, 2));

    if (loginResult.token) {
      // Decode the JWT token to see what's inside
      const tokenParts = loginResult.token.split('.');
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      console.log('Token payload:', JSON.stringify(payload, null, 2));
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

debugLogin();
