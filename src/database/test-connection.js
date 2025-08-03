require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test categories
    const { data: categories, error: catError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .limit(5);
      
    if (catError) {
      console.error('❌ Categories error:', catError);
    } else {
      console.log('✅ Categories found:', categories.length);
      if (categories.length > 0) {
        console.log('📁 First category:', categories[0]);
      }
    }
    
    // Test brands
    const { data: brands, error: brandError } = await supabaseAdmin
      .from('brands')
      .select('*')
      .limit(5);
      
    if (brandError) {
      console.error('❌ Brands error:', brandError);
    } else {
      console.log('✅ Brands found:', brands.length);
      if (brands.length > 0) {
        console.log('🏷️ First brand:', brands[0]);
      }
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

testDatabase();
