-- Fix Multiple Permissive Policies - Step by Step
-- Run each section separately to avoid syntax errors

-- ========================================
-- STEP 1: DROP DUPLICATE ADMIN POLICIES
-- ========================================

DROP POLICY IF EXISTS "brands_admin_policy" ON brands;
