const https = require('https');
const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve(JSON.parse(data)),
            text: () => Promise.resolve(data)
          });
        } catch (e) {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.reject(e),
            text: () => Promise.resolve(data)
          });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testAnalyticsAPI() {
  try {
    console.log('🔍 Testing analytics API...');
    
    // First, let's try to login as admin to get a token
    const loginResponse = await makeRequest('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@ri-gym.pro',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Failed to login as admin');
      console.log('Response:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.data?.token;
    
    if (!token) {
      console.log('❌ No token received');
      return;
    }
    
    console.log('✅ Successfully logged in as admin');
    
    // Now test the analytics endpoint
    const analyticsResponse = await makeRequest('http://localhost:3001/api/admin/analytics?period=month', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!analyticsResponse.ok) {
      console.log('❌ Analytics API failed');
      console.log('Response:', await analyticsResponse.text());
      return;
    }
    
    const analyticsData = await analyticsResponse.json();
    console.log('📊 Analytics data received:');
    console.log(JSON.stringify(analyticsData, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAnalyticsAPI();
