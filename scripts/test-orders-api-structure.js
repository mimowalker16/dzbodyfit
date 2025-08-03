const axios = require('axios');

async function testOrdersAPI() {
  try {
    // You'll need to replace this token with an actual admin token
    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbi1iZDI4ZGFjMy0yNzE5LTRhZDktOWI5Yy0zYWNkNTgyMWJjNDYiLCJlbWFpbCI6ImFkbWluQHJpLWd5bS5wcm8iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Mzc0MjY5MzEsImV4cCI6MTczNzUxMzMzMX0.gGxBAGJPqt4ePOiKWLQ6dFUW-b_pHu9mT7WQtZKsKq4';
    
    const response = await axios.get('http://localhost:3001/api/admin/orders?page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('API Response Structure:');
    console.log('Success:', response.data.success);
    console.log('Data keys:', Object.keys(response.data.data));
    
    if (response.data.data.items && response.data.data.items.length > 0) {
      const firstOrder = response.data.data.items[0];
      console.log('\nFirst Order Structure:');
      console.log('Order keys:', Object.keys(firstOrder));
      console.log('Has items property:', 'items' in firstOrder);
      console.log('Items type:', typeof firstOrder.items);
      console.log('Items length:', firstOrder.items ? firstOrder.items.length : 'undefined');
      
      if (firstOrder.items && firstOrder.items.length > 0) {
        console.log('\nFirst Item Structure:');
        console.log('Item keys:', Object.keys(firstOrder.items[0]));
      }
    }

  } catch (error) {
    console.error('API Test Error:', error.response?.data || error.message);
  }
}

testOrdersAPI();
