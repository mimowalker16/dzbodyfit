# ri.gym.pro API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Some endpoints require authentication using JWT tokens in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this structure:
```json
{
  "success": boolean,
  "data": object | array,
  "error": {
    "message": string,
    "details": array (optional)
  },
  "cached": boolean (optional)
}
```

## Health Check

### GET /api/health
Check API status and services health.

**Response:**
```json
{
  "success": true,
  "message": "ri.gym.pro API is running",
  "timestamp": "2025-06-26T18:40:32.936Z",
  "environment": "development",
  "timezone": "Africa/Algiers",
  "services": {
    "redis": false,
    "database": true
  }
}
```

## Products API

### GET /api/products
Get paginated list of products with filtering options.

**Query Parameters:**
- `page` (int, default: 1) - Page number
- `limit` (int, default: 20, max: 100) - Items per page
- `category` (UUID) - Filter by category ID
- `brand` (UUID) - Filter by brand ID
- `minPrice` (float) - Minimum price filter
- `maxPrice` (float) - Maximum price filter
- `search` (string) - Search in product names and descriptions
- `sort` (enum: name, price, created_at, featured) - Sort field
- `order` (enum: asc, desc) - Sort order
- `featured` (boolean) - Filter featured products only

**Example:**
```
GET /api/products?page=1&limit=10&sort=price&order=asc&featured=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Whey Gold Standard 2kg",
        "nameAr": "واي بروتين جولد ستاندرد 2 كيلو",
        "slug": "whey-gold-standard-2kg",
        "shortDescription": "Protéine whey isolate premium",
        "shortDescriptionAr": "بروتين واي معزول عالي الجودة",
        "sku": "ON-WGS-2KG",
        "basePrice": 18500,
        "salePrice": 16500,
        "currentPrice": 16500,
        "discountPercentage": 11,
        "stockQuantity": 25,
        "stockStatus": "in_stock",
        "featured": true,
        "brand": {
          "id": "uuid",
          "name": "Optimum Nutrition",
          "slug": "optimum-nutrition"
        },
        "category": {
          "id": "uuid",
          "name": "Protéines",
          "name_ar": "البروتين",
          "slug": "proteines"
        },
        "images": ["image-url"],
        "metaTitle": "Product meta title",
        "metaDescription": "Product meta description",
        "createdAt": "2025-06-26T17:21:40.636656+00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 6,
      "pages": 1
    }
  }
}
```

### GET /api/products/search
Advanced product search with multiple filters.

**Query Parameters:**
- `q` (string, min: 2, max: 100) - Search term
- `category` (UUID) - Filter by category
- `brand` (UUID) - Filter by brand
- `minPrice` (float) - Minimum price
- `maxPrice` (float) - Maximum price
- `inStock` (boolean) - Only in-stock products
- `featured` (boolean) - Only featured products
- `page` (int) - Page number
- `limit` (int, max: 50) - Items per page
- `sort` (enum) - Sort field
- `order` (enum) - Sort order

**Example:**
```
GET /api/products/search?q=whey&minPrice=10000&maxPrice=25000&inStock=true&limit=10
```

### GET /api/products/featured
Get featured products.

**Query Parameters:**
- `limit` (int, default: 8) - Number of products to return

### GET /api/products/new
Get recently added products.

**Query Parameters:**  
- `limit` (int, default: 8) - Number of products to return

### GET /api/products/:slug
Get single product by slug.

**Response includes additional details:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "name": "Product Name",
      "nameAr": "اسم المنتج",
      "description": "Full product description",
      "descriptionAr": "وصف المنتج الكامل",
      "ingredients": "Product ingredients",
      "ingredientsAr": "مكونات المنتج",
      "nutritionalInfo": "Nutritional information",
      "usageInstructions": "Usage instructions",
      "warnings": "Product warnings",
      "servingSize": "30g",
      "servingsPerContainer": 67,
      "weight": 2000,
      "dimensions": "Product dimensions",
      // ... other fields
    }
  }
}
```

## Admin Products API (Requires Authentication)

### POST /api/products
Create a new product (Admin/Manager only).

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Required Fields:**
- `name` (string) - Product name
- `sku` (string) - Stock keeping unit
- `category_id` (UUID) - Category ID
- `brand_id` (UUID) - Brand ID
- `base_price` (float) - Base price
- `stock_quantity` (int) - Stock quantity

**Optional Fields:**
- `name_ar` (string) - Arabic name
- `sale_price` (float) - Sale price
- `short_description` (string) - Short description
- `description` (string) - Full description
- `images` (array) - Product images
- `featured` (boolean) - Featured status
- `meta_title` (string) - SEO title
- `meta_description` (string) - SEO description
- And other product fields...

### PUT /api/products/:id
Update existing product (Admin/Manager only).

### DELETE /api/products/:id
Soft delete product (Admin only).

## Categories API

### GET /api/categories
Get all product categories.

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Protéines",
        "name_ar": "البروتين",
        "slug": "proteines",
        "description": "Category description",
        "image": "category-image-url",
        "productCount": 15,
        "isActive": true
      }
    ]
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "message": "Paramètres invalides",
    "details": [
      {
        "field": "price",
        "message": "Prix invalide"
      }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Accès non autorisé, token requis"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "message": "Accès interdit pour ce rôle"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "message": "Produit non trouvé"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "message": "Erreur serveur"
  }
}
```

## Rate Limiting
- 100 requests per 15 minutes per IP
- Stricter limits on auth endpoints (5 login attempts per 15 minutes)

## Caching
- Products lists cached for 5 minutes
- Single products cached for 10 minutes
- Search results cached for 3 minutes
- Featured/new products cached for 5 minutes

## Currency and Localization
- All prices in Algerian Dinar (DZD) centimes (1 DZD = 100 centimes)
- Bilingual support (French/Arabic)
- Timezone: Africa/Algiers
- Date format: ISO 8601

## Examples

### Get products under 20000 DZD sorted by price
```bash
curl "http://localhost:3001/api/products?maxPrice=20000&sort=price&order=asc"
```

### Search for protein products
```bash
curl "http://localhost:3001/api/products/search?q=protein&category=4a9f3b9c-491a-4a2a-9b9d-adc90f2bab24"
```

### Get featured whey products
```bash
curl "http://localhost:3001/api/products/search?q=whey&featured=true&limit=5"
```

## Testing
Use the provided test script to verify API functionality:
```bash
node scripts/test-api.js
```
