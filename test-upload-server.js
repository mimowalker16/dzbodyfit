const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

// Basic multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log('File details:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype
    });
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      console.log('Rejected file:', file.mimetype);
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
      return;
    }
    cb(null, true);
  }
});

// Test endpoint
app.post('/upload', upload.single('testImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  console.log('Received file:', {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
  
  res.json({ 
    success: true, 
    file: {
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size
    }
  });
});

const port = 3002;
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
  console.log(`Test with: curl -F "testImage=@test.jpg" http://localhost:${port}/upload`);
});
