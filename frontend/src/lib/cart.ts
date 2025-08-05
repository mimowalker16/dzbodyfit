import { api, type Product } from '@/lib/api'

export interface CartItem {
  id: string
  productId: string
  variantId?: string | null
  quantity: number
  unitPrice: number
  product: {
    id: string
    name: string
    nameAr?: string
    slug: string
    sku?: string
    basePrice: number
    salePrice?: number
    currentPrice: number
    stockQuantity: number
    stockStatus: string
    weight?: number
    images: string[]
  }
  subtotal: number
  createdAt: string
}

export interface CartTotals {
  subtotal: number
  itemCount: number
  currency: string
}

export interface Cart {
  items: CartItem[]
  totals: CartTotals
}

export class CartService {
  private static sessionId: string | null = null

  // Generate or get session ID for anonymous users
  private static getSessionId(): string {
    if (typeof window === 'undefined') return ''
    
    if (!this.sessionId) {
      this.sessionId = localStorage.getItem('cart-session-id')
      if (!this.sessionId) {
        this.sessionId = 'session_' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('cart-session-id', this.sessionId)
      }
    }
    return this.sessionId
  }

  // Get headers for cart requests
  private static getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Add session ID for anonymous users
    if (typeof window !== 'undefined') {
      const sessionId = this.getSessionId()
      if (sessionId) {
        headers['x-session-id'] = sessionId
      }

      // Add auth token if available
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  // Get cart contents
  static async getCart(): Promise<{ success: boolean; data?: Cart; error?: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        headers: this.getHeaders()
      })

      const result = await response.json()
      
      if (result.success) {
        return {
          success: true,
          data: result.data.cart
        }
      } else {
        return {
          success: false,
          error: result.error?.message || 'Failed to get cart'
        }
      }
    } catch (error) {
      console.error('Cart fetch error:', error)
      return {
        success: false,
        error: 'Failed to connect to server'
      }
    }
  }

  // Add item to cart
  static async addItem(
    productId: string, 
    quantity: number = 1, 
    variantId?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/items`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          productId,
          quantity,
          variantId
        })
      })

      const result = await response.json()
      
      if (result.success) {
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error?.message || 'Failed to add item to cart'
        }
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      return {
        success: false,
        error: 'Failed to connect to server'
      }
    }
  }

  // Update item quantity
  static async updateItemQuantity(
    itemId: string, 
    quantity: number
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/items/${itemId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ quantity })
      })

      const result = await response.json()
      
      if (result.success) {
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error?.message || 'Failed to update item quantity'
        }
      }
    } catch (error) {
      console.error('Update quantity error:', error)
      return {
        success: false,
        error: 'Failed to connect to server'
      }
    }
  }

  // Remove item from cart
  static async removeItem(itemId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      })

      const result = await response.json()
      
      if (result.success) {
        return { success: true }
      } else {
        return {
          success: false,
          error: result.error?.message || 'Failed to remove item from cart'
        }
      }
    } catch (error) {
      console.error('Remove item error:', error)
      return {
        success: false,
        error: 'Failed to connect to server'
      }
    }
  }

  // Clear entire cart
  static async clearCart(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        method: 'DELETE',
        headers: this.getHeaders()
      })

      const result = await response.json()
      
      if (result.success) {
        return { success: true }
      } else {
        return {
          success: false,
          error: result.error?.message || 'Failed to clear cart'
        }
      }
    } catch (error) {
      console.error('Clear cart error:', error)
      return {
        success: false,
        error: 'Failed to connect to server'
      }
    }
  }

  // Get cart summary (lightweight version for header)
  static async getCartSummary(): Promise<{ 
    success: boolean; 
    data?: { itemCount: number; subtotal: number }; 
    error?: string 
  }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/summary`, {
        headers: this.getHeaders()
      })

      const result = await response.json()
      
      if (result.success) {
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error?.message || 'Failed to get cart summary'
        }
      }
    } catch (error) {
      console.error('Cart summary error:', error)
      return {
        success: false,
        error: 'Failed to connect to server'
      }
    }
  }
}
