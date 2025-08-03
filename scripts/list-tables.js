require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');

async function listTables() {
  console.log('🔍 Listing current tables...');
  
  try {
    // Query to get all table names in the public schema
    const { data, error } = await supabaseAdmin
      .rpc('sql', {
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      });
    
    if (error) {
      console.error('❌ Error listing tables:', error);
      return;
    }
    
    console.log('✅ Current tables:');
    data.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to list tables:', error);
  }
}

listTables();
