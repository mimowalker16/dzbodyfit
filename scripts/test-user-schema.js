require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');

async function testUserSchema() {
  console.log('Testing user schema...');
  
  try {
    // First, let's see what fields are available in the users table
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying users table:', error);
      return;
    }
    
    console.log('Users table structure (from existing data):');
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]));
    } else {
      console.log('No users found, testing with minimal insert...');

      // Try inserting a minimal user record
      const testUser = {
        email: 'test-schema-' + Date.now() + '@example.com',
        password_hash: 'test-hash',
        first_name: 'Test',
        last_name: 'User',
        role: 'customer'
      };
      
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('users')
        .insert([testUser])
        .select()
        .single();
      
      if (insertError) {
        console.error('Insert error:', insertError);
      } else {
        console.log('Successful insert:', insertData);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUserSchema();
