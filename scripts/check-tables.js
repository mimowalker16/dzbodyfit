require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');

async function checkTables() {
  console.log('🔍 Checking existing tables...');
  
  const tablesToCheck = ['users', 'categories', 'brands', 'products', 'cart', 'cart_items', 'orders'];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: Does not exist or not accessible (${error.code})`);
      } else {
        console.log(`✅ ${table}: Exists and accessible`);
      }
    } catch (error) {
      console.log(`❌ ${table}: Error - ${error.message}`);
    }
  }
}

checkTables();
