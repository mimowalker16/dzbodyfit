import * as React from "react"
import { useState } from "react"
import { DZBodyFitHeader } from "../components/dzbodyfit/DZBodyFitHeader"
import { DZBodyFitLogo } from "../components/dzbodyfit/DZBodyFitLogo"
import { HeroBanner } from "../components/dzbodyfit/HeroBanner"
import { ProductCard, Product } from "../components/dzbodyfit/ProductCard"
import { ShoppingCart, CartItem } from "../components/dzbodyfit/ShoppingCart"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { ShoppingCart as ShoppingCartIcon, Users, Package, Target } from "lucide-react"

// Sample products data
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Premium Whey Protein Isolate",
    brand: "Optimum Nutrition",
    description: "High-quality whey protein isolate for muscle building and recovery. Perfect for post-workout nutrition.",
    price: 8500,
    originalPrice: 10000,
    rating: 4.8,
    reviewCount: 245,
    images: ["/placeholder-product.jpg"],
    category: "Protein",
    inStock: true,
    stockCount: 8,
    features: ["25g Protein per serving", "Fast absorption", "BCAA included"],
    isNew: true,
    isBestseller: true,
    shippingTime: "2-3 days",
    currency: "DZD"
  },
  {
    id: "2", 
    name: "Creatine Monohydrate",
    brand: "Dymatize",
    description: "Pure creatine monohydrate for strength and power enhancement.",
    price: 4200,
    rating: 4.6,
    reviewCount: 182,
    images: ["/placeholder-product.jpg"],
    category: "Creatine",
    inStock: true,
    features: ["5g per serving", "Improves strength", "Micronized formula"],
    shippingTime: "1-2 days",
    currency: "DZD"
  },
  {
    id: "3",
    name: "Pre-Workout Explosive",
    brand: "C4 Original",
    description: "Energy and focus pre-workout supplement with caffeine and beta-alanine.",
    price: 6800,
    originalPrice: 7500,
    rating: 4.7,
    reviewCount: 320,
    images: ["/placeholder-product.jpg"],
    category: "Pre-Workout",
    inStock: false,
    isBestseller: true,
    currency: "DZD"
  }
];

export default function DZBodyFitPreview() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1, addedAt: new Date() }]);
    }
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCartItems(cartItems.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const handleCheckout = () => {
    alert('Checkout functionality would be implemented here!');
    setIsCartOpen(false);
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dzbodyfit-white via-dzbodyfit-gray-light/30 to-dzbodyfit-white">
      {/* Revolutionary Header */}
      <DZBodyFitHeader />
      
      {/* Revolutionary Hero Banner */}
      <HeroBanner
        variant="home"
        title="Transform Your Fitness Journey"
        subtitle="Premium Supplements"
        description="Découvrez notre collection de suppléments de nutrition sportive de qualité supérieure, spécialement sélectionnés pour les athlètes algériens."
        primaryAction={{
          text: "Shop Now",
          href: "/products"
        }}
        secondaryAction={{
          text: "Learn More",
          href: "/about"
        }}
        badge="New Arrivals"
        stats={[
          { value: "10,000+", label: "Happy Customers", icon: Users },
          { value: "500+", label: "Products", icon: Package },
          { value: "99%", label: "Success Rate", icon: Target }
        ]}
      />

      {/* Featured Products Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-dzbodyfit-black mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-dzbodyfit-gray-medium max-w-2xl mx-auto">
              Discover our top-rated supplements, carefully selected for maximum results
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {sampleProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                variant={index === 0 ? "featured" : "default"}
                onAddToCart={handleAddToCart}
                onToggleWishlist={(product) => console.log('Toggle wishlist:', product.name)}
                onQuickView={(product) => console.log('Quick view:', product.name)}
                isInWishlist={false}
              />
            ))}
          </div>

          {/* Cart Demo Button */}
          <div className="text-center">
            <Button
              onClick={() => setIsCartOpen(true)}
              className="bg-dzbodyfit-gold hover:bg-dzbodyfit-gold/90 text-dzbodyfit-black font-bold px-8 py-4 rounded-xl text-lg group transition-all duration-300 hover:scale-105"
            >
              <ShoppingCartIcon className="w-5 h-5 mr-2" />
              View Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
            </Button>
          </div>
        </div>
      </section>

      {/* Logo Showcase Section */}
      <section className="py-20 px-4 bg-dzbodyfit-gray-light/30">
        <div className="container mx-auto text-center">
          <div className="mb-12 space-y-8">
            <h2 className="text-4xl font-bold text-dzbodyfit-black mb-4">
              DZBodyFit Brand Identity
            </h2>
            <DZBodyFitLogo size="xl" theme="gradient" className="mx-auto mb-8" />
            <p className="text-xl text-dzbodyfit-gray-medium max-w-2xl mx-auto">
              Votre partenaire de confiance pour les suppléments de nutrition sportive en Algérie
            </p>
          </div>

          {/* Logo Variants */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-dzbodyfit-green">Complete Logo</CardTitle>
                <CardDescription>Full version with icon and text</CardDescription>
              </CardHeader>
              <CardContent>
                <DZBodyFitLogo variant="full" size="lg" theme="dark" className="mx-auto" />
              </CardContent>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-dzbodyfit-green">Icon Only</CardTitle>
                <CardDescription>Icon version for compact spaces</CardDescription>
              </CardHeader>
              <CardContent>
                <DZBodyFitLogo variant="icon" size="lg" theme="dark" className="mx-auto" />
              </CardContent>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-dzbodyfit-green">Text Only</CardTitle>
                <CardDescription>Text version for minimal headers</CardDescription>
              </CardHeader>
              <CardContent>
                <DZBodyFitLogo variant="text" size="lg" theme="gradient" className="mx-auto" />
              </CardContent>
            </Card>
          </div>

          {/* Color Palette */}
          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-3xl text-dzbodyfit-black mb-8">DZBodyFit Color Palette</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-dzbodyfit-black rounded-xl mx-auto mb-3 shadow-lg"></div>
                  <Badge variant="outline">Primary Black</Badge>
                  <p className="text-sm text-dzbodyfit-gray-medium mt-1">#161a13</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-dzbodyfit-green rounded-xl mx-auto mb-3 shadow-lg"></div>
                  <Badge variant="outline">Primary Green</Badge>
                  <p className="text-sm text-dzbodyfit-gray-medium mt-1">#1e4427</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-dzbodyfit-gold rounded-xl mx-auto mb-3 shadow-lg"></div>
                  <Badge variant="outline">Accent Gold</Badge>
                  <p className="text-sm text-dzbodyfit-gray-medium mt-1">#ffd700</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-dzbodyfit-success rounded-xl mx-auto mb-3 shadow-lg"></div>
                  <Badge variant="outline">Success Green</Badge>
                  <p className="text-sm text-dzbodyfit-gray-medium mt-1">#34c759</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-dzbodyfit-warning rounded-xl mx-auto mb-3 shadow-lg"></div>
                  <Badge variant="outline">Warning Orange</Badge>
                  <p className="text-sm text-dzbodyfit-gray-medium mt-1">#ffb300</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-dzbodyfit-error rounded-xl mx-auto mb-3 shadow-lg"></div>
                  <Badge variant="outline">Error Red</Badge>
                  <p className="text-sm text-dzbodyfit-gray-medium mt-1">#d7263d</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Shopping Cart */}
      <ShoppingCart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        onClearCart={handleClearCart}
      />
    </div>
  )
}
