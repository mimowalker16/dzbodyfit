// Simple test to check if the backend is working
const axios = require('axios');

async function testRegistration() {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/register', {
      email: 'testuser123@example.com',
      password: 'TestPassword123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '0512345678'
    });
    
    console.log('✅ Registration successful!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testRegistration();
