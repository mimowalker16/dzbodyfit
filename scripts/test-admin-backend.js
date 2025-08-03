const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testAdminConnection() {
  console.log('🔄 Testing ri.gym.pro admin panel backend connection...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/test/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);
    console.log();

    // Test 2: Admin login
    console.log('2. Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@ri.gym.pro',
      password: 'admin123'
    });
    
    if (loginResponse.data.success && loginResponse.data.data.token) {
      console.log('✅ Admin login successful');
      const token = loginResponse.data.data.token;
      
      // Test 3: Admin dashboard stats
      console.log('3. Testing admin dashboard stats...');
      const statsResponse = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Admin stats retrieved:', {
        users: statsResponse.data.totalUsers,
        products: statsResponse.data.totalProducts,
        orders: statsResponse.data.totalOrders,
        revenue: statsResponse.data.totalRevenue
      });

      // Test 4: Admin orders
      console.log('4. Testing admin orders...');
      const ordersResponse = await axios.get(`${API_BASE_URL}/admin/orders?page=1&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Admin orders retrieved:', ordersResponse.data.items?.length || 0, 'orders');

      // Test 5: Admin users
      console.log('5. Testing admin users...');
      const usersResponse = await axios.get(`${API_BASE_URL}/admin/users?page=1&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Admin users retrieved:', usersResponse.data.items?.length || 0, 'users');

      console.log('\n🎉 All admin backend tests passed! The admin panel is connected to the database.');
      
    } else {
      console.log('❌ Admin login failed:', loginResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Backend server is not running. Please run: npm run dev');
    } else if (error.response?.status === 401) {
      console.log('\n💡 Admin credentials may be incorrect. Please run: node scripts/create-admin-user.js');
    }
  }
}

testAdminConnection();
