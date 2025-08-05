"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { RevolutionaryPageTemplate } from '../../components/dzbodyfit/RevolutionaryPageTemplate'
import { ProductCard } from '../../components/dzbodyfit/ProductCard'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { api, type Product, type Category, type Brand } from '../../lib/api'
import { 
  Search,
  Filter,
  Grid3X3,
  List,
  SlidersHorizontal,
  Package,
  Star,
  Users,
  ShoppingCart,
  Shield,
  Truck,
  Medal,
  Award,
  ChevronDown,
  X
} from 'lucide-react'

type SortOption = 'popularity' | 'price-asc' | 'price-desc' | 'name' | 'newest'
type ViewMode = 'grid' | 'list'

export default function CategoryPage() {
  const router = useRouter()
  const { category: categorySlug } = router.query
  
  // API State
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [allBrands, setAllBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productsLoading, setProductsLoading] = useState(false)
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [priceRange, setPriceRange] = useState([0, 20000])
  const [sortBy, setSortBy] = useState<SortOption>('popularity')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [inStockOnly, setInStockOnly] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const itemsPerPage = 12

  // Load category data
  useEffect(() => {
    const loadCategoryData = async () => {
      if (!categorySlug || typeof categorySlug !== 'string') return

      try {
        setLoading(true)
        setError(null)

        // Load category and brands in parallel
        const [categoryResponse, brandsResponse] = await Promise.all([
          api.categories.getBySlug(categorySlug),
          api.brands.getAll()
        ])

        if (categoryResponse.success) {
          setCategory(categoryResponse.data.category)
        } else {
          setError('Category not found')
          return
        }

        if (brandsResponse.success) {
          setAllBrands(brandsResponse.data.brands)
        }

      } catch (err) {
        console.error('Failed to load category data:', err)
        setError('Failed to load category. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadCategoryData()
  }, [categorySlug])

  // Load products based on filters
  useEffect(() => {
    const loadProducts = async () => {
      if (!category) return

      try {
        setProductsLoading(true)
        
        const filters: any = {
          page: currentPage,
          limit: itemsPerPage,
          category: category.id
        }

        // Add filters
        if (selectedBrand !== 'all') {
          filters.brand = selectedBrand
        }
        if (priceRange[0] > 0) {
          filters.minPrice = priceRange[0]
        }
        if (priceRange[1] < 20000) {
          filters.maxPrice = priceRange[1]
        }
        if (searchQuery) {
          filters.search = searchQuery
        }
        
        // Add sorting
        switch (sortBy) {
          case 'price-asc':
            filters.sort = 'price'
            filters.order = 'asc'
            break
          case 'price-desc':
            filters.sort = 'price'
            filters.order = 'desc'
            break
          case 'name':
            filters.sort = 'name'
            filters.order = 'asc'
            break
          case 'newest':
            filters.sort = 'created_at'
            filters.order = 'desc'
            break
          default:
            filters.sort = 'featured'
            filters.order = 'desc'
        }

        const response = await api.products.getAll(filters)
        
        if (response.success) {
          setProducts(response.data.items)
          setTotalProducts(response.data.pagination.total || 0)
        }

      } catch (err) {
        console.error('Failed to load products:', err)
      } finally {
        setProductsLoading(false)
      }
    }

    loadProducts()
  }, [category, currentPage, selectedBrand, priceRange, searchQuery, sortBy])

  // Transform API product to ProductCard format
  const transformProduct = (product: Product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand?.name || 'DZBodyFit',
    description: product.description || '',
    price: product.sale_price || product.price,
    originalPrice: product.sale_price ? product.price : undefined,
    rating: 4.5,
    reviewCount: Math.floor(Math.random() * 200) + 50,
    images: product.images.length > 0 ? product.images : ['/api/placeholder/300/300'],
    category: product.category?.name || 'Supplements',
    inStock: product.stock_quantity > 0,
    isInStock: product.stock_quantity > 0,
    isFeatured: product.is_featured,
    isNew: false,
    isBestSeller: product.is_featured,
    currency: 'DZD'
  })

  // Transform products for display
  const transformedProducts = useMemo(() => {
    return products.map(transformProduct)
  }, [products])

  // Get unique brands from filtered products
  const availableBrands = useMemo(() => {
    if (!allBrands.length) return []
    return allBrands.filter(brand => 
      products.some(product => product.brand?.id === brand.id)
    )
  }, [allBrands, products])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedBrand('all')
    setPriceRange([0, 20000])
    setInStockOnly(false)
    setCurrentPage(1)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-dzbodyfit-green mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la catégorie...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Catégorie non trouvée</h1>
          <p className="text-gray-600 mb-6">{error || 'Cette catégorie n\'existe pas.'}</p>
          <Button 
            onClick={() => router.push('/')}
            className="bg-dzbodyfit-green hover:bg-dzbodyfit-green/90"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(totalProducts / itemsPerPage)

  return (
    <RevolutionaryPageTemplate
      variant="category"
      seo={{
        title: `${category.name} - Suppléments DZBodyFit`,
        description: category.description || `Découvrez notre gamme de ${category.name.toLowerCase()}`,
        keywords: ['protéines', 'suppléments', 'DZBodyFit', 'musculation', 'algérie']
      }}
    >
      <div className="space-y-8">
        {/* Category Hero */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-dzbodyfit-green via-dzbodyfit-green/90 to-dzbodyfit-green/80">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative p-8 lg:p-12 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">🏋️</div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                  {category.name}
                </h1>
                <p className="text-xl opacity-90 max-w-2xl">
                  {category.description || `Découvrez notre gamme complète de ${category.name.toLowerCase()}`}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 mt-6">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">{totalProducts} Produits</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">Note Moyenne: 4.7/5</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="font-medium">+10,000 Clients Satisfaits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-gray-200 hover:border-dzbodyfit-green transition-colors">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-dzbodyfit-green/10 mb-4">
                <Shield className="h-6 w-6 text-dzbodyfit-green" />
              </div>
              <h3 className="font-semibold mb-2">Qualité Garantie</h3>
              <p className="text-sm text-gray-600">Produits certifiés et testés</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 hover:border-dzbodyfit-green transition-colors">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-dzbodyfit-green/10 mb-4">
                <Truck className="h-6 w-6 text-dzbodyfit-green" />
              </div>
              <h3 className="font-semibold mb-2">Livraison Rapide</h3>
              <p className="text-sm text-gray-600">24-48h partout en Algérie</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 hover:border-dzbodyfit-green transition-colors">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-dzbodyfit-green/10 mb-4">
                <Medal className="h-6 w-6 text-dzbodyfit-green" />
              </div>
              <h3 className="font-semibold mb-2">Meilleurs Prix</h3>
              <p className="text-sm text-gray-600">Prix compétitifs garantis</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 hover:border-dzbodyfit-green transition-colors">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-dzbodyfit-green/10 mb-4">
                <Award className="h-6 w-6 text-dzbodyfit-green" />
              </div>
              <h3 className="font-semibold mb-2">Support Expert</h3>
              <p className="text-sm text-gray-600">Conseils professionnels</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className="space-y-6">
          {/* Search and View Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher des produits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dzbodyfit-green focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtres
              </Button>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dzbodyfit-green focus:border-transparent"
              >
                <option value="popularity">Popularité</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name">Nom A-Z</option>
                <option value="newest">Nouveautés</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-dzbodyfit-green text-white' : 'bg-white text-gray-600'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-dzbodyfit-green text-white' : 'bg-white text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marque
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dzbodyfit-green focus:border-transparent"
                  >
                    <option value="all">Toutes les marques</option>
                    {availableBrands.map(brand => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (DZD)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dzbodyfit-green focus:border-transparent"
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 20000])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dzbodyfit-green focus:border-transparent"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Stock Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disponibilité
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded border-gray-300 text-dzbodyfit-green focus:ring-dzbodyfit-green"
                    />
                    <span className="text-sm">En stock uniquement</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Effacer les filtres
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Products Grid */}
        <div className="space-y-6">
          {/* Results Info */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {productsLoading ? 'Chargement...' : `${totalProducts} produits trouvés`}
            </p>
            <p className="text-sm text-gray-500">
              Page {currentPage} sur {totalPages}
            </p>
          </div>

          {/* Products */}
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-80"></div>
                </div>
              ))}
            </div>
          ) : transformedProducts.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {transformedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant={viewMode === 'list' ? 'detailed' : 'default'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos filtres ou votre recherche
              </p>
              <Button onClick={clearFilters} variant="outline">
                Effacer les filtres
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || productsLoading}
              >
                Précédent
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      disabled={productsLoading}
                      className={currentPage === page ? "bg-dzbodyfit-green" : ""}
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || productsLoading}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      </div>
    </RevolutionaryPageTemplate>
  )
}
