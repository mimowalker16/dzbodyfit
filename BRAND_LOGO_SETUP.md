# Brand Logo Setup Guide

## Current Database Configuration

The brands table has been updated to use real brand logo images:

- **Optimum Nutrition**: `/images/brands/optimum-nutrition-logo.jpg`
- **BSN**: `/images/brands/bsn-logo.jpg`  
- **Dymatize**: `/images/brands/dymatize-logo.jpg`
- **MuscleTech**: `/images/brands/muscletech-logo.jpg`
- **Gaspari**: `/images/brands/gaspari-logo.jpg`

## How to Add Real Brand Logos

### Step 1: Download Official Brand Logos
Download high-quality brand logos from:
- **Optimum Nutrition**: Official website or press kit
- **BSN**: Official website or distributor resources
- **Dymatize**: Official website or press kit
- **MuscleTech**: Official website or press kit
- **Gaspari**: Official website or press kit

### Step 2: Image Requirements
- **Format**: JPG, PNG, or WebP
- **Size**: Minimum 300x300px, recommended 500x500px
- **Background**: Transparent PNG preferred, or white background
- **Quality**: High resolution for crisp display

### Step 3: File Placement
Save the downloaded logo files to:
```
c:\Users\mouay\Projects\ri.gym.pro\frontend\public\images\brands\
```

With these exact filenames:
- `optimum-nutrition-logo.jpg`
- `bsn-logo.jpg`
- `dymatize-logo.jpg`
- `muscletech-logo.jpg`
- `gaspari-logo.jpg`

### Step 4: Test the Implementation
After adding the images:
1. Visit: http://localhost:3004/brands/optimum-nutrition
2. Visit: http://localhost:3004/brands/bsn
3. You should see the real brand logos as background watermarks

## Alternative: Use PNG Files
If you prefer PNG files, update the database by running:
```javascript
// Change .jpg to .png in the database
const updates = [
  { slug: 'optimum-nutrition', logoUrl: '/images/brands/optimum-nutrition-logo.png' },
  { slug: 'bsn', logoUrl: '/images/brands/bsn-logo.png' },
  // ... etc
];
```

## Current Status
- ✅ Database updated with new logo paths
- ✅ Old SVG placeholders removed
- ⏳ **Next**: Add real brand logo image files
- ⏳ **Then**: Test brand pages

## Fallback Behavior
If image files are not found, the brand pages will:
1. Try to load the specified image
2. Hide the background logo gracefully if not found
3. Still display all brand information and products normally
