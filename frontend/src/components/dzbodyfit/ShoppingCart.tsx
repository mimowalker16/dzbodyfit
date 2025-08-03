'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { 
  ShoppingCart as ShoppingCartIcon, 
  Plus, 
  Minus, 
  Trash2, 
  X,
  Package,
  Truck,
  Shield,
  CreditCard,
  ArrowRight,
  Gift
} from 'lucide-react';
import { Product } from './ProductCard';
import Image from 'next/image';

export interface CartItem extends Product {
  quantity: number;
  addedAt: Date;
}

interface ShoppingCartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  onClearCart: () => void;
  className?: string;
}

const cartVariants = {
  hidden: { 
    opacity: 0, 
    x: '100%'
  },
  visible: { 
    opacity: 1, 
    x: 0
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.2 }
  }
};

const emptyCartVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1
  }
};

export function ShoppingCart({
  items,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onClearCart,
  className = ''
}: ShoppingCartProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number, currency: string = 'DZD') => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 5000 ? 0 : 500; // Free delivery over 5000 DZD
  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    setIsProcessing(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    onCheckout();
    setIsProcessing(false);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveItem(itemId);
    } else {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 bg-dzbodyfit-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Cart Sidebar */}
          <motion.div
            variants={cartVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`fixed top-0 right-0 h-full w-full max-w-md bg-dzbodyfit-white shadow-2xl z-50 flex flex-col ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dzbodyfit-gray-light bg-gradient-to-r from-dzbodyfit-green to-dzbodyfit-green/90">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <ShoppingCartIcon className="w-6 h-6 text-dzbodyfit-white" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-dzbodyfit-gold text-dzbodyfit-black text-xs px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                      {itemCount}
                    </Badge>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-dzbodyfit-white">Shopping Cart</h2>
                  <p className="text-sm text-dzbodyfit-white/80">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-dzbodyfit-white hover:bg-dzbodyfit-white/20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                /* Empty Cart */
                <motion.div
                  variants={emptyCartVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col items-center justify-center h-full p-8 text-center"
                >
                  <div className="w-24 h-24 bg-dzbodyfit-gray-light rounded-full flex items-center justify-center mb-6">
                    <ShoppingCartIcon className="w-12 h-12 text-dzbodyfit-gray-dark" />
                  </div>
                  <h3 className="text-xl font-bold text-dzbodyfit-black mb-2">Your cart is empty</h3>
                  <p className="text-dzbodyfit-gray-dark mb-6">Start shopping to add items to your cart</p>
                  <Button 
                    onClick={onClose}
                    className="bg-dzbodyfit-green hover:bg-dzbodyfit-green/90 text-dzbodyfit-white"
                  >
                    Continue Shopping
                  </Button>
                </motion.div>
              ) : (
                /* Cart Items List */
                <div className="p-4 space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <Card className="p-4 border border-dzbodyfit-gray-light">
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="relative w-16 h-16 flex-shrink-0">
                              <Image
                                src={item.images[0] || '/placeholder-product.jpg'}
                                alt={item.name}
                                fill
                                className="object-cover rounded-lg"
                                sizes="64px"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-dzbodyfit-black text-sm line-clamp-1">
                                    {item.name}
                                  </h4>
                                  <p className="text-xs text-dzbodyfit-gray-dark">
                                    {item.brand}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRemoveItem(item.id)}
                                  className="text-dzbodyfit-gray-dark hover:text-red-500 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Price & Quantity */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    className="w-8 h-8 p-0 rounded-full border-dzbodyfit-gray-light"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  
                                  <span className="font-semibold text-dzbodyfit-black min-w-[2rem] text-center">
                                    {item.quantity}
                                  </span>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    className="w-8 h-8 p-0 rounded-full border-dzbodyfit-gray-light"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>

                                <div className="text-right">
                                  <div className="font-bold text-dzbodyfit-black">
                                    {formatPrice(item.price * item.quantity, item.currency)}
                                  </div>
                                  {item.quantity > 1 && (
                                    <div className="text-xs text-dzbodyfit-gray-dark">
                                      {formatPrice(item.price, item.currency)} each
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Delivery Benefits */}
                  <Card className="p-4 bg-gradient-to-r from-dzbodyfit-green/10 to-dzbodyfit-gold/10 border-dzbodyfit-green/20">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Shield className="w-4 h-4 text-dzbodyfit-green mr-2" />
                        <span className="text-dzbodyfit-black">100% Authentic Products</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Truck className="w-4 h-4 text-dzbodyfit-green mr-2" />
                        <span className="text-dzbodyfit-black">
                          {deliveryFee === 0 ? 'Free Delivery' : `Delivery: ${formatPrice(deliveryFee)}`}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Package className="w-4 h-4 text-dzbodyfit-green mr-2" />
                        <span className="text-dzbodyfit-black">Secure Packaging</span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Footer with Checkout */}
            {items.length > 0 && (
              <div className="border-t border-dzbodyfit-gray-light bg-dzbodyfit-white p-6 space-y-4">
                {/* Pricing Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-dzbodyfit-gray-dark">Subtotal</span>
                    <span className="text-dzbodyfit-black">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dzbodyfit-gray-dark">Delivery</span>
                    <span className={`text-dzbodyfit-black ${deliveryFee === 0 ? 'text-dzbodyfit-green font-semibold' : ''}`}>
                      {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  <div className="border-t border-dzbodyfit-gray-light pt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-dzbodyfit-black">Total</span>
                      <span className="font-bold text-dzbodyfit-black text-lg">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Free Delivery Progress */}
                {deliveryFee > 0 && (
                  <div className="text-xs text-dzbodyfit-gray-dark">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-3 h-3" />
                      <span>Add {formatPrice(5000 - subtotal)} more for free delivery</span>
                    </div>
                    <div className="w-full bg-dzbodyfit-gray-light rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-dzbodyfit-gold h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((subtotal / 5000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-dzbodyfit-green hover:bg-dzbodyfit-green/90 text-dzbodyfit-white font-bold py-3 rounded-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dzbodyfit-white mr-2" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Checkout • {formatPrice(total)}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="flex-1 border-dzbodyfit-gray-light text-dzbodyfit-black hover:bg-dzbodyfit-gray-light"
                    >
                      Continue Shopping
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onClearCart}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
