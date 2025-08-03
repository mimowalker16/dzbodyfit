const axios = require('axios');

async function testProductAPI() {
  try {
    console.log('Testing product API endpoint...');
    
    const productId = 'd1c4cb3e-36c3-4b43-b7d0-434742860736';
    const url = `http://localhost:3001/api/products/id/${productId}`;
    
    console.log('Fetching:', url);
    const response = await axios.get(url);
    
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers['content-type']);
    
    const data = response.data;
    console.log('Response data:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\nProduct object keys:', Object.keys(data));
    console.log('Has name?', 'name' in data);
    console.log('Product name:', data.name);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testProductAPI();
