-- Fix Supabase RLS Performance Issues
-- This script addresses two main performance problems:
-- 1. Auth RLS Initialization Plan - wraps auth functions in SELECT subqueries
-- 2. Multiple Permissive Policies - consolidates overlapping policies

-- ========================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ========================================

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- User addresses policies
DROP POLICY IF EXISTS "Users can manage own addresses" ON user_addresses;

-- Categories policies
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

-- Brands policies
DROP POLICY IF EXISTS "Brands are publicly readable" ON brands;
DROP POLICY IF EXISTS "Admins can manage brands" ON brands;

-- Products policies
DROP POLICY IF EXISTS "Products are publicly readable" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Product variants policies
DROP POLICY IF EXISTS "Product variants are publicly readable" ON product_variants;
DROP POLICY IF EXISTS "Admins can manage product variants" ON product_variants;

-- Cart policies
DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;

-- Order policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Review policies
DROP POLICY IF EXISTS "Anyone can read approved reviews" ON product_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON product_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON product_reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON product_reviews;

-- Coupon policies
DROP POLICY IF EXISTS "Active coupons are readable" ON coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
DROP POLICY IF EXISTS "Users can view own coupon usage" ON coupon_usage;
DROP POLICY IF EXISTS "System can create coupon usage" ON coupon_usage;

-- Wishlist policies
DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlist_items;

-- Notification policies
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Analytics policies
DROP POLICY IF EXISTS "System can insert page views" ON page_views;
DROP POLICY IF EXISTS "Users can view own page views" ON page_views;
DROP POLICY IF EXISTS "Admins can view analytics" ON page_views;

-- ========================================
-- STEP 2: CREATE OPTIMIZED POLICIES
-- ========================================

-- ========================================
-- USER POLICIES - CONSOLIDATED
-- ========================================

-- Combined policy for users to read their own profile OR admins to read all
CREATE POLICY "users_select_policy" ON users
    FOR SELECT USING (
        (select auth.uid()) = id 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Users can update their own profile
CREATE POLICY "users_update_policy" ON users
    FOR UPDATE USING ((select auth.uid()) = id);

-- ========================================
-- USER ADDRESSES POLICIES
-- ========================================

-- Users can manage their own addresses
CREATE POLICY "user_addresses_policy" ON user_addresses
    FOR ALL USING ((select auth.uid()) = user_id);

-- ========================================
-- CATEGORIES - CONSOLIDATED
-- ========================================

-- Everyone can read active categories OR admins can manage all
CREATE POLICY "categories_select_policy" ON categories
    FOR SELECT USING (
        is_active = true 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can insert/update/delete categories
CREATE POLICY "categories_admin_policy" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- BRANDS - CONSOLIDATED
-- ========================================

-- Everyone can read active brands OR admins can manage all
CREATE POLICY "brands_select_policy" ON brands
    FOR SELECT USING (
        is_active = true 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can insert/update/delete brands
CREATE POLICY "brands_admin_policy" ON brands
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- PRODUCTS - CONSOLIDATED
-- ========================================

-- Everyone can read active products OR admins can manage all
CREATE POLICY "products_select_policy" ON products
    FOR SELECT USING (
        status = 'active' 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can insert/update/delete products
CREATE POLICY "products_admin_policy" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- PRODUCT VARIANTS - CONSOLIDATED
-- ========================================

-- Everyone can read active variants OR admins can manage all
CREATE POLICY "product_variants_select_policy" ON product_variants
    FOR SELECT USING (
        is_active = true 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can insert/update/delete variants
CREATE POLICY "product_variants_admin_policy" ON product_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- CART POLICIES
-- ========================================

-- Users can manage their own cart
CREATE POLICY "cart_items_policy" ON cart_items
    FOR ALL USING ((select auth.uid()) = user_id);

-- ========================================
-- ORDER POLICIES - CONSOLIDATED
-- ========================================

-- Users can view own orders OR admins can view all orders
CREATE POLICY "orders_select_policy" ON orders
    FOR SELECT USING (
        (select auth.uid()) = user_id 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Users can create orders for themselves
CREATE POLICY "orders_insert_policy" ON orders
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Admins can update orders
CREATE POLICY "orders_update_policy" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Users can view their own order items
CREATE POLICY "order_items_policy" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = (select auth.uid())
        )
    );

-- ========================================
-- PRODUCT REVIEWS - CONSOLIDATED
-- ========================================

-- Everyone can read approved reviews OR admins can read all
CREATE POLICY "product_reviews_select_policy" ON product_reviews
    FOR SELECT USING (
        is_approved = true 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Users can create reviews OR admins can create any review
CREATE POLICY "product_reviews_insert_policy" ON product_reviews
    FOR INSERT WITH CHECK (
        (
            (select auth.uid()) = user_id 
            AND EXISTS (
                SELECT 1 FROM orders 
                WHERE orders.id = product_reviews.order_id 
                AND orders.user_id = (select auth.uid())
                AND orders.status = 'delivered'
            )
        )
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Users can update own reviews OR admins can update any review
CREATE POLICY "product_reviews_update_policy" ON product_reviews
    FOR UPDATE USING (
        (select auth.uid()) = user_id 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can delete reviews
CREATE POLICY "product_reviews_delete_policy" ON product_reviews
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- COUPON POLICIES - CONSOLIDATED
-- ========================================

-- Everyone can read active coupons OR admins can read all
CREATE POLICY "coupons_select_policy" ON coupons
    FOR SELECT USING (
        (
            is_active = true 
            AND (starts_at IS NULL OR starts_at <= NOW())
            AND (expires_at IS NULL OR expires_at > NOW())
        )
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can manage coupons
CREATE POLICY "coupons_admin_policy" ON coupons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Users can view their own coupon usage
CREATE POLICY "coupon_usage_select_policy" ON coupon_usage
    FOR SELECT USING ((select auth.uid()) = user_id);

-- Users can create their own coupon usage
CREATE POLICY "coupon_usage_insert_policy" ON coupon_usage
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- ========================================
-- WISHLIST POLICIES
-- ========================================

-- Users can manage their own wishlist
CREATE POLICY "wishlist_items_policy" ON wishlist_items
    FOR ALL USING ((select auth.uid()) = user_id);

-- ========================================
-- NOTIFICATION POLICIES
-- ========================================

-- Users can read their own notifications
CREATE POLICY "notifications_select_policy" ON notifications
    FOR SELECT USING ((select auth.uid()) = user_id);

-- Users can update their own notifications
CREATE POLICY "notifications_update_policy" ON notifications
    FOR UPDATE USING ((select auth.uid()) = user_id);

-- System can create notifications (no auth check needed for system operations)
CREATE POLICY "notifications_insert_policy" ON notifications
    FOR INSERT WITH CHECK (true);

-- ========================================
-- ANALYTICS POLICIES - CONSOLIDATED
-- ========================================

-- System can insert page views
CREATE POLICY "page_views_insert_policy" ON page_views
    FOR INSERT WITH CHECK (true);

-- Users can view own page views OR admins can view all
CREATE POLICY "page_views_select_policy" ON page_views
    FOR SELECT USING (
        (select auth.uid()) = user_id 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Run these queries to verify the policies are working correctly:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;

-- Count policies per table:
-- SELECT tablename, COUNT(*) as policy_count FROM pg_policies WHERE schemaname = 'public' GROUP BY tablename ORDER BY tablename;
