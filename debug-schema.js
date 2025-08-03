require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCategorySchema() {
  try {
    // Get one record to see what columns exist
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('📋 Available columns in categories table:');
      const columns = Object.keys(data[0]);
      columns.forEach(col => {
        console.log(`  - ${col}: ${typeof data[0][col]} (${data[0][col]})`);
      });
    }
  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

checkCategorySchema();
