const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateBrandLogosWithSupabaseUrls() {
  try {
    console.log('🔄 Updating brand logo URLs to use Supabase storage...');
    
    const baseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/brand-logos`;
    
    const brandUpdates = [
      { slug: 'optimum-nutrition', logoUrl: `${baseUrl}/optimum-nutrition-logo.jpg` },
      { slug: 'bsn', logoUrl: `${baseUrl}/bsn-logo.jpg` },
      { slug: 'dymatize', logoUrl: `${baseUrl}/dymatize-logo.jpg` },
      { slug: 'muscletech', logoUrl: `${baseUrl}/muscletech-logo.jpg` },
      { slug: 'gaspari', logoUrl: `${baseUrl}/gaspari-logo.jpg` }
    ];

    for (const brand of brandUpdates) {
      const { data, error } = await supabase
        .from('brands')
        .update({ logo_url: brand.logoUrl })
        .eq('slug', brand.slug)
        .select();

      if (error) {
        console.error(`❌ Error updating ${brand.slug}:`, error);
      } else {
        console.log(`✅ Updated ${brand.slug}: ${brand.logoUrl}`);
      }
    }

    console.log('\n🎯 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Storage > brand-logos bucket');
    console.log('3. Upload your JPG brand logo files with these exact names:');
    console.log('   - optimum-nutrition-logo.jpg');
    console.log('   - bsn-logo.jpg');
    console.log('   - dymatize-logo.jpg');
    console.log('   - muscletech-logo.jpg');
    console.log('   - gaspari-logo.jpg');
    console.log('4. The logos will automatically appear on your brand pages!');

    // Check current brand status
    console.log('\n📊 Current brand logo status:');
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('slug, name, logo_url')
      .order('name');

    if (brandsError) {
      console.error('Error fetching brands:', brandsError);
    } else {
      brands.forEach(brand => {
        console.log(`   ${brand.name} (${brand.slug}): ${brand.logo_url || 'No logo'}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateBrandLogosWithSupabaseUrls();
