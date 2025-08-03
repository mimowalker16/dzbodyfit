require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');

async function showAdminCredentials() {
  console.log('🔍 Retrieving admin user information...\n');
  
  try {
    // Get admin users from database
    const { data: adminUsers, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, status, created_at')
      .in('role', ['admin', 'super_admin'])
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching admin users:', error);
      return;
    }
    
    if (!adminUsers || adminUsers.length === 0) {
      console.log('⚠️  No admin users found in the database.');
      return;
    }
    
    console.log('👥 Active Admin Users:');
    console.log('=' .repeat(60));
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Role: ${user.role}`);
      console.log(`   🟢 Status: ${user.status}`);
      console.log(`   📅 Created: ${new Date(user.created_at).toLocaleDateString()}`);
      
      // Show credentials for the main admin
      if (user.email === 'admin@ri.gym.pro') {
        console.log(`   🔐 Password: admin123`);
      }
      
      console.log('');
    });
    
    console.log('🌐 Admin Panel Access:');
    console.log('   URL: http://localhost:3000/admin');
    console.log('   Main Admin Login:');
    console.log('     📧 Email: admin@ri.gym.pro');
    console.log('     🔑 Password: admin123');
    console.log('');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
showAdminCredentials();
