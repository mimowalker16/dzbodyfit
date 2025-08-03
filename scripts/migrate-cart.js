require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');
const fs = require('fs');
const path = require('path');

async function runCartMigration() {
  console.log('🔄 Running cart table migration...');
  
  try {
    // Read the migration SQL
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '..', 'src', 'database', 'add-cart-table.sql'),
      'utf8'
    );
    
    // Split into individual statements (simple split by semicolon)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n⏳ Executing statement ${i + 1}/${statements.length}...`);
      console.log(`SQL: ${statement.substring(0, 100)}...`);
      
      const { data, error } = await supabaseAdmin.rpc('exec_sql', {
        sql: statement
      });
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error);
        // Continue with other statements even if one fails
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('\n🔍 Verifying cart table creation...');
    
    // Test cart table
    const { data: testData, error: testError } = await supabaseAdmin
      .from('cart')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Cart table verification failed:', testError);
      return false;
    }
    
    console.log('✅ Cart table verified successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

// Alternative approach if the first one doesn't work
async function runCartMigrationManual() {
  console.log('\n🔄 Running manual cart table creation...');
  
  try {
    // Create cart table
    const createCartSQL = `
      CREATE TABLE cart (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        session_id VARCHAR(255),
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    console.log('📝 Creating cart table...');
    const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createCartSQL
    });
    
    if (createError && !createError.message.includes('already exists')) {
      console.error('❌ Failed to create cart table:', createError);
      return false;
    }
    
    console.log('✅ Cart table created successfully');
    
    // Create indexes
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
      CREATE INDEX IF NOT EXISTS idx_cart_session_id ON cart(session_id);
      CREATE INDEX IF NOT EXISTS idx_cart_expires_at ON cart(expires_at);
    `;
    
    console.log('📝 Creating indexes...');
    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
      sql: indexSQL
    });
    
    if (indexError) {
      console.log('⚠️ Some indexes may already exist:', indexError);
    } else {
      console.log('✅ Indexes created successfully');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Manual migration failed:', error);
    return false;
  }
}

// Run migration
runCartMigration().then(async (success) => {
  if (!success) {
    console.log('\n🔄 Trying manual approach...');
    success = await runCartMigrationManual();
  }
  
  console.log(success ? '\n✨ Cart migration completed successfully!' : '\n❌ Cart migration failed');
  process.exit(success ? 0 : 1);
}).catch(console.error);
