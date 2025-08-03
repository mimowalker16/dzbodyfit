const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function updateBrandLogos() {
  try {
    console.log('Updating brand logos in database via API...');

    // Define the brand logo mappings
    const brandLogoUpdates = [
      {
        slug: 'optimum-nutrition',
        logoUrl: '/images/brands/optimum-nutrition-logo.svg'
      },
      {
        slug: 'bsn', 
        logoUrl: '/images/brands/bsn-logo.svg'
      },
      {
        slug: 'dymatize',
        logoUrl: '/images/brands/dymatize-logo.svg'
      },
      {
        slug: 'muscletech',
        logoUrl: '/images/brands/muscletech-logo.svg'
      },
      {
        slug: 'gaspari',
        logoUrl: '/images/brands/gaspari-logo.svg'
      }
    ];

    // First, let's see what brands we currently have
    console.log('Fetching current brands...');
    const brandsResponse = await axios.get(`${API_BASE_URL}/brands`);
    
    if (!brandsResponse.data.success) {
      console.error('Error fetching brands:', brandsResponse.data);
      return;
    }

    const currentBrands = brandsResponse.data.data.brands;
    console.log('Current brands in database:');
    currentBrands.forEach(brand => {
      console.log(`- ID: ${brand.id}, Name: ${brand.name}, Slug: ${brand.slug}, Current Logo: ${brand.logoUrl || 'null'}`);
    });

    console.log('\nLogo mappings to apply:');
    brandLogoUpdates.forEach(update => {
      const brand = currentBrands.find(b => b.slug === update.slug);
      if (brand) {
        console.log(`✅ ${brand.name} (${update.slug}) → ${update.logoUrl}`);
      } else {
        console.log(`⚠️  Brand '${update.slug}' not found in database`);
      }
    });

    console.log('\n📝 To actually update the database, you can use SQL commands:');
    brandLogoUpdates.forEach(update => {
      const brand = currentBrands.find(b => b.slug === update.slug);
      if (brand) {
        console.log(`UPDATE brands SET "logoUrl" = '${update.logoUrl}' WHERE slug = '${update.slug}';`);
      }
    });

    console.log('\n✅ Brand logo mapping script completed!');

  } catch (error) {
    console.error('Script error:', error.response?.data || error.message);
  }
}

updateBrandLogos();
}

updateBrandLogos();
