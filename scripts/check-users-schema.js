require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');

async function checkUsersSchema() {
  try {
    console.log('🔍 Checking users table schema...');
    
    // Get all users with basic fields
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }

    console.log('✅ Users found:', users.length);
    
    if (users.length > 0) {
      console.log('\n📋 Sample user structure:');
      console.log(JSON.stringify(users[0], null, 2));
      
      console.log('\n📋 All users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - Role: ${user.role || 'N/A'}`);
      });
    } else {
      console.log('📭 No users found in database');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

checkUsersSchema();
