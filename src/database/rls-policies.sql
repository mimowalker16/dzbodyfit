-- Row Level Security (RLS) Policies for ri.gym.pro
-- Execute this after running the main schema
-- These policies control data access at the database level

-- ========================================
-- ENABLE RLS ON ALL TABLES
-- ========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- ========================================
-- USER POLICIES
-- ========================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- USER ADDRESSES POLICIES
-- ========================================

-- Users can manage their own addresses
CREATE POLICY "Users can manage own addresses" ON user_addresses
    FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- PRODUCT CATALOG POLICIES (PUBLIC READ)
-- ========================================

-- Everyone can read categories
CREATE POLICY "Categories are publicly readable" ON categories
    FOR SELECT USING (is_active = true);

-- Everyone can read brands
CREATE POLICY "Brands are publicly readable" ON brands
    FOR SELECT USING (is_active = true);

-- Everyone can read active products
CREATE POLICY "Products are publicly readable" ON products
    FOR SELECT USING (status = 'active');

-- Everyone can read product variants
CREATE POLICY "Product variants are publicly readable" ON product_variants
    FOR SELECT USING (is_active = true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can manage brands
CREATE POLICY "Admins can manage brands" ON brands
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can manage products
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can manage product variants
CREATE POLICY "Admins can manage product variants" ON product_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- CART POLICIES
-- ========================================

-- Users can manage their own cart
CREATE POLICY "Users can manage own cart" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- ORDER POLICIES
-- ========================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own order items
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can update orders
CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- REVIEW POLICIES
-- ========================================

-- Everyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews" ON product_reviews
    FOR SELECT USING (is_approved = true);

-- Users can create reviews for their own orders
CREATE POLICY "Users can create reviews" ON product_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = product_reviews.order_id 
            AND orders.user_id = auth.uid()
            AND orders.status = 'delivered'
        )
    );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews" ON product_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- COUPON POLICIES
-- ========================================

-- Everyone can read active coupons (for validation)
CREATE POLICY "Active coupons are readable" ON coupons
    FOR SELECT USING (
        is_active = true 
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (expires_at IS NULL OR expires_at > NOW())
    );

-- Admins can manage coupons
CREATE POLICY "Admins can manage coupons" ON coupons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Users can view their own coupon usage
CREATE POLICY "Users can view own coupon usage" ON coupon_usage
    FOR SELECT USING (auth.uid() = user_id);

-- System can create coupon usage records
CREATE POLICY "System can create coupon usage" ON coupon_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- WISHLIST POLICIES
-- ========================================

-- Users can manage their own wishlist
CREATE POLICY "Users can manage own wishlist" ON wishlist_items
    FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- NOTIFICATION POLICIES
-- ========================================

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- System can create notifications for users
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- ========================================
-- ANALYTICS POLICIES
-- ========================================

-- System can insert page views
CREATE POLICY "System can insert page views" ON page_views
    FOR INSERT WITH CHECK (true);

-- Users can view their own page views
CREATE POLICY "Users can view own page views" ON page_views
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all analytics
CREATE POLICY "Admins can view analytics" ON page_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );
