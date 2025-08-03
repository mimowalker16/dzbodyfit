# ri.gym.pro Backend API

Backend API for ri.gym.pro - Algerian supplement e-commerce platform built with Node.js, Express, Supabase, and Redis.

## 🚀 Features

- **User Authentication**: JWT-based auth with refresh tokens
- **Product Catalog**: Complete product management with categories, brands, and localization
- **Advanced Search**: Full-text search with filtering, sorting, and pagination
- **Shopping Cart**: Persistent cart with session support
- **Order Management**: Full order lifecycle from creation to delivery
- **User Profiles**: User management with addresses and preferences
- **Admin Panel**: CRUD operations for products, categories, and orders
- **Caching**: Redis-based caching for optimal performance
- **Algerian Market**: Localized for Algeria (DZD currency, French/Arabic bilingual support)
- **API Health Monitoring**: Built-in health checks and monitoring endpoints

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis
- **Authentication**: JWT
- **Validation**: express-validator
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI

## 📦 Installation

### Prerequisites

- Node.js 18 or higher
- Redis server
- Supabase account and project

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ri.gym.pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   NODE_ENV=development
   PORT=3000
   
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Redis Configuration
   REDIS_URL=redis://localhost:6379
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the SQL schema from `src/database/schema.sql` in your Supabase SQL editor
   - Configure Row Level Security policies

5. **Start Redis**
   ```bash
   # On Windows with Redis installed
   redis-server
   
   # Or using Docker
   docker run -d -p 6379:6379 redis:7-alpine
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Docker Development

1. **Using Docker Compose**
   ```bash
   docker-compose up -d
   ```

This will start Redis and the API server in containers.

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Product Endpoints
- `GET /products` - Get all products (with filtering, pagination)
- `GET /products/search` - Full-text search with multiple filters
- `GET /products/featured` - Get featured products
- `GET /products/new` - Get new products
- `GET /products/:slug` - Get single product by slug
- `POST /products` - Create product (Admin)
- `PUT /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Admin)

### Category Endpoints
- `GET /categories` - Get all categories
- `GET /categories/hierarchy` - Get category hierarchy
- `GET /categories/:slug` - Get single category

### Cart Endpoints
- `GET /cart` - Get cart contents
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/:id` - Update cart item
- `DELETE /cart/items/:id` - Remove cart item
- `DELETE /cart` - Clear cart
- `GET /cart/summary` - Get cart summary

### Order Endpoints
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get single order
- `POST /orders` - Create new order
- `PUT /orders/:id/cancel` - Cancel order

### User Endpoints
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `PUT /users/password` - Change password
- `GET /users/addresses` - Get user addresses
- `POST /users/addresses` - Add new address
- `PUT /users/addresses/:id` - Update address
- `DELETE /users/addresses/:id` - Delete address

### Admin Endpoints (Protected)
- `GET /admin/dashboard` - Admin dashboard stats
- `GET /admin/orders` - Manage orders
- `GET /admin/users` - Manage users
- `GET /admin/products` - Manage products

## 🌟 API Highlights

### Products API
- **GET /api/products** - List products with advanced filtering and pagination
- **GET /api/products/search** - Full-text search with multiple filters
- **GET /api/products/featured** - Featured products
- **GET /api/products/new** - Recently added products
- **GET /api/products/:slug** - Single product details
- **POST /api/products** - Create product (Admin)
- **PUT /api/products/:id** - Update product (Admin)
- **DELETE /api/products/:id** - Delete product (Admin)

### Advanced Filtering
- Price range filtering (`minPrice`, `maxPrice`)
- Category and brand filtering
- Stock status filtering
- Featured products filtering
- Full-text search in name, description (French/Arabic)
- Multiple sorting options (name, price, date, featured)

### Performance Features
- Redis caching with configurable TTL
- Fallback to in-memory cache when Redis unavailable
- Efficient database queries with joins
- Pagination support
- Response compression

## 🗄 Database Schema

The database includes the following main entities:

- **Users**: Customer accounts and authentication
- **Products**: Product catalog with variations and media
- **Categories**: Hierarchical product categories
- **Cart**: Shopping cart and cart items
- **Orders**: Order management and tracking
- **Addresses**: User shipping/billing addresses
- **Reviews**: Product reviews and ratings
- **Coupons**: Discount codes and promotions

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `SUPABASE_URL` | Supabase project URL | - |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | - |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | `12` |
| `DEFAULT_CURRENCY` | Default currency | `DZD` |
| `DEFAULT_TIMEZONE` | Default timezone | `Africa/Algiers` |

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   # Set production URLs and secrets
   ```

2. **Database Migration**
   - Run production migrations in Supabase
   - Configure production RLS policies

3. **Build and Start**
   ```bash
   npm start
   ```

### Docker Production

```bash
docker build -t ri-gym-pro-api .
docker run -p 3000:3000 --env-file .env ri-gym-pro-api
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Format code
npm run format
```

## 📊 Monitoring

The API includes:

- **Health Check**: `GET /health`
- **Logging**: Winston-based structured logging
- **Error Handling**: Centralized error handling middleware
- **Rate Limiting**: Request rate limiting
- **Security**: Helmet.js security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🔗 Related Projects

- **Frontend**: ri.gym.pro Frontend (React/Next.js)
- **Admin Panel**: ri.gym.pro Admin Dashboard
- **Mobile App**: ri.gym.pro Mobile App (React Native)

## 📞 Support

For support and questions:
- Email: support@ri.gym.pro
- Phone: +213 XXX XXX XXX
- Website: https://ri.gym.pro

---

Made with ❤️ for the Algerian fitness community
# dzbodyfit
#   d z b o d y f i t  
 # dzbodyfit
