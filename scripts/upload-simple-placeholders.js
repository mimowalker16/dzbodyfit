const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create simple base64 PNG placeholders and upload them
async function uploadSimplePlaceholders() {
  console.log('🎨 Creating and uploading simple brand placeholder images...');
  
  const brands = [
    { slug: 'optimum-nutrition', name: 'ON', color: '#FF6B35' },
    { slug: 'bsn', name: 'BSN', color: '#FF1744' },
    { slug: 'dymatize', name: 'DYM', color: '#00C853' },
    { slug: 'muscletech', name: 'MT', color: '#FF9800' },
    { slug: 'gaspari', name: 'GP', color: '#9C27B0' }
  ];

  for (const brand of brands) {
    try {
      // Create a simple colored square PNG with text
      const canvas = createSimpleCanvas(brand.name, brand.color);
      const buffer = canvasToPngBuffer(canvas);
      
      const fileName = `${brand.slug}-logo.jpg`;
      
      const { data, error } = await supabase.storage
        .from('brand-logos')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          cacheControl: '31536000'
        });

      if (error) {
        console.error(`❌ Error uploading ${brand.slug}:`, error);
        continue;
      }

      console.log(`✅ Uploaded ${brand.slug} placeholder logo`);
      
    } catch (error) {
      console.error(`❌ Error processing ${brand.slug}:`, error);
    }
  }
  
  // List uploaded files
  const { data: files, error: listError } = await supabase.storage
    .from('brand-logos')
    .list();
    
  if (!listError && files) {
    console.log('\n📋 Available logos in bucket:');
    files.forEach(file => {
      if (file.name !== '.emptyFolderPlaceholder') {
        const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/brand-logos/${file.name}`;
        console.log(`   📁 ${file.name}`);
      }
    });
  }
  
  console.log('\n🎯 Test your brand pages:');
  console.log('   • http://localhost:3004/brands/optimum-nutrition');
  console.log('   • http://localhost:3004/brands/bsn');
  console.log('   • http://localhost:3004/brands/dymatize');
}

// Create a simple colored square with brand initials
function createSimpleCanvas(text, color) {
  // Create a simple 200x200 colored square with text
  // This is a mock function - in real implementation you'd use node-canvas or similar
  return {
    width: 200,
    height: 200,
    text: text,
    color: color
  };
}

function canvasToPngBuffer(canvas) {
  // Create a simple PNG-like buffer
  // In production, you'd use a proper image library
  const simpleImageData = Buffer.from(`Simple placeholder for ${canvas.text}`, 'utf8');
  return simpleImageData;
}

// Since we can't easily create real PNGs without additional libraries,
// let's just create text files that can be uploaded for testing
async function uploadTextPlaceholders() {
  console.log('📝 Creating text placeholder files for testing...');
  
  const brands = [
    { slug: 'optimum-nutrition', name: 'Optimum Nutrition' },
    { slug: 'bsn', name: 'BSN' },
    { slug: 'dymatize', name: 'Dymatize' },
    { slug: 'muscletech', name: 'MuscleTech' },
    { slug: 'gaspari', name: 'Gaspari' }
  ];

  for (const brand of brands) {
    try {
      const placeholderContent = `Brand Logo Placeholder for ${brand.name}`;
      const buffer = Buffer.from(placeholderContent, 'utf8');
      
      const fileName = `${brand.slug}-logo.jpg`;
      
      const { data, error } = await supabase.storage
        .from('brand-logos')
        .upload(fileName, buffer, {
          contentType: 'text/plain',
          cacheControl: '31536000'
        });

      if (error) {
        console.error(`❌ Error uploading ${brand.slug}:`, error);
        continue;
      }

      console.log(`✅ Uploaded ${brand.slug} placeholder`);
      
    } catch (error) {
      console.error(`❌ Error processing ${brand.slug}:`, error);
    }
  }
  
  console.log('\n🎯 Files uploaded to test the system!');
  console.log('   In production, replace these with real JPG/PNG brand logos');
  console.log('   Visit: http://localhost:3004/brands/optimum-nutrition');
}

// Run the upload
uploadTextPlaceholders().catch(console.error);
