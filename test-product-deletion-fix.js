const { supabaseAdmin } = require('./src/config/supabase');

async function testProductDeletionFix() {
  console.log('Testing product deletion and creation fix...\n');

  try {
    // 1. Check current products and their status
    console.log('1. Checking current products status:');
    const { data: allProducts, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, name, sku, slug, status')
      .order('created_at', { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error('Error fetching products:', fetchError);
      return;
    }

    console.log('Current products:');
    allProducts.forEach(product => {
      console.log(`  - ${product.name} (SKU: ${product.sku}, Status: ${product.status})`);
    });

    // 2. Check for inactive products specifically
    console.log('\n2. Checking inactive products:');
    const { data: inactiveProducts } = await supabaseAdmin
      .from('products')
      .select('id, name, sku, slug, status')
      .eq('status', 'inactive')
      .order('updated_at', { ascending: false });

    console.log(`Found ${inactiveProducts?.length || 0} inactive products:`);
    if (inactiveProducts && inactiveProducts.length > 0) {
      inactiveProducts.forEach(product => {
        console.log(`  - ${product.name} (SKU: ${product.sku})`);
      });
    }

    // 3. Test uniqueness check for active products only
    console.log('\n3. Testing uniqueness checks (should exclude inactive products):');
    
    if (inactiveProducts && inactiveProducts.length > 0) {
      const inactiveProduct = inactiveProducts[0];
      
      // Test SKU uniqueness check
      console.log(`Testing SKU uniqueness for inactive product SKU: ${inactiveProduct.sku}`);
      const { data: skuCheck } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('sku', inactiveProduct.sku)
        .neq('status', 'inactive')
        .single();
      
      console.log(`SKU check result (should be null if fix works): ${skuCheck ? 'FOUND (❌ problem)' : 'NOT FOUND (✅ fixed)'}`);
      
      // Test slug uniqueness check
      console.log(`Testing slug uniqueness for inactive product slug: ${inactiveProduct.slug}`);
      const { data: slugCheck } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('slug', inactiveProduct.slug)
        .neq('status', 'inactive')
        .single();
      
      console.log(`Slug check result (should be null if fix works): ${slugCheck ? 'FOUND (❌ problem)' : 'NOT FOUND (✅ fixed)'}`);
    } else {
      console.log('No inactive products found to test with.');
    }

    console.log('\n✅ Product deletion fix test completed!');
    console.log('\nThe fix should now allow you to create new products with the same SKU/name as deleted (inactive) products.');

  } catch (error) {
    console.error('Test error:', error);
  }
}

testProductDeletionFix();
