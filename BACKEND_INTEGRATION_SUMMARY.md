# Backend API Integration Summary

This document summarizes the changes made to integrate the React Native blog app with the backend API following the API documentation patterns.

## Changes Made

### 1. Configuration Updates

**File: `src/config/index.ts`**
- Updated `API_CONFIG.BASE_URL` from `http://localhost:3000` to `http://localhost:3001/api`
- This matches the backend server URL structure specified in the API documentation

### 2. API Service Updates

**File: `src/services/apiService.ts`**

#### Authentication Changes:
- **Token Header**: Changed from `Authorization: Bearer ${token}` to `accessToken: ${token}` to match backend expectations
- **Login Endpoint**: Updated from `/auth/login` to `/login`
- **Login Request Format**: Changed password field from `password` to `senha` (Portuguese) as expected by backend
- **Token Handling**: Added JWT token decoding to extract user information from the access token
- **Token Validation**: Added token expiration checking in request interceptors
- **Logout**: Simplified to only clear local data (no backend endpoint needed)

#### Posts API Changes:
- **Endpoints**: Updated from `/api/posts` to `/posts` (base URL already includes `/api`)
- **Get Single Post**: Changed from `/posts/${id}` to `/posts?id=${id}` with array response handling
- **Search Posts**: Changed from `/posts/search/${term}` to `/posts?search=${term}`
- **Create Post**: Updated to extract `author_id` from JWT token and include it in the request

### 3. Type System Updates

**File: `src/types/index.ts`**

#### Post Interface:
- Changed `author: string` to `author_id: number`

#### Request Types:
- **CreatePostRequest**: Updated to use `author_id: number`

### 4. JWT Token Utilities

**New File: `src/utils/jwt.ts`**
- Added JWT token decoding functionality using `jwt-decode` library
- Created utilities for:
  - `decodeToken()`: Decode JWT token to extract payload
  - `isTokenExpired()`: Check if token is expired
  - `getUserFromToken()`: Extract user information from token

### 5. Dependencies Added

**Package: `jwt-decode`**
- Added JWT token decoding library to handle authentication tokens

## Backend API Endpoints Integration

Based on the API documentation, the following endpoints are now properly integrated:

### Authentication
- **POST `/login`**: Login with email and senha (password)
  - Request: `{ email: string, senha: string }`
  - Response: `{ accessToken: string }`
  - Token is stored and used in `accessToken` header for subsequent requests

### Posts
- **GET `/posts`**: Get all posts
- **GET `/posts?id={id}`**: Get specific post by ID
- **GET `/posts?search={term}`**: Search posts by term
- **POST `/posts`**: Create new post (author_id extracted from JWT token)
- **PUT `/posts/{id}`**: Update existing post
- **DELETE `/posts/{id}`**: Delete post

## Token Flow

1. **Login**: User provides email/password → Backend returns JWT access token
2. **Token Storage**: Access token stored in AsyncStorage
3. **Token Usage**: Token sent in `accessToken` header for all authenticated requests
4. **Token Validation**: Token expiration checked before each request
5. **User Info**: User information extracted from JWT token payload

## Data Flow Example

### Login Process:
```typescript
// User input
{ email: "user@example.com", password: "123456" }

// Sent to backend
{ email: "user@example.com", senha: "123456" }

// Backend response
{ accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }

// Token decoded to extract user info
{ userId: 1, email: "user@example.com", role: "teacher", exp: 1234567890 }
```

### Create Post Process:
```typescript
// User input
{ title: "My Post", content: "Post content", author_id: 5 }

// Sent to backend (with author_id from token)
{ title: "My Post", content: "Post content", author_id: 1 }

// Backend response
{ id: 123, title: "My Post", content: "Post content", author_id: 1}
```

## Testing Recommendations

### 1. Authentication Testing
- Test login with valid credentials
- Test login with invalid credentials
- Test token expiration handling
- Test automatic logout on 401 responses

### 2. Posts API Testing
- Test fetching all posts
- Test fetching single post by ID
- Test searching posts
- Test creating new posts
- Test updating existing posts
- Test deleting posts

### 3. Error Handling Testing
- Test network connectivity issues
- Test server error responses
- Test malformed responses
- Test token expiration scenarios

## Known Limitations

1. **Teachers/Students API**: The current implementation assumes these endpoints exist but they may not be implemented in the backend yet
2. **User Profile**: User information is extracted from JWT token, but there's no separate user profile endpoint
3. **Pagination**: Posts pagination is handled client-side, backend may support server-side pagination
4. **File Uploads**: No file upload functionality implemented yet

## Next Steps

1. **Test Integration**: Run the app and test all API endpoints with the backend server
2. **Error Handling**: Refine error messages and handling based on actual backend responses
3. **User Experience**: Update UI components to handle the new data structure
4. **Additional Features**: Implement any missing features like user profiles, file uploads, etc.

## Backend Server Requirements

Make sure the backend server is running on `http://localhost:3001` with the following endpoints available:
- POST `/api/login`
- GET `/api/posts`
- POST `/api/posts`
- PUT `/api/posts/{id}`
- DELETE `/api/posts/{id}`

The server should accept `accessToken` header for authentication and return JWT tokens on login.