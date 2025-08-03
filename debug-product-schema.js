require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProductSchema() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('📋 Available columns in products table:');
      const columns = Object.keys(data[0]);
      columns.forEach(col => {
        const value = data[0][col];
        console.log(`  - ${col}: ${typeof value} (${value})`);
      });
    }
  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

checkProductSchema();
