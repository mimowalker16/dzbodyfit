const https = require('https');
const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testAdminAuth() {
  try {
    // Step 1: Login as admin
    console.log('🔐 Logging in as admin...');
    const loginOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginResult = await makeRequest(loginOptions, JSON.stringify({
      email: 'admin@ri.gym.pro',
      password: 'admin123'
    }));

    console.log('Login response:', loginResult);

    if (!loginResult.data.data || !loginResult.data.data.tokens || !loginResult.data.data.tokens.accessToken) {
      console.error('❌ Login failed - no token received');
      console.log('Full login response:', JSON.stringify(loginResult, null, 2));
      return;
    }

    const token = loginResult.data.data.tokens.accessToken;
    const user = loginResult.data.data.user;
    console.log('✅ Login successful, token received');
    console.log('User:', user);

    // Step 2: Test auth/me endpoint
    console.log('\n👤 Testing auth/me endpoint...');
    const meOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const meResult = await makeRequest(meOptions);
    console.log('Auth/me response:', meResult);

    // Step 3: Test the image upload endpoint (without file, just to see auth error)
    console.log('\n📁 Testing image upload endpoint authorization...');
    const uploadOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/products/0cdc9e0f-e83a-4d97-a5b1-98ecaddca004/image-test',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const uploadResult = await makeRequest(uploadOptions, JSON.stringify({ test: 'data' }));
    console.log('Upload test response:', uploadResult);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminAuth();
