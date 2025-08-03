require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');

async function updateBrandLogosWithRealImages() {
  try {
    console.log('Updating brand logos with real brand images...');

    // Option 1: Use local images (upload real brand logos to /public/images/brands/)
    const brandLogoUpdates = [
      {
        slug: 'optimum-nutrition',
        logoUrl: '/images/brands/optimum-nutrition-logo.jpg'
      },
      {
        slug: 'bsn',
        logoUrl: '/images/brands/bsn-logo.jpg'
      },
      {
        slug: 'dymatize',
        logoUrl: '/images/brands/dymatize-logo.jpg'
      },
      {
        slug: 'muscletech',
        logoUrl: '/images/brands/muscletech-logo.jpg'
      },
      {
        slug: 'gaspari',
        logoUrl: '/images/brands/gaspari-logo.jpg'
      }
    ];

    console.log('Updating with real brand logos...');

    for (const update of brandLogoUpdates) {
      console.log(`Updating ${update.slug}...`);
      
      const { data, error } = await supabaseAdmin
        .from('brands')
        .update({ logo_url: update.logoUrl })
        .eq('slug', update.slug)
        .select();

      if (error) {
        console.error(`Error updating ${update.slug}:`, error);
      } else {
        console.log(`✅ Updated ${update.slug}: ${update.logoUrl}`);
      }
    }

    // Verify the updates
    const { data: brands, error: fetchError } = await supabaseAdmin
      .from('brands')
      .select('*');

    if (fetchError) {
      console.error('Error fetching brands:', fetchError);
    } else {
      console.log('\nFinal brand state:');
      brands.forEach(brand => {
        console.log(`- ${brand.name} (${brand.slug}): ${brand.logo_url || 'No logo'}`);
      });
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

updateBrandLogosWithRealImages();
