# Token Expiration Handling Implementation

## Problem
When the authentication token expires, the API returns a 401 error with the message "Token de acesso inválido ou expirado", but the user remains stuck on the current screen instead of being redirected to the login page.

## Solution
Implemented automatic token expiration handling that redirects users to the login screen when their token expires.

## Implementation Details

### 1. API Service Enhancement (`src/services/apiService.ts`)

**Added token expiration callback mechanism:**
```typescript
class BlogApiService implements ApiService {
  private onTokenExpired?: () => void;

  setTokenExpiredCallback(callback: () => void): void {
    this.onTokenExpired = callback;
  }
}
```

**Enhanced response interceptor:**
```typescript
this.client.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      await this.clearAuthData();
      // Notify about token expiration to trigger redirect to login
      if (this.onTokenExpired) {
        this.onTokenExpired();
      }
    }
    // ... rest of error handling
  }
);
```

### 2. AuthContext Enhancement (`src/context/AuthContext.tsx`)

**Added token expiration handler:**
```typescript
const handleTokenExpired = async (): Promise<void> => {
  // Clear auth data and update state without making API call
  // since we already know the token is expired
  await clearStoredAuthData();
  dispatch({ type: 'LOGOUT' });
};
```

**Setup callback on initialization:**
```typescript
useEffect(() => {
  checkAuthStatus();
  
  // Set up callback for when token expires
  enhancedApiService.setTokenExpiredCallback(handleTokenExpired);
}, []);
```

**Updated context actions:**
```typescript
const contextValue: AuthContextValue = {
  ...state,
  actions: {
    login,
    logout,
    clearError,
    checkAuthStatus,
    handleTokenExpired, // New action
  },
};
```

### 3. Type Definitions Update (`src/types/context.ts`)

**Added new action to AuthContextActions:**
```typescript
export interface AuthContextActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
  handleTokenExpired: () => Promise<void>; // New action
}
```

## How It Works

### Automatic Redirect Flow:
1. **API Request with Expired Token**: User makes an API request with an expired token
2. **Server Returns 401**: API server responds with 401 status and Portuguese error message
3. **API Service Intercepts**: Response interceptor catches the 401 error
4. **Clear Auth Data**: API service clears stored authentication data
5. **Trigger Callback**: API service calls the registered `onTokenExpired` callback
6. **AuthContext Updates**: `handleTokenExpired()` method updates authentication state
7. **Navigation Switches**: `AppNavigator` detects `isAuthenticated: false` and switches to Auth stack
8. **User Sees Login**: User is automatically redirected to the login screen

### Error Message Translation:
The existing Portuguese error message translation system handles the "Token de acesso inválido ou expirado" message, converting it to "Invalid or expired access token" for better user experience.

## Testing

Created comprehensive tests in `tests/test-token-expiration.js` that verify:
- ✅ Token expiration callback mechanism works correctly
- ✅ Authentication state is properly updated when token expires
- ✅ Portuguese error messages are translated correctly
- ✅ User logout flow is triggered automatically

## Benefits

1. **Seamless User Experience**: No more stuck screens when tokens expire
2. **Automatic Recovery**: Users are immediately redirected to login without manual intervention
3. **Clear Error Messages**: Portuguese errors are translated to English
4. **Robust Error Handling**: Handles all 401 scenarios consistently
5. **Maintainable Code**: Clean separation of concerns between API service and authentication context

## Files Modified

- `src/services/apiService.ts` - Added token expiration callback mechanism
- `src/context/AuthContext.tsx` - Added token expiration handler and callback setup
- `src/types/context.ts` - Updated type definitions
- `tests/test-token-expiration.js` - Added comprehensive tests

## Result

✅ **Problem Solved**: Users are now automatically redirected to the login page when their token expires, eliminating the stuck screen issue and providing a smooth authentication experience.