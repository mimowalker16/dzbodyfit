require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');

async function testUserCreation() {
  console.log('🔍 Testing user creation...');
  
  try {
    // Try to create a test user to see what fails
    const testUser = {
      email: 'test-' + Date.now() + '@example.com',
      password_hash: 'hashed_password_test',
      first_name: 'Test',
      last_name: 'User',
      phone: '0551234567',
      role: 'customer'
    };
    
    console.log('📝 Attempting to create user with data:', testUser);
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([testUser])
      .select('*');
    
    if (error) {
      console.error('❌ User creation error:', error);
      return false;
    }
    
    console.log('✅ User created successfully:', data);
    
    // Clean up test user
    if (data && data[0]) {
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', data[0].id);
      console.log('✅ Test user cleaned up');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

testUserCreation().then(success => {
  console.log(success ? '✨ User creation test completed' : '❌ User creation test failed');
  process.exit(success ? 0 : 1);
}).catch(console.error);
