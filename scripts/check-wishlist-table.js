require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');

async function checkWishlistTable() {
  try {
    console.log('🔍 Checking wishlist_items table...');
    
    // Try to select from wishlist_items
    const { data, error } = await supabaseAdmin
      .from('wishlist_items')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Wishlist table error:', error.message);
      
      if (error.code === '42P01') {
        console.log('📝 Need to create wishlist_items table');
        return false;
      }
    } else {
      console.log('✅ Wishlist table exists and is accessible');
      console.log('📊 Sample data count:', data.length);
      return true;
    }
  } catch (error) {
    console.error('💥 Error checking wishlist table:', error.message);
    return false;
  }
}

checkWishlistTable();
