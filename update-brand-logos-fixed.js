const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function updateBrandLogos() {
  try {
    console.log('Checking brand logos via API...');

    const brandLogoUpdates = [
      { slug: 'optimum-nutrition', logoUrl: '/images/brands/optimum-nutrition-logo.svg' },
      { slug: 'bsn', logoUrl: '/images/brands/bsn-logo.svg' },
      { slug: 'dymatize', logoUrl: '/images/brands/dymatize-logo.svg' },
      { slug: 'muscletech', logoUrl: '/images/brands/muscletech-logo.svg' },
      { slug: 'gaspari', logoUrl: '/images/brands/gaspari-logo.svg' }
    ];

    console.log('Fetching current brands...');
    const brandsResponse = await axios.get(`${API_BASE_URL}/brands`);
    
    if (!brandsResponse.data.success) {
      console.error('Error fetching brands:', brandsResponse.data);
      return;
    }

    const currentBrands = brandsResponse.data.data.brands;
    console.log('Current brands in database:');
    currentBrands.forEach(brand => {
      console.log(`- ${brand.name} (${brand.slug}): ${brand.logoUrl || 'No logo'}`);
    });

    console.log('\nSQL commands to update logos:');
    brandLogoUpdates.forEach(update => {
      const brand = currentBrands.find(b => b.slug === update.slug);
      if (brand) {
        console.log(`UPDATE brands SET "logoUrl" = '${update.logoUrl}' WHERE slug = '${update.slug}';`);
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateBrandLogos();
