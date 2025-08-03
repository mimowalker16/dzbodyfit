require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Available columns in products table:');
      console.log(Object.keys(data[0]).sort());
    } else {
      console.log('No products found in table, let me try to get the schema another way...');
      
      // Try to insert an empty object to see what columns are required
      const { error: insertError } = await supabase
        .from('products')
        .insert({})
        .select();
      
      console.log('Insert error details:', insertError);
    }
  } catch (err) {
    console.error('Script error:', err);
  }
}

checkSchema();
