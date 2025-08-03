// Example: Production Brand Logo Management System

// 1. Admin API Endpoint
app.post('/admin/brands/:id/logo', authenticateAdmin, upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    
    // Validate file
    if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    
    // Process image (resize, optimize)
    const processedImage = await sharp(file.buffer)
      .resize(500, 500, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 90 })
      .toBuffer();
    
    // Upload to storage
    const fileName = `${Date.now()}-${brand.slug}-logo.webp`;
    const { data, error } = await supabase.storage
      .from('brand-logos')
      .upload(fileName, processedImage, {
        contentType: 'image/webp',
        cacheControl: '31536000' // 1 year
      });
    
    if (error) throw error;
    
    // Update database
    const logoUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/brand-logos/${fileName}`;
    await supabase
      .from('brands')
      .update({ 
        logo_url: logoUrl,
        updated_at: new Date()
      })
      .eq('id', id);
    
    // Log the change
    await auditLog.create({
      action: 'BRAND_LOGO_UPDATED',
      userId: req.user.id,
      brandId: id,
      oldLogoUrl: brand.logo_url,
      newLogoUrl: logoUrl
    });
    
    res.json({ success: true, logoUrl });
    
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// 2. Admin Dashboard Component (React)
const BrandLogoUpload = ({ brand, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(brand.logoUrl);
  
  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await fetch(`/admin/brands/${brand.id}/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPreview(result.logoUrl);
        onUpdate(result.logoUrl);
        toast.success('Logo updated successfully!');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="brand-logo-upload">
      <div className="current-logo">
        {preview && (
          <img src={preview} alt={`${brand.name} logo`} className="w-32 h-32 object-contain" />
        )}
      </div>
      
      <Dropzone
        onDrop={handleUpload}
        accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
        maxSize={5 * 1024 * 1024} // 5MB
      >
        {uploading ? 'Uploading...' : 'Drop logo here or click to upload'}
      </Dropzone>
      
      <div className="upload-requirements">
        <p>Requirements:</p>
        <ul>
          <li>JPG, PNG, or WebP format</li>
          <li>Maximum 5MB file size</li>
          <li>Minimum 300x300px resolution</li>
          <li>Square aspect ratio preferred</li>
        </ul>
      </div>
    </div>
  );
};

// 3. Automated Brand Asset Sync (Enterprise)
const syncBrandAssets = async () => {
  const brands = await getBrandsWithOfficialApis();
  
  for (const brand of brands) {
    try {
      // Fetch from official brand API
      const officialLogo = await fetch(brand.officialApiUrl);
      const logoBuffer = await officialLogo.buffer();
      
      // Process and upload
      const processedLogo = await processImage(logoBuffer);
      await uploadToStorage(processedLogo, brand.slug);
      
      // Update database
      await updateBrandLogo(brand.id, newLogoUrl);
      
      console.log(`✅ Updated ${brand.name} logo`);
    } catch (error) {
      console.error(`❌ Failed to update ${brand.name}:`, error);
    }
  }
};

// 4. Content Management with Approval Workflow
const BrandLogoWorkflow = {
  // Step 1: Marketing uploads logo
  async uploadForApproval(brandId, file, uploadedBy) {
    const tempUrl = await uploadToTempStorage(file);
    
    return await createApprovalRequest({
      type: 'BRAND_LOGO_UPDATE',
      brandId,
      newLogoUrl: tempUrl,
      uploadedBy,
      status: 'PENDING',
      approvalRequired: true
    });
  },
  
  // Step 2: Admin approves
  async approveLogo(requestId, approvedBy) {
    const request = await getApprovalRequest(requestId);
    
    // Move from temp to permanent storage
    const permanentUrl = await moveToPermananentStorage(request.newLogoUrl);
    
    // Update brand
    await updateBrand(request.brandId, { logo_url: permanentUrl });
    
    // Update request status
    await updateApprovalRequest(requestId, {
      status: 'APPROVED',
      approvedBy,
      approvedAt: new Date(),
      finalLogoUrl: permanentUrl
    });
    
    // Notify stakeholders
    await notifyLogoUpdate(request.brandId, permanentUrl);
  }
};

// 5. Production Monitoring & Analytics
const logoAnalytics = {
  // Track logo performance
  async trackLogoMetrics(brandId, logoUrl) {
    await analytics.track('brand_logo_view', {
      brandId,
      logoUrl,
      loadTime: performance.now(),
      userAgent: req.headers['user-agent'],
      country: getCountryFromIP(req.ip)
    });
  },
  
  // A/B testing for logos
  async getOptimalLogo(brandId, userId) {
    const experiment = await getActiveExperiment('brand_logo', brandId);
    
    if (experiment) {
      const variant = await assignUserToVariant(userId, experiment);
      return variant.logoUrl;
    }
    
    return await getDefaultLogo(brandId);
  }
};

export {
  BrandLogoUpload,
  syncBrandAssets,
  BrandLogoWorkflow,
  logoAnalytics
};
