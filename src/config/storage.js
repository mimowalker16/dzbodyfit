const { supabaseAdmin } = require('./supabase');

// Storage bucket configuration
const PRODUCT_IMAGES_BUCKET = 'product-images';

async function initializeStorage() {
  try {
    // Create bucket if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets();

    if (bucketsError) {
      throw new Error(`Error listing buckets: ${bucketsError.message}`);
    }

    const bucketExists = buckets.some(bucket => bucket.name === PRODUCT_IMAGES_BUCKET);

    if (!bucketExists) {
      const { error: createError } = await supabaseAdmin
        .storage
        .createBucket(PRODUCT_IMAGES_BUCKET, {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        });

      if (createError) {
        throw new Error(`Error creating bucket: ${createError.message}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Storage initialization error:', error);
    return false;
  }
}

async function uploadProductImage(file, productId) {
  try {
    console.log('Storage upload - received file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer
    });

    const fileName = `${productId}/${Date.now()}-${file.originalname}`;
    
    const { data, error } = await supabaseAdmin
      .storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(fileName, file.buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.mimetype
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    console.log('Supabase upload success:', data);

    const { data: publicURL } = supabaseAdmin
      .storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(fileName);

    console.log('Generated public URL:', publicURL);

    return { url: publicURL.publicUrl, error: null };
  } catch (error) {
    console.error('Image upload error:', error);
    return { url: null, error };
  }
}

async function deleteProductImage(fileName, productId) {
  try {
    const { error } = await supabaseAdmin
      .storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove([`${productId}/${fileName}`]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Image deletion error:', error);
    throw error;
  }
}

module.exports = {
  PRODUCT_IMAGES_BUCKET,
  initializeStorage,
  uploadProductImage,
  deleteProductImage
};
