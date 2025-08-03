const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create placeholder brand logo files and upload them
async function createAndUploadPlaceholderLogos() {
  console.log('🎨 Creating and uploading placeholder brand logos...');
  
  const brands = [
    {
      slug: 'optimum-nutrition',
      name: 'Optimum Nutrition',
      color: '#2563eb', // Blue
      bgColor: '#eff6ff'
    },
    {
      slug: 'bsn',
      name: 'BSN',
      color: '#dc2626', // Red
      bgColor: '#fef2f2'
    },
    {
      slug: 'dymatize',
      name: 'Dymatize',
      color: '#16a34a', // Green
      bgColor: '#f0fdf4'
    },
    {
      slug: 'muscletech',
      name: 'MuscleTech',
      color: '#ea580c', // Orange
      bgColor: '#fff7ed'
    },
    {
      slug: 'gaspari',
      name: 'Gaspari',
      color: '#7c3aed', // Purple
      bgColor: '#faf5ff'
    }
  ];

  for (const brand of brands) {
    try {
      // Create SVG logo
      const svgContent = createBrandLogoSvg(brand.name, brand.color, brand.bgColor);
      
      // Save locally first
      const tempDir = path.join(__dirname, 'temp-logos');
      await fs.mkdir(tempDir, { recursive: true });
      const svgPath = path.join(tempDir, `${brand.slug}-logo.svg`);
      await fs.writeFile(svgPath, svgContent);
      
      // Read the file and upload to Supabase
      const fileBuffer = await fs.readFile(svgPath);
      const fileName = `${brand.slug}-logo.jpg`; // We'll use .jpg extension for consistency
      
      const { data, error } = await supabase.storage
        .from('brand-logos')
        .upload(fileName, fileBuffer, {
          contentType: 'image/svg+xml',
          cacheControl: '31536000' // Cache for 1 year
        });

      if (error) {
        console.error(`❌ Error uploading ${brand.name}:`, error);
        continue;
      }

      console.log(`✅ Uploaded ${brand.name} logo: ${fileName}`);
      
      // Clean up temp file
      await fs.unlink(svgPath);
      
    } catch (error) {
      console.error(`❌ Error processing ${brand.name}:`, error);
    }
  }
  
  // Clean up temp directory
  try {
    await fs.rmdir(path.join(__dirname, 'temp-logos'));
  } catch (error) {
    // Directory might not be empty or might not exist
  }
  
  console.log('\n📋 Uploaded logos:');
  const { data: files, error: listError } = await supabase.storage
    .from('brand-logos')
    .list();
    
  if (listError) {
    console.error('Error listing files:', listError);
  } else {
    files.forEach(file => {
      const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/brand-logos/${file.name}`;
      console.log(`   📁 ${file.name} - ${url}`);
    });
  }
  
  console.log('\n🎯 Your brand pages will now show placeholder logos!');
  console.log('Visit: http://localhost:3004/brands/optimum-nutrition');
}

function createBrandLogoSvg(brandName, color, bgColor) {
  const initials = brandName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
    
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <!-- Background Circle -->
  <circle cx="100" cy="100" r="90" fill="${bgColor}" stroke="${color}" stroke-width="4"/>
  
  <!-- Brand Initials -->
  <text x="100" y="115" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
        text-anchor="middle" fill="${color}">
    ${initials}
  </text>
  
  <!-- Brand Name -->
  <text x="100" y="140" font-family="Arial, sans-serif" font-size="12" font-weight="normal" 
        text-anchor="middle" fill="${color}" opacity="0.8">
    ${brandName.toUpperCase()}
  </text>
  
  <!-- Decorative Elements -->
  <circle cx="100" cy="100" r="75" fill="none" stroke="${color}" stroke-width="1" opacity="0.3"/>
  <circle cx="100" cy="100" r="60" fill="none" stroke="${color}" stroke-width="1" opacity="0.2"/>
</svg>`;
}

// Run the function
createAndUploadPlaceholderLogos().catch(console.error);
