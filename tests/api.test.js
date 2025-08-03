const request = require('supertest');
const app = require('../src/server');

describe('API Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.environment).toBeDefined();
  });
});

describe('Auth Endpoints', () => {
  test('POST /api/auth/register should validate input', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: '123'
      })
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error.details).toBeDefined();
  });
});

describe('Products Endpoints', () => {
  test('GET /api/products should return products list', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });
});

describe('Categories Endpoints', () => {
  test('GET /api/categories should return categories list', async () => {
    const response = await request(app)
      .get('/api/categories')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.categories).toBeDefined();
  });
});
