# Context Implementation

This directory contains the complete context implementations for the React Native Blog App, including authentication and posts management.

## Files Overview

### Core Implementation
- **`AuthContext.tsx`** - Main authentication context with state management and actions
- **`PostsContext.tsx`** - Main posts context with CRUD operations and search functionality
- **`index.ts`** - Exports all context-related components and hooks

### Specialized Hooks
- **`hooks/useAuthActions.ts`** - Hook providing only authentication actions
- **`hooks/useAuthState.ts`** - Hook providing only authentication state
- **`hooks/useAuthGuard.ts`** - Hook for role-based access control
- **`hooks/useAuthPersistence.ts`** - Hook for managing authentication data persistence
- **`hooks/usePostsActions.ts`** - Hook providing only posts actions
- **`hooks/usePostsState.ts`** - Hook providing only posts state
- **`hooks/usePostsSearch.ts`** - Hook for posts search functionality with debouncing
- **`hooks/usePostsCrud.ts`** - Hook for posts CRUD operations with error handling

### Documentation & Examples
- **`examples/AuthContextUsage.tsx`** - Complete usage examples for authentication hooks and components
- **`examples/PostsContextUsage.tsx`** - Complete usage examples for posts hooks and components
- **`__tests__/AuthContext.test.tsx`** - Comprehensive authentication test suite
- **`__tests__/PostsContext.test.tsx`** - Comprehensive posts test suite

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

### ✅ Core Posts Context
- [x] Posts list management with state
- [x] Individual post fetching and display
- [x] Search functionality with debounced queries
- [x] CRUD operations (Create, Read, Update, Delete)
- [x] Loading states for all async operations
- [x] Error handling and error clearing
- [x] Current post state management

### ✅ Posts Search Functionality
- [x] Real-time search with debouncing
- [x] Search results state management
- [x] Search query persistence
- [x] Search error handling
- [x] Clear search functionality

### ✅ Posts CRUD Operations
- [x] Create new posts with validation
- [x] Update existing posts with optimistic updates
- [x] Delete posts with confirmation
- [x] Optimistic UI updates for better UX
- [x] Error handling with user feedback

### ✅ Posts Hooks
- [x] `usePosts` - Main hook with full context access
- [x] `usePostsState` - Read-only state access
- [x] `usePostsActions` - Action-only access
- [x] `usePostsSearch` - Search functionality with debouncing
- [x] `usePostsCrud` - CRUD operations with error handling

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

### Basic Posts Management
```tsx
import { usePosts } from '../context';

const PostsList = () => {
  const { posts, isLoading, error, actions } = usePosts();
  
  useEffect(() => {
    actions.fetchPosts().catch(() => {
      // Error handled by context
    });
  }, [actions]);
  
  // Component implementation...
};
```

### Posts Search
```tsx
import { usePostsSearch } from '../context';

const SearchPosts = () => {
  const { 
    searchResults, 
    searchQuery, 
    isSearching,
    handleSearchQueryChange,
    clearSearch 
  } = usePostsSearch(500); // 500ms debounce
  
  // Component implementation...
};
```

### Posts CRUD Operations
```tsx
import { usePostsCrud } from '../context';

const CreatePost = () => {
  const { createPost, error, isLoading } = usePostsCrud();
  
  const handleSubmit = async (postData) => {
    const result = await createPost(postData);
    if (result.success) {
      // Handle success
    } else {
      // Handle error
    }
  };
  
  // Component implementation...
};
```

## Integration with API Service

Both contexts integrate seamlessly with the existing API service:

### Authentication Context
- Uses `apiService.login()` for authentication
- Uses `apiService.logout()` for logout
- Automatically stores tokens in AsyncStorage
- Handles API errors and token expiration

### Posts Context
- Uses `apiService.getPosts()` for fetching all posts
- Uses `apiService.getPost()` for fetching individual posts
- Uses `apiService.searchPosts()` for search functionality
- Uses `apiService.createPost()` for creating new posts
- Uses `apiService.updatePost()` for updating existing posts
- Uses `apiService.deletePost()` for deleting posts
- Handles all API errors with user-friendly messages

## Requirements Satisfied

### Authentication Context (Task 4)

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

### Posts Context (Task 5)

This implementation satisfies all requirements from task 5:

1. ✅ **Implement PostsContext for managing posts state**
   - Complete PostsContext with reducer-based state management
   - Posts list state with loading and error handling
   - Current post state for detailed views
   - Search results state management

2. ✅ **Add actions for fetching, creating, updating, and deleting posts**
   - `fetchPosts()` - Fetch all posts from API
   - `fetchPost(id)` - Fetch individual post by ID
   - `createPost(data)` - Create new post with optimistic updates
   - `updatePost(id, data)` - Update existing post with optimistic updates
   - `deletePost(id)` - Delete post with optimistic updates

3. ✅ **Implement search functionality state management**
   - `searchPosts(query)` - Search posts with API integration
   - Search results state with loading indicators
   - Search query persistence
   - Debounced search with configurable delay
   - Clear search functionality

4. ✅ **Create posts-related hooks for components**
   - `usePosts` - Main hook with full context access
   - `usePostsState` - Read-only state access for performance
   - `usePostsActions` - Action-only access for event handlers
   - `usePostsSearch` - Specialized search hook with debouncing
   - `usePostsCrud` - CRUD operations with error handling and success feedback

## Next Steps

To use both contexts in your app:

1. Wrap your app with both `AuthProvider` and `PostsProvider`
2. Use the appropriate hooks in your components
3. Implement protected routes using `useAuthGuard`
4. Handle authentication and posts flows in your screens

Example app setup:
```tsx
import { AuthProvider, PostsProvider } from './src/context';

export default function App() {
  return (
    <AuthProvider>
      <PostsProvider>
        <YourAppContent />
      </PostsProvider>
    </AuthProvider>
  );
}
```

### Usage in Components
```tsx
// In a screen component
import { useAuth, usePosts, usePostsSearch } from './src/context';

const HomeScreen = () => {
  const { isAuthenticated } = useAuth();
  const { posts, actions: postsActions } = usePosts();
  const { searchResults, handleSearchQueryChange } = usePostsSearch();
  
  // Component implementation...
};
```
#
# User Management Contexts (Task 6)

### ✅ Teachers Context
- [x] Complete TeachersContext with pagination support
- [x] CRUD operations for teacher management
- [x] Pagination state management with navigation helpers
- [x] Loading states and error handling
- [x] Current teacher selection state
- [x] Integration with API service

### ✅ Students Context
- [x] Complete StudentsContext with pagination support
- [x] CRUD operations for student management
- [x] Pagination state management with navigation helpers
- [x] Loading states and error handling
- [x] Current student selection state
- [x] Integration with API service

### Teachers Context Features

#### State Management
- `data`: Array of teachers or null
- `loading`: Loading state ('idle' | 'loading' | 'success' | 'error')
- `error`: Error message if any
- `pagination`: Complete pagination information
- `currentTeacher`: Currently selected teacher

#### Actions
- `fetchTeachers(page?)`: Load teachers with optional page number
- `fetchTeacher(id)`: Load specific teacher by ID
- `createTeacher(teacher)`: Create new teacher
- `updateTeacher(id, teacher)`: Update existing teacher
- `deleteTeacher(id)`: Delete teacher
- `clearCurrentTeacher()`: Clear selected teacher
- `clearError()`: Clear error state

#### Pagination Support
```tsx
const { pagination } = useTeachers();

// Pagination includes:
// - currentPage: Current page number
// - totalPages: Total number of pages
// - totalItems: Total number of teachers
// - itemsPerPage: Teachers per page
// - hasNextPage: Boolean for next page availability
// - hasPreviousPage: Boolean for previous page availability
```

### Students Context Features

#### State Management
- `data`: Array of students or null
- `loading`: Loading state ('idle' | 'loading' | 'success' | 'error')
- `error`: Error message if any
- `pagination`: Complete pagination information
- `currentStudent`: Currently selected student

#### Actions
- `fetchStudents(page?)`: Load students with optional page number
- `fetchStudent(id)`: Load specific student by ID
- `createStudent(student)`: Create new student
- `updateStudent(id, student)`: Update existing student
- `deleteStudent(id)`: Delete student
- `clearCurrentStudent()`: Clear selected student
- `clearError()`: Clear error state

### Usage Examples

#### Teachers Management
```tsx
import { useTeachers } from '../context';

const TeachersManagement = () => {
  const { 
    data: teachers, 
    loading, 
    pagination, 
    error,
    actions 
  } = useTeachers();
  
  useEffect(() => {
    actions.fetchTeachers();
  }, []);
  
  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      actions.fetchTeachers(pagination.currentPage + 1);
    }
  };
  
  const handleCreateTeacher = async () => {
    try {
      await actions.createTeacher({
        name: 'New Teacher',
        email: 'teacher@example.com',
        password: 'password123',
        department: 'Computer Science',
      });
    } catch (error) {
      // Error handled by context
    }
  };
  
  // Component implementation...
};
```

#### Students Management
```tsx
import { useStudents } from '../context';

const StudentsManagement = () => {
  const { 
    data: students, 
    loading, 
    pagination, 
    currentStudent,
    actions 
  } = useStudents();
  
  const handleUpdateStudent = async (id, updates) => {
    try {
      await actions.updateStudent(id, updates);
      // Success handled automatically
    } catch (error) {
      // Error handled by context
    }
  };
  
  const handleDeleteStudent = async (id) => {
    try {
      await actions.deleteStudent(id);
      // Optimistic update applied
    } catch (error) {
      // Error handled by context
    }
  };
  
  // Component implementation...
};
```

### Complete Provider Setup

Update your app setup to include all contexts:

```tsx
import { 
  AuthProvider, 
  PostsProvider, 
  TeachersProvider, 
  StudentsProvider 
} from './src/context';

export default function App() {
  return (
    <AuthProvider>
      <PostsProvider>
        <TeachersProvider>
          <StudentsProvider>
            <YourAppContent />
          </StudentsProvider>
        </TeachersProvider>
      </PostsProvider>
    </AuthProvider>
  );
}
```

### Requirements Satisfied (Task 6)

This implementation satisfies all requirements from task 6:

1. ✅ **Create TeachersContext for teacher management state**
   - Complete TeachersContext with reducer-based state management
   - Teacher list state with loading and error handling
   - Current teacher state for detailed operations
   - Optimistic updates for better UX

2. ✅ **Create StudentsContext for student management state**
   - Complete StudentsContext with reducer-based state management
   - Student list state with loading and error handling
   - Current student state for detailed operations
   - Optimistic updates for better UX

3. ✅ **Add pagination support for user lists**
   - Complete pagination state with navigation helpers
   - Page-based data fetching with API integration
   - Pagination controls (next/previous page availability)
   - Total items and pages tracking
   - Items per page calculation

4. ✅ **Implement CRUD operations state management for both contexts**
   - **Create**: Add new teachers/students with optimistic updates
   - **Read**: Fetch individual and paginated lists of users
   - **Update**: Modify existing users with state synchronization
   - **Delete**: Remove users with optimistic updates and cleanup
   - Error handling for all operations
   - Loading states for async operations

### API Integration

Both contexts integrate with the existing API service:

#### Teachers Context
- Uses `apiService.getTeachers(page)` for paginated teacher lists
- Uses `apiService.createTeacher(data)` for creating teachers
- Uses `apiService.updateTeacher(id, data)` for updating teachers
- Uses `apiService.deleteTeacher(id)` for deleting teachers

#### Students Context
- Uses `apiService.getStudents(page)` for paginated student lists
- Uses `apiService.createStudent(data)` for creating students
- Uses `apiService.updateStudent(id, data)` for updating students
- Uses `apiService.deleteStudent(id)` for deleting students

### Error Handling

Both contexts implement comprehensive error handling:

```tsx
const { error, actions } = useTeachers();

// Automatic error state management
if (error) {
  return (
    <ErrorMessage 
      message={error} 
      onDismiss={actions.clearError} 
    />
  );
}

// Try-catch for additional error handling
const handleOperation = async () => {
  try {
    await actions.someOperation();
  } catch (error) {
    // Error automatically stored in context state
    // Additional custom error handling if needed
  }
};
```

### Testing

Both contexts include comprehensive test suites:

- **`__tests__/TeachersContext.test.tsx`** - Complete test coverage for teachers context
- **`__tests__/StudentsContext.test.tsx`** - Complete test coverage for students context

Test coverage includes:
- Initial state verification
- Successful operations (fetch, create, update, delete)
- Error handling scenarios
- Pagination functionality
- Context provider requirements
- Hook usage outside provider error handling

### Usage Examples

Complete usage examples are provided:

- **`examples/TeachersContextUsage.tsx`** - Full implementation example with UI
- **`examples/StudentsContextUsage.tsx`** - Full implementation example with UI

These examples demonstrate:
- Complete CRUD operations with UI
- Pagination controls and navigation
- Error handling and user feedback
- Loading states and user experience
- Form handling and validation patterns
- Confirmation dialogs for destructive actions