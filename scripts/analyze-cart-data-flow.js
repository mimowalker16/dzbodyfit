/**
 * Comprehensive Cart Data Analysis
 * This script will help identify the exact source of name/price mismatches
 */

console.log('🔍 COMPREHENSIVE CART DATA ANALYSIS');
console.log('====================================');

// Let's check if we can simulate the issue by checking the transformation logic

// Mock data to simulate what might be happening
const mockBackendCartItem = {
  id: "cart-item-123",
  productId: "ff8548b8-8ba2-42cc-9119-e3cdd64b4ad1",
  quantity: 2,
  unitPrice: 4500,  // Price when added to cart
  subtotal: 9000,
  product: {
    id: "ff8548b8-8ba2-42cc-9119-e3cdd64b4ad1",
    name: "Créatine Monohydrate 500g",
    basePrice: 4500,
    salePrice: null,
    currentPrice: 4500
  }
};

const mockDifferentProductData = {
  id: "ff8548b8-8ba2-42cc-9119-e3cdd64b4ad1",
  name: "DIFFERENT PRODUCT NAME",  // This could happen if product was updated
  price: 5000,  // This could happen if price was updated
  basePrice: 5000,
  salePrice: null,
  currentPrice: 5000
};

console.log('\n📦 SCENARIO 1: Normal cart item');
console.log('Backend cart item:', JSON.stringify(mockBackendCartItem, null, 2));

console.log('\n📦 SCENARIO 2: Product data changed since adding to cart');
console.log('Updated product data:', JSON.stringify(mockDifferentProductData, null, 2));

console.log('\n🔄 SCENARIO 3: Frontend transformation logic');

// Simulate the frontend transformation logic from api.ts
function simulateTransformation(backendItem, updatedProductData = null) {
  const transformedItem = {
    id: backendItem.id,
    productId: backendItem.productId,
    quantity: backendItem.quantity,
    unitPrice: backendItem.unitPrice,  // From cart storage
    totalPrice: backendItem.subtotal || (backendItem.unitPrice * backendItem.quantity),
    addedAt: new Date().toISOString(),
    product: backendItem.product ? {
      id: backendItem.product.id,
      name: backendItem.product.name,
      price: backendItem.product.currentPrice || backendItem.product.price || backendItem.unitPrice,
      sku: backendItem.product.sku || '',
      images: backendItem.product.images || []
    } : undefined,
    productName: backendItem.product?.name || `Produit ${backendItem.productId}`
  };

  // If we have updated product data (e.g., from guest cart processing)
  if (updatedProductData) {
    transformedItem.product = {
      ...transformedItem.product,
      name: updatedProductData.name,
      price: updatedProductData.price
    };
    transformedItem.unitPrice = updatedProductData.price;  // This could cause mismatch!
    transformedItem.totalPrice = updatedProductData.price * transformedItem.quantity;
  }

  return transformedItem;
}

const normalTransform = simulateTransformation(mockBackendCartItem);
const problematicTransform = simulateTransformation(mockBackendCartItem, mockDifferentProductData);

console.log('\nNormal transformation result:');
console.log('  Display Name:', normalTransform.product?.name);
console.log('  Display Price:', normalTransform.unitPrice);
console.log('  Total Price:', normalTransform.totalPrice);

console.log('\nProblematic transformation result:');
console.log('  Display Name:', problematicTransform.product?.name);
console.log('  Display Price:', problematicTransform.unitPrice);
console.log('  Total Price:', problematicTransform.totalPrice);

console.log('\n🚨 POTENTIAL ISSUES IDENTIFIED:');

if (normalTransform.product?.name !== problematicTransform.product?.name) {
  console.log('❌ NAME MISMATCH: Product name changed from stored cart data');
  console.log(`   Stored: "${normalTransform.product?.name}"`);
  console.log(`   Current: "${problematicTransform.product?.name}"`);
}

if (normalTransform.unitPrice !== problematicTransform.unitPrice) {
  console.log('❌ PRICE MISMATCH: Unit price changed from stored cart data');
  console.log(`   Stored: ${normalTransform.unitPrice}`);
  console.log(`   Current: ${problematicTransform.unitPrice}`);
}

console.log('\n💡 SOLUTION RECOMMENDATIONS:');
console.log('1. Cart should display the price that was stored when item was added');
console.log('2. Show current product price separately if different');
console.log('3. Consider showing "Price updated" notification');
console.log('4. Allow user to refresh cart with current prices');

console.log('\n🎯 NEXT STEPS:');
console.log('1. Check the actual cart data in your browser');
console.log('2. Compare stored cart prices vs current product prices');
console.log('3. Identify where the price overwriting is happening');
console.log('4. Fix the transformation logic to preserve cart prices');
