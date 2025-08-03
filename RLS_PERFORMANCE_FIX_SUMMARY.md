# RLS Performance Optimization Fix

## Overview
This fix addresses critical performance warnings identified by Supabase's database advisor. The warnings affect 27 RLS policies across multiple tables and can significantly impact query performance at scale.

## Issues Fixed

### 1. Auth RLS Initialization Plan (27 warnings)
**Problem**: `auth.uid()` and other auth functions were being re-evaluated for each row during queries, causing poor performance.

**Solution**: Wrapped all auth function calls in SELECT subqueries:
```sql
-- Before (slow)
auth.uid() = user_id

-- After (fast)  
(select auth.uid()) = user_id
```

**Tables affected**: notifications, page_views, orders, product_reviews, products, coupons, categories, cart_items, brands, users, coupon_usage, order_items, product_variants, user_addresses, wishlist_items

### 2. Multiple Permissive Policies (40+ warnings)
**Problem**: Multiple permissive policies for the same role/action forced PostgreSQL to evaluate all policies for every query.

**Solution**: Consolidated overlapping policies into single, comprehensive policies using OR logic:
```sql
-- Before: Two separate policies
CREATE POLICY "public_read" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "admin_read" ON products FOR SELECT USING (is_admin());

-- After: One consolidated policy
CREATE POLICY "products_select_policy" ON products FOR SELECT USING (
    status = 'active' 
    OR EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin'))
);
```

## Performance Benefits

### Before Optimization
- ❌ Auth functions evaluated for every row
- ❌ Multiple policy evaluations per query
- ❌ Suboptimal query plans
- ❌ Higher CPU usage
- ❌ Slower response times at scale

### After Optimization
- ✅ Auth functions cached per query
- ✅ Single policy evaluation per operation
- ✅ Optimized query execution plans
- ✅ Reduced database CPU load
- ✅ Better performance under high load

## Tables Optimized

| Table | Policies Before | Policies After | Improvement |
|-------|----------------|----------------|-------------|
| users | 3 | 2 | Consolidated admin/user access |
| orders | 4 | 3 | Merged view policies |
| products | 2 | 2 | Fixed auth caching |
| product_reviews | 4 | 4 | Fixed auth + consolidated |
| categories | 2 | 2 | Fixed auth caching |
| brands | 2 | 2 | Fixed auth caching |
| coupons | 2 | 2 | Fixed auth caching |
| cart_items | 1 | 1 | Fixed auth caching |
| notifications | 3 | 3 | Fixed auth caching |
| page_views | 3 | 2 | Consolidated policies |

## How to Apply

### Option 1: Automated Script
```bash
cd /path/to/your/project
node scripts/fix-rls-performance.js
```

### Option 2: Manual Application
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `src/database/fix-rls-performance.sql`
3. Execute the SQL script

## Verification

After applying the fixes, you can verify the optimization worked:

```sql
-- Check policy count per table
SELECT tablename, COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename 
ORDER BY tablename;

-- View all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

## Expected Results

After applying these fixes:
- ✅ All 27 "Auth RLS Initialization Plan" warnings should be resolved
- ✅ All 40+ "Multiple Permissive Policies" warnings should be resolved
- ✅ Database queries will execute faster
- ✅ Lower CPU usage on your Supabase instance
- ✅ Better scalability for high-traffic scenarios

## Notes

- These changes maintain the same security model - no permissions are changed
- All existing functionality will work exactly the same
- The optimization is purely performance-focused
- Changes are backward compatible
- No application code changes required

## Monitoring

After applying the fixes, monitor your Supabase dashboard for:
- Reduced query execution times
- Lower CPU usage metrics
- Improved response times under load
- No new advisor warnings

The fixes should show immediate improvement in query performance, especially noticeable with larger datasets or higher concurrent user loads.
