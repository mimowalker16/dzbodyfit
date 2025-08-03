require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');

async function checkBrandSchema() {
  try {
    console.log('Checking brands table schema...');

    // Get all brands to see the actual structure
    const { data: brands, error } = await supabaseAdmin
      .from('brands')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error:', error);
      return;
    }

    if (brands && brands.length > 0) {
      console.log('Sample brand record structure:');
      console.log(JSON.stringify(brands[0], null, 2));
      
      console.log('\nAvailable columns:');
      Object.keys(brands[0]).forEach(key => {
        console.log(`- ${key}: ${typeof brands[0][key]}`);
      });
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

checkBrandSchema();
