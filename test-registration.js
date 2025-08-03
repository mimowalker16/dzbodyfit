const http = require('http');

// Test registration with valid data
const testData = {
  email: 'testuser@example.com',
  password: 'TestPassword123',
  firstName: 'John',
  lastName: 'Doe',
  phone: '0512345678'
};

const data = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Testing registration with data:', testData);
console.log('Making request to:', `http://localhost:3001${options.path}`);

const req = http.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('\n--- Response ---');
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    
    try {
      const parsedResponse = JSON.parse(responseData);
      console.log('Response Body:', JSON.stringify(parsedResponse, null, 2));
    } catch (e) {
      console.log('Raw Response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error.message);
});

req.write(data);
req.end();
