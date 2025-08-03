require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    // Get all users
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, firstName, lastName, role, status')
      .limit(10);

    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }

    console.log('✅ Users found:', users.length);
    
    if (users.length > 0) {
      console.log('\n📋 User list:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.firstName} ${user.lastName}) - Role: ${user.role}, Status: ${user.status}`);
      });
    } else {
      console.log('📭 No users found in database');
      console.log('💡 You may need to register a new user or create an admin user');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

checkUsers();
