/**
 * DZBodyFit API Client
 * Handles all API communication with the backend
 */

// Types
export interface Product {
  id: string;
  name: string;
  name_ar?: string;
  slug: string;
  description?: string;
  description_ar?: string;
  price: number;
  price_dzd?: number;
  sale_price?: number;
  stock_quantity: number;
  images: string[];
  image?: string;
  category_id?: string;
  brand_id?: string;
  brand?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_ar?: string;
  slug: string;
  description?: string;
  description_ar?: string;
  image_url?: string;
  parent_id?: string;
  is_active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
  is_active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    details?: any;
  };
  cached?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Products API
  async getProducts(params: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<Product>>(endpoint);
  }

  async getFeaturedProducts(limit: number = 8) {
    return this.request<PaginatedResponse<Product>>(`/products/featured?limit=${limit}`);
  }

  async getNewProducts(limit: number = 8) {
    return this.request<PaginatedResponse<Product>>(`/products/new?limit=${limit}`);
  }

  async getProductBySlug(slug: string) {
    return this.request<{ product: Product }>(`/products/${slug}`);
  }

  async searchProducts(query: string, limit: number = 20) {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });
    return this.request<PaginatedResponse<Product>>(`/products/search?${params}`);
  }

  // Categories API
  async getCategories() {
    return this.request<{ categories: Category[] }>('/categories');
  }

  async getCategoryBySlug(slug: string) {
    return this.request<{ category: Category }>(`/categories/${slug}`);
  }

  async getCategoryHierarchy() {
    return this.request<{ categories: Category[] }>('/categories/hierarchy');
  }

  // Brands API
  async getBrands() {
    return this.request<{ brands: Brand[] }>('/brands');
  }

  async getBrandBySlug(slug: string) {
    return this.request<{ brand: Brand }>(`/brands/${slug}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Utility functions for common operations
export const api = {
  // Products
  products: {
    getAll: (params?: Parameters<typeof apiClient.getProducts>[0]) => 
      apiClient.getProducts(params),
    getFeatured: (limit?: number) => 
      apiClient.getFeaturedProducts(limit),
    getNew: (limit?: number) => 
      apiClient.getNewProducts(limit),
    getBySlug: (slug: string) => 
      apiClient.getProductBySlug(slug),
    search: (query: string, limit?: number) => 
      apiClient.searchProducts(query, limit),
  },
  
  // Categories
  categories: {
    getAll: () => apiClient.getCategories(),
    getBySlug: (slug: string) => apiClient.getCategoryBySlug(slug),
    getHierarchy: () => apiClient.getCategoryHierarchy(),
  },
  
  // Brands
  brands: {
    getAll: () => apiClient.getBrands(),
    getBySlug: (slug: string) => apiClient.getBrandBySlug(slug),
  },
  
  // Health
  health: () => apiClient.healthCheck(),
};

export default apiClient;
