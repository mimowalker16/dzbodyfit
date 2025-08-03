const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupBrandLogosStorage() {
  try {
    console.log('🚀 Setting up brand logos storage...');
    
    // First, let's check if the brand-logos bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('📁 Existing buckets:', buckets.map(b => b.name));
    
    // Check if brand-logos bucket exists
    const brandLogosBucket = buckets.find(b => b.name === 'brand-logos');
    
    if (!brandLogosBucket) {
      console.log('📦 Creating brand-logos bucket...');
      const { data, error } = await supabase.storage.createBucket('brand-logos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) {
        console.error('❌ Error creating bucket:', error);
        return;
      }
      
      console.log('✅ Created brand-logos bucket successfully');
    } else {
      console.log('✅ brand-logos bucket already exists');
    }
    
    // List files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('brand-logos')
      .list();
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError);
      return;
    }
    
    console.log(`📋 Files in brand-logos bucket: ${files.length}`);
    files.forEach(file => console.log(`   - ${file.name}`));
    
    // Show the public URL format
    console.log('\n🔗 Upload your JPG brand logos and they will be accessible at:');
    console.log(`   ${process.env.SUPABASE_URL}/storage/v1/object/public/brand-logos/[filename].jpg`);
    
    console.log('\n📝 After uploading, update the database with:');
    console.log('   - optimum-nutrition-logo.jpg');
    console.log('   - bsn-logo.jpg');
    console.log('   - dymatize-logo.jpg');
    console.log('   - muscletech-logo.jpg');
    console.log('   - gaspari-logo.jpg');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

setupBrandLogosStorage();
