-- Fix Multiple Permissive Policies Issue
-- This script removes duplicate admin policies that are causing performance warnings
-- The consolidated policies already handle both public and admin access

-- ========================================
-- DROP DUPLICATE ADMIN POLICIES
-- ========================================

-- Remove admin-specific policies that duplicate functionality in consolidated policies
DROP POLICY IF EXISTS "brands_admin_policy" ON brands;
DROP POLICY IF EXISTS "categories_admin_policy" ON categories;
DROP POLICY IF EXISTS "coupons_admin_policy" ON coupons;
DROP POLICY IF EXISTS "product_variants_admin_policy" ON product_variants;
DROP POLICY IF EXISTS "products_admin_policy" ON products;

-- ========================================
-- UPDATE CONSOLIDATED POLICIES TO HANDLE ALL OPERATIONS
-- ========================================

-- Update brands policy to handle all operations (not just SELECT)
DROP POLICY IF EXISTS "brands_select_policy" ON brands;
CREATE POLICY "brands_policy" ON brands
    FOR ALL USING (
        is_active = true 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Update categories policy to handle all operations (not just SELECT)
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
CREATE POLICY "categories_policy" ON categories
    FOR ALL USING (
        is_active = true 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Update coupons policy to handle all operations (not just SELECT)
DROP POLICY IF EXISTS "coupons_select_policy" ON coupons;
CREATE POLICY "coupons_policy" ON coupons
    FOR ALL USING (
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

-- Update product_variants policy to handle all operations (not just SELECT)
DROP POLICY IF EXISTS "product_variants_select_policy" ON product_variants;
CREATE POLICY "product_variants_policy" ON product_variants
    FOR ALL USING (
        is_active = true 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Update products policy to handle all operations (not just SELECT)
DROP POLICY IF EXISTS "products_select_policy" ON products;
CREATE POLICY "products_policy" ON products
    FOR ALL USING (
        status = 'active' 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = (select auth.uid()) 
            AND role IN ('admin', 'super_admin')
        )
    );
