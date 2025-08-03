require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');

async function debugAuth() {
  console.log('🔍 Debugging authentication and admin access...\n');
  
  try {
    // Check admin user in database
    console.log('1. Checking admin user in database:');
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'admin@ri.gym.pro')
      .single();
    
    if (adminError || !adminUser) {
      console.log('❌ Admin user not found in database');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Status: ${adminUser.status}`);
    console.log(`   Name: ${adminUser.first_name} ${adminUser.last_name}`);
    
    // Check all users with admin roles
    console.log('\n2. All admin users in database:');
    const { data: allAdmins, error: allAdminsError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, status')
      .in('role', ['admin', 'super_admin']);
    
    if (allAdminsError) {
      console.log('❌ Error fetching admin users:', allAdminsError);
    } else {
      console.log(`✅ Found ${allAdmins.length} admin user(s):`);
      allAdmins.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.role}) - ${user.status}`);
      });
    }
    
    // Instructions for logging out and logging back in
    console.log('\n3. TROUBLESHOOTING STEPS:');
    console.log('=====================================');
    console.log('');
    console.log('If you\'re seeing a client account instead of admin:');
    console.log('');
    console.log('Step 1: Clear your browser data');
    console.log('   - Open browser dev tools (F12)');
    console.log('   - Go to Application tab');
    console.log('   - Clear Local Storage for localhost:3000');
    console.log('   - Clear Cookies for localhost:3000');
    console.log('   - Or use incognito/private mode');
    console.log('');
    console.log('Step 2: Navigate to login page');
    console.log('   - Go to: http://localhost:3000/auth/login');
    console.log('');
    console.log('Step 3: Login with admin credentials');
    console.log(`   - Email: admin@ri.gym.pro`);
    console.log(`   - Password: admin123`);
    console.log('');
    console.log('Step 4: Access admin panel');
    console.log('   - Go to: http://localhost:3000/admin');
    console.log('   - You should see the admin dashboard');
    console.log('');
    console.log('Alternative: Direct admin login URL');
    console.log('   - http://localhost:3000/auth/login?redirect=/admin');
    
  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
}

debugAuth();
