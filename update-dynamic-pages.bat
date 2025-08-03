@echo off
echo RI.GYM.PRO - Update Dynamic Pages Script

echo.
echo Replacing static pages with dynamic versions...

echo - Updating orders page...
move /y "frontend\pages\orders-new.tsx" "frontend\pages\orders.tsx"

echo - Updating wishlist page...
move /y "frontend\pages\wishlist-new.tsx" "frontend\pages\wishlist.tsx"

echo - Updating order confirmation page...
move /y "frontend\pages\order-confirmation\[orderId]-new.tsx" "frontend\pages\order-confirmation\[orderId].tsx"

echo.
echo All pages have been updated successfully.
echo All user-related pages now use the auth utility for dynamic content.
pause
