const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.memoryStorage();

// Helper function to get MIME type from file extension
const getMimeTypeFromExt = (filename) => {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return null;
  }
};

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  // First check if the MIME type is already correct
  if (file.mimetype && allowedTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  
  // Try to determine MIME type from extension if MIME type is wrong/missing
  const detectedType = getMimeTypeFromExt(file.originalname);
  if (detectedType && allowedTypes.includes(detectedType)) {
    // Override the MIME type
    file.mimetype = detectedType;
    cb(null, true);
    return;
  }
  
  cb(new Error(`File type "${file.mimetype || 'unknown'}" is not allowed. Only JPEG, PNG and WebP images are accepted.`), false);
};

// Configure multer middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files per upload
  }
});

// Handle uploaded files and prepare them for storage
const processUploadedFiles = (files) => {
  if (!files || files.length === 0) return [];
  
  return files.map(file => ({
    buffer: file.buffer,
    name: `${Date.now()}-${path.basename(file.originalname)}`,
    type: file.mimetype
  }));
};

module.exports = {
  upload,
  processUploadedFiles
};
