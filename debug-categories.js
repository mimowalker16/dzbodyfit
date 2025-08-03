require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name');

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('📋 Categories in database:');
    data.forEach(cat => {
      console.log(`  - ID: ${cat.id}`);
      console.log(`    Name: ${cat.name}`);
      console.log(`    Slug: ${cat.slug || 'NULL'}`);
      console.log('');
    });

    console.log(`\n✅ Total categories: ${data.length}`);
  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

checkCategories();
