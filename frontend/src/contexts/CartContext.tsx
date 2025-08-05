'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CartService, type Cart, type CartItem } from '@/lib/cart'

interface CartContextType {
  cart: Cart | null
  loading: boolean
  error: string | null
  
  // Actions
  addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<boolean>
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>
  removeItem: (itemId: string) => Promise<boolean>
  clearCart: () => Promise<boolean>
  refreshCart: () => Promise<void>
  
  // Computed values
  itemCount: number
  subtotal: number
  isEmpty: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Computed values
  const itemCount = cart?.totals.itemCount || 0
  const subtotal = cart?.totals.subtotal || 0
  const isEmpty = itemCount === 0

  // Load cart on mount
  useEffect(() => {
    refreshCart()
  }, [])

  const refreshCart = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await CartService.getCart()
      
      if (result.success && result.data) {
        setCart(result.data)
      } else {
        setError(result.error || 'Failed to load cart')
        // Set empty cart on error
        setCart({
          items: [],
          totals: {
            subtotal: 0,
            itemCount: 0,
            currency: 'DZD'
          }
        })
      }
    } catch (err) {
      console.error('Failed to refresh cart:', err)
      setError('Failed to load cart')
      setCart({
        items: [],
        totals: {
          subtotal: 0,
          itemCount: 0,
          currency: 'DZD'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string, quantity: number = 1, variantId?: string): Promise<boolean> => {
    try {
      setError(null)
      
      const result = await CartService.addItem(productId, quantity, variantId)
      
      if (result.success) {
        // Refresh cart to get updated data
        await refreshCart()
        return true
      } else {
        setError(result.error || 'Failed to add item to cart')
        return false
      }
    } catch (err) {
      console.error('Failed to add to cart:', err)
      setError('Failed to add item to cart')
      return false
    }
  }

  const updateQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      setError(null)
      
      const result = await CartService.updateItemQuantity(itemId, quantity)
      
      if (result.success) {
        // Refresh cart to get updated data
        await refreshCart()
        return true
      } else {
        setError(result.error || 'Failed to update quantity')
        return false
      }
    } catch (err) {
      console.error('Failed to update quantity:', err)
      setError('Failed to update quantity')
      return false
    }
  }

  const removeItem = async (itemId: string): Promise<boolean> => {
    try {
      setError(null)
      
      const result = await CartService.removeItem(itemId)
      
      if (result.success) {
        // Refresh cart to get updated data
        await refreshCart()
        return true
      } else {
        setError(result.error || 'Failed to remove item')
        return false
      }
    } catch (err) {
      console.error('Failed to remove item:', err)
      setError('Failed to remove item')
      return false
    }
  }

  const clearCart = async (): Promise<boolean> => {
    try {
      setError(null)
      
      const result = await CartService.clearCart()
      
      if (result.success) {
        // Set empty cart immediately
        setCart({
          items: [],
          totals: {
            subtotal: 0,
            itemCount: 0,
            currency: 'DZD'
          }
        })
        return true
      } else {
        setError(result.error || 'Failed to clear cart')
        return false
      }
    } catch (err) {
      console.error('Failed to clear cart:', err)
      setError('Failed to clear cart')
      return false
    }
  }

  const value: CartContextType = {
    cart,
    loading,
    error,
    
    // Actions
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    
    // Computed values
    itemCount,
    subtotal,
    isEmpty
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
