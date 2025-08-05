"use client"

import React, { useState } from 'react'
import { RevolutionaryPageTemplate } from '../components/dzbodyfit/RevolutionaryPageTemplate'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useCart } from '../contexts/CartContext'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  Package,
  Truck,
  Shield,
  CreditCard,
  Gift,
  Tag,
  Calculator
} from 'lucide-react'

export default function CartPage() {
  const { 
    cart, 
    loading, 
    error, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    itemCount, 
    subtotal,
    isEmpty 
  } = useCart()
  
  const router = useRouter()
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)

  const formatPrice = (price: number, currency: string = 'DZD') => {
    return `${price.toLocaleString()} ${currency}`
  }

  const items = cart?.items || []
  const deliveryFee = subtotal > 5000 ? 0 : 500
  const couponDiscount = appliedCoupon ? (subtotal * appliedCoupon.discount / 100) : 0
  const total = subtotal + deliveryFee - couponDiscount

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId)
    } else {
      await updateQuantity(itemId, newQuantity)
    }
  }

  const handleApplyCoupon = () => {
    // Mock coupon validation
    if (couponCode.toLowerCase() === 'welcome10') {
      setAppliedCoupon({ code: couponCode, discount: 10 })
      setCouponCode('')
    } else if (couponCode.toLowerCase() === 'save20') {
      setAppliedCoupon({ code: couponCode, discount: 20 })
      setCouponCode('')
    } else {
      alert('Code promo invalide')
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
  }

  const handleCheckout = () => {
    router.push('/checkout')
  }

  const handleClearCart = async () => {
    if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      await clearCart()
    }
  }

  if (loading) {
    return (
      <RevolutionaryPageTemplate
        variant="shop"
        seo={{
          title: "Panier - DZBodyFit",
          description: "Votre panier d'achats DZBodyFit"
        }}
      >
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-dzbodyfit-green mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du panier...</p>
          </div>
        </div>
      </RevolutionaryPageTemplate>
    )
  }

  return (
    <RevolutionaryPageTemplate
      variant="shop"
      seo={{
        title: `Panier (${itemCount}) - DZBodyFit`,
        description: "Gérez votre panier d'achats et procédez au checkout"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-dzbodyfit-green" />
              Votre Panier
            </h1>
            <p className="text-gray-600 mt-1">
              {isEmpty ? 'Votre panier est vide' : `${itemCount} article(s) dans votre panier`}
            </p>
          </div>
        </div>

        {isEmpty ? (
          /* Empty Cart State */
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Découvrez notre collection de suppléments de qualité pour atteindre vos objectifs fitness.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="bg-dzbodyfit-green hover:bg-dzbodyfit-green/90 text-white px-8 py-3"
            >
              Commencer mes achats
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Articles ({itemCount})</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Vider le panier
                </Button>
              </div>

              {items.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.product.images?.[0] || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-lg"
                        sizes="96px"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            SKU: {item.product.sku || 'N/A'}
                          </p>
                          {item.product.weight && (
                            <p className="text-sm text-gray-600">
                              Poids: {item.product.weight}g
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Stock Status */}
                      <div className="mb-4">
                        {item.product.stockQuantity > 0 ? (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            En stock ({item.product.stockQuantity} disponible(s))
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Rupture de stock
                          </Badge>
                        )}
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">Quantité:</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-12 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-8 h-8 p-0"
                              disabled={item.quantity >= item.product.stockQuantity}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {formatPrice(item.unitPrice)} × {item.quantity}
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatPrice(item.subtotal)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Coupon Code */}
              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Tag className="w-5 h-5 text-dzbodyfit-green" />
                    Code Promo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <span className="font-semibold text-green-800">{appliedCoupon.code}</span>
                        <span className="text-sm text-green-600 ml-2">
                          -{appliedCoupon.discount}% appliqué
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Entrez votre code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dzbodyfit-green focus:border-transparent"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim()}
                        variant="outline"
                      >
                        Appliquer
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Codes disponibles: WELCOME10, SAVE20
                  </p>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="w-5 h-5 text-dzbodyfit-green" />
                    Résumé de la commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total ({itemCount} articles)</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Remise ({appliedCoupon.code})</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livraison</span>
                    <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                      {deliveryFee === 0 ? 'GRATUITE' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-dzbodyfit-green">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Free Delivery Progress */}
                  {deliveryFee > 0 && (
                    <div className="text-sm text-gray-600 mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-4 h-4" />
                        <span>Ajoutez {formatPrice(5000 - subtotal)} pour la livraison gratuite</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-dzbodyfit-green h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((subtotal / 5000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card className="p-6 bg-gradient-to-r from-dzbodyfit-green/10 to-dzbodyfit-gold/10 border-dzbodyfit-green/20">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Shield className="w-4 h-4 text-dzbodyfit-green mr-3" />
                    <span>Produits 100% authentiques</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Truck className="w-4 h-4 text-dzbodyfit-green mr-3" />
                    <span>Livraison rapide 24-48h</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Package className="w-4 h-4 text-dzbodyfit-green mr-3" />
                    <span>Emballage sécurisé</span>
                  </div>
                </div>
              </Card>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                className="w-full bg-dzbodyfit-green hover:bg-dzbodyfit-green/90 text-white py-4 text-lg font-bold rounded-xl transition-all duration-300 hover:scale-105"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Procéder au checkout • {formatPrice(total)}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                Continuer mes achats
              </Button>
            </div>
          </div>
        )}
      </div>
    </RevolutionaryPageTemplate>
  )
}
