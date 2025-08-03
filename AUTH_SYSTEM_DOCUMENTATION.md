# Unified Authentication System Documentation

## Overview

The authentication system has been completely refactored to provide a unified, robust, and maintainable solution. All authentication logic is now centralized in a single context with consistent state management and error handling.

## Architecture

### Core Components

#### 1. AuthContext (`/src/context/AuthContext.tsx`)
- **Single source of truth** for all authentication state
- Handles login, registration, logout, and profile updates
- Manages authentication tokens via cookies
- Provides loading states and error handling
- Includes mock authentication fallback for development

#### 2. Storage Management
- **Unified storage keys**: `auth.user`, `auth.isAuthenticated`
- **Token storage**: `authToken`, `refreshToken` cookies
- **Legacy cleanup**: Automatically removes old storage keys
- **Cart integration**: Clears cart data on user switch

#### 3. SSR/CSR Compatibility
- Proper hydration handling
- Loading states during initialization
- Client-side only authentication checks
- No flash of unauthenticated content

## Key Features

### Authentication Flows

#### Login Flow
1. User submits login form
2. API call to authenticate user
3. On success: Set tokens, update user state, clear cart data
4. On failure: Fallback to mock authentication (development)
5. Redirect to intended page or account dashboard

#### Registration Flow
1. User submits registration form
2. API call to create account
3. On success: Auto-login user, set tokens, clear cart data
4. On failure: Fallback to mock registration (development)
5. Redirect to account dashboard

#### Logout Flow
1. Call logout API endpoint (if authenticated)
2. Clear all authentication data
3. Clear cart data
4. Update state to unauthenticated
5. Redirect to home page

### State Management

#### User State
```typescript
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  role?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  address?: Address;
  notifications?: NotificationSettings;
  privacy?: PrivacySettings;
}
```

#### Auth Context
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<Result>;
  register: (userData: RegisterFormData) => Promise<Result>;
  logout: () => Promise<Result>;
  updateUserProfile: (data: Partial<User>) => Promise<Result>;
  refreshSession: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}
```

## Integration Points

### Components Using Auth Context

1. **Pages**:
   - `/pages/auth/login.tsx`
   - `/pages/auth/register.tsx`
   - `/pages/account/index.tsx`
   - `/pages/account/settings.tsx`
   - All protected pages with `withAuth` HOC

2. **Layout Components**:
   - `SafeContextHeader.tsx`
   - `MobileMenu.tsx`
   - `AccountSidebar.tsx`

3. **HOCs**:
   - `withAuth` for protected routes
   - `withAuthHOC.tsx` for route protection

### Cart Integration

The authentication system is tightly integrated with the cart system:

- **User-specific carts**: `cart_user_${user.id}`
- **Guest carts**: `cart_${guestSessionId}`
- **Cart merging**: On login, guest cart merges with user cart
- **Cart clearing**: On logout/user switch, cart data is cleared

## Error Handling

### Robust Error Management
- API failures gracefully fall back to mock authentication
- User-friendly error messages via toast notifications
- Proper loading states during all operations
- Network error recovery

### Development Features
- Mock authentication when API is unavailable
- Console warnings for debugging
- Detailed error logging
- Easy testing with predefined credentials

## Storage Schema

### localStorage Keys
```javascript
{
  "auth.user": "JSON stringified User object",
  "auth.isAuthenticated": "true/false",
  "guestSessionId": "unique guest identifier",
  "cart_user_123": "user-specific cart data",
  "cart_guest_456": "guest-specific cart data"
}
```

### Cookie Keys
```javascript
{
  "authToken": "JWT access token (7 days)",
  "refreshToken": "JWT refresh token (30 days)"
}
```

## Security Considerations

### Token Management
- Secure cookie storage for tokens
- Automatic token refresh
- Proper token expiration handling
- Cross-site request forgery protection

### Data Protection
- No sensitive data in localStorage
- Secure API communication
- Proper session cleanup
- User data validation

## Migration Notes

### From Legacy System
The old authentication system had multiple contexts and inconsistent storage. The migration included:

1. **Consolidated contexts**: Removed `UnifiedAuthContext.tsx` and `lib/auth.ts`
2. **Unified imports**: All components now import from `@/context/AuthContext`
3. **Storage cleanup**: Legacy keys (`user`, `loggedIn`) are automatically cleaned
4. **Type safety**: Consistent TypeScript interfaces throughout
5. **Error handling**: Improved error management and user feedback

### Breaking Changes
- All imports must use `@/context/AuthContext`
- `useAuth` hook interface remains the same for compatibility
- `withAuth` HOC behavior is consistent but more robust

## Usage Examples

### Basic Authentication Check
```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  
  return isAuthenticated ? (
    <WelcomeMessage user={user} />
  ) : (
    <LoginPrompt />
  );
}
```

### Protected Route
```typescript
import { withAuth } from '@/context/AuthContext';

function ProtectedPage() {
  return <div>This page requires authentication</div>;
}

export default withAuth(ProtectedPage);
```

### Login Form
```typescript
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const { login, isLoading } = useAuth();
  
  const handleSubmit = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.success) {
      // Handle success
    } else {
      // Handle error
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Testing

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new account
- [ ] Logout functionality
- [ ] Protected route redirection
- [ ] Session persistence across page reloads
- [ ] Cart data integrity during auth state changes
- [ ] Mobile menu authentication states
- [ ] Profile updates

### Development Testing
- [ ] Mock authentication fallback
- [ ] API failure handling
- [ ] SSR compatibility
- [ ] TypeScript compilation
- [ ] Build process completion

## Performance Considerations

### Optimization Features
- Lazy loading of auth state
- Minimal re-renders with proper dependency arrays
- Efficient storage operations
- Debounced API calls
- Smart caching strategies

### Bundle Size
- Tree-shaking compatible exports
- Minimal dependencies
- Code splitting for auth pages
- Optimized context provider

This unified authentication system provides a robust, maintainable, and scalable foundation for user management in the ri.gym.pro application.
