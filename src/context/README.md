# Authentication Context Implementation

This directory contains the complete authentication context implementation for the React Native Blog App.

## Files Overview

### Core Implementation
- **`AuthContext.tsx`** - Main authentication context with state management and actions
- **`index.ts`** - Exports all authentication-related components and hooks

### Specialized Hooks
- **`hooks/useAuthActions.ts`** - Hook providing only authentication actions
- **`hooks/useAuthState.ts`** - Hook providing only authentication state
- **`hooks/useAuthGuard.ts`** - Hook for role-based access control
- **`hooks/useAuthPersistence.ts`** - Hook for managing authentication data persistence

### Documentation & Examples
- **`examples/AuthContextUsage.tsx`** - Complete usage examples for all hooks and components
- **`__tests__/AuthContext.test.tsx`** - Comprehensive test suite (requires testing dependencies)

## Features Implemented

### ✅ Core Authentication Context
- [x] Login functionality with email/password
- [x] Logout functionality with cleanup
- [x] User state management (AuthUser with token)
- [x] Loading states for async operations
- [x] Error handling and error clearing
- [x] Authentication status checking

### ✅ Token Storage and Persistence
- [x] AsyncStorage integration for token persistence
- [x] Automatic token retrieval on app start
- [x] Secure token storage with proper cleanup
- [x] Authentication state restoration from storage

### ✅ Authentication Hooks
- [x] `useAuth` - Main hook with full context access
- [x] `useAuthState` - Read-only state access
- [x] `useAuthActions` - Action-only access
- [x] `useAuthGuard` - Role-based access control
- [x] `useAuthPersistence` - Storage management utilities

### ✅ Role-Based Access Control
- [x] Teacher vs Student role differentiation
- [x] Permission checking utilities
- [x] Protected action guards
- [x] Conditional rendering helpers

## Usage Examples

### Basic Authentication
```tsx
import { useAuth } from '../context';

const LoginScreen = () => {
  const { isAuthenticated, isLoading, error, actions } = useAuth();
  
  const handleLogin = async () => {
    try {
      await actions.login('teacher@example.com', 'password');
    } catch (error) {
      // Error is automatically stored in context
    }
  };
  
  // Component implementation...
};
```

### Role-Based Access Control
```tsx
import { useAuthGuard } from '../context';

const AdminPanel = () => {
  const { isTeacher, canAccessAdmin, requireTeacher } = useAuthGuard();
  
  if (!requireTeacher()) {
    return <AccessDenied />;
  }
  
  // Admin panel implementation...
};
```

### State-Only Access
```tsx
import { useAuthState } from '../context';

const UserProfile = () => {
  const { user, isAuthenticated } = useAuthState();
  
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }
  
  // Profile implementation...
};
```

## Integration with API Service

The authentication context integrates seamlessly with the existing API service:

- Uses `apiService.login()` for authentication
- Uses `apiService.logout()` for logout
- Automatically stores tokens in AsyncStorage
- Handles API errors and token expiration

## Requirements Satisfied

This implementation satisfies all requirements from task 4:

1. ✅ **Create AuthContext with login, logout, and user state management**
   - Complete AuthContext with reducer-based state management
   - Login/logout actions with proper error handling
   - User state with AuthUser type including token

2. ✅ **Implement token storage and retrieval using AsyncStorage**
   - AsyncStorage integration for token persistence
   - Automatic token storage on login
   - Token cleanup on logout
   - Secure storage key management

3. ✅ **Add authentication state persistence and automatic login**
   - Authentication state restoration on app start
   - Automatic token validation
   - Persistent login sessions
   - Graceful handling of expired tokens

4. ✅ **Create authentication hooks for components**
   - Multiple specialized hooks for different use cases
   - Role-based access control utilities
   - Storage management hooks
   - Clean separation of concerns

## Next Steps

To use this authentication context in your app:

1. Wrap your app with `AuthProvider`
2. Use the appropriate hooks in your components
3. Implement protected routes using `useAuthGuard`
4. Handle authentication flows in your screens

Example app setup:
```tsx
import { AuthProvider } from './src/context';

export default function App() {
  return (
    <AuthProvider>
      <YourAppContent />
    </AuthProvider>
  );
}
```