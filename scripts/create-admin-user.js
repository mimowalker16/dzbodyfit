require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../src/config/supabase');

async function createAdminUser() {
  console.log('🔐 Creating admin user...');
  
  try {
    // Admin user credentials
    const adminData = {
      email: 'admin@ri.gym.pro',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+213 555 000 000',
      role: 'super_admin',
      status: 'active'
    };
    
    const plainPassword = 'admin123';
    
    // Check if admin user already exists
    console.log('🔍 Checking if admin user already exists...');
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('email', adminData.email)
      .single();
    
    if (existingUser) {
      console.log('⚠️  Admin user already exists:', existingUser);
      console.log('🔄 Updating existing admin user...');
      
      // Hash the password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const passwordHash = await bcrypt.hash(plainPassword, saltRounds);
      
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          first_name: adminData.firstName,
          last_name: adminData.lastName,
          phone: adminData.phone,
          role: adminData.role,
          status: adminData.status,
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('email', adminData.email)
        .select('*');
      
      if (updateError) {
        console.error('❌ Error updating admin user:', updateError);
        return false;
      }
      
      console.log('✅ Admin user updated successfully:', {
        id: updatedUser[0].id,
        email: updatedUser[0].email,
        role: updatedUser[0].role,
        name: `${updatedUser[0].first_name} ${updatedUser[0].last_name}`
      });
      
      return true;
    }
    
    // Hash the password
    console.log('🔒 Hashing password...');
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);
    
    // Create new admin user
    console.log('👤 Creating new admin user...');
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert([{
        email: adminData.email,
        first_name: adminData.firstName,
        last_name: adminData.lastName,
        phone: adminData.phone,
        role: adminData.role,
        status: adminData.status,
        password_hash: passwordHash,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('*');
    
    if (createError) {
      console.error('❌ Error creating admin user:', createError);
      return false;
    }
    
    console.log('✅ Admin user created successfully:', {
      id: newUser[0].id,
      email: newUser[0].email,
      role: newUser[0].role,
      name: `${newUser[0].first_name} ${newUser[0].last_name}`
    });
    
    console.log('\n🎉 Admin Login Credentials:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${plainPassword}`);
    console.log('   Role: super_admin');
    
    return true;
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    return false;
  }
}

// Test admin login after creation
async function testAdminLogin() {
  console.log('\n🧪 Testing admin login...');
  
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'admin@ri.gym.pro')
      .single();
    
    if (error || !user) {
      console.error('❌ Admin user not found:', error);
      return false;
    }
    
    // Test password verification
    const isPasswordValid = await bcrypt.compare('admin123', user.password_hash);
    
    if (!isPasswordValid) {
      console.error('❌ Password verification failed');
      return false;
    }
    
    console.log('✅ Admin login test successful');
    console.log('✅ Password verification: PASSED');
    console.log('✅ Role check:', user.role);
    
    return true;
    
  } catch (error) {
    console.error('❌ Login test failed:', error);
    return false;
  }
}

// Run the script
async function main() {
  console.log('🚀 Starting admin user creation script...\n');
  
  const createSuccess = await createAdminUser();
  
  if (createSuccess) {
    await testAdminLogin();
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(createSuccess ? '✨ Admin user setup completed successfully!' : '❌ Admin user setup failed');
  console.log('='.repeat(50));
  
  process.exit(createSuccess ? 0 : 1);
}

main();
