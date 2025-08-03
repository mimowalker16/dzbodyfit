require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');
const bcrypt = require('bcryptjs');

async function testDirectInsert() {
  try {
    const testEmail = 'direct-test-' + Date.now() + '@example.com';
    const passwordHash = await bcrypt.hash('TestPass123', 12);
    
    console.log('Testing direct user insert...');
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([{
        email: testEmail,
        password_hash: passwordHash,
        first_name: 'Test',
        last_name: 'User',
        phone: '+213555123456',
        role: 'customer',
        status: 'active'
      }])
      .select('id, email, first_name, last_name, phone, role, status, created_at')
      .single();

    if (error) {
      console.error('Direct insert error:', error);
    } else {
      console.log('Direct insert successful:', user);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDirectInsert();
