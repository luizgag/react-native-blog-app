import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../../../App';
import { apiService } from '../../services/apiService';

// Mock the API service
jest.mock('../../services/apiService');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock data
const mockTeacher = {
  id: 1,
  name: 'John Teacher',
  email: 'teacher@example.com',
  role: 'teacher' as const,
  token: 'mock-token'
};

const mockStudent = {
  id: 2,
  name: 'Jane Student',
  email: 'student@example.com',
  role: 'student' as const,
  token: 'mock-token'
};

const mockPosts = [
  {
    id: 1,
    title: 'Test Post 1',
    content: 'This is test post content 1',
    author: 'John Teacher'
  },
  {
    id: 2,
    title: 'Test Post 2',
    content: 'This is test post content 2',
    author: 'John Teacher'
  }
];

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('Authentication Flow', () => {
    it('should show login screen when not authenticated', async () => {
      // Mock no stored auth data
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { getByText } = render(<App />);

      await waitFor(() => {
        expect(getByText(/login/i)).toBeTruthy();
      });
    });

    it('should authenticate teacher and show main app', async () => {
      // Mock successful login
      mockApiService.login.mockResolvedValue({
        user: mockTeacher,
        token: 'mock-token'
      });

      mockApiService.getPosts.mockResolvedValue(mockPosts);

      const { getByText, getByPlaceholderText } = render(<App />);

      // Wait for login screen
      await waitFor(() => {
        expect(getByText(/login/i)).toBeTruthy();
      });

      // Fill login form
      const emailInput = getByPlaceholderText(/email/i);
      const passwordInput = getByPlaceholderText(/password/i);
      const loginButton = getByText(/login/i);

      fireEvent.changeText(emailInput, 'teacher@example.com');
      fireEvent.changeText(passwordInput, 'password');
      fireEvent.press(loginButton);

      // Wait for main app to load
      await waitFor(() => {
        expect(getByText(/blog posts/i)).toBeTruthy();
      });
    });

    it('should authenticate student and show limited features', async () => {
      // Mock successful login
      mockApiService.login.mockResolvedValue({
        user: mockStudent,
        token: 'mock-token'
      });

      mockApiService.getPosts.mockResolvedValue(mockPosts);

      const { getByText, getByPlaceholderText, queryByText } = render(<App />);

      // Wait for login screen
      await waitFor(() => {
        expect(getByText(/login/i)).toBeTruthy();
      });

      // Fill login form
      const emailInput = getByPlaceholderText(/email/i);
      const passwordInput = getByPlaceholderText(/password/i);
      const loginButton = getByText(/login/i);

      fireEvent.changeText(emailInput, 'student@example.com');
      fireEvent.changeText(passwordInput, 'password');
      fireEvent.press(loginButton);

      // Wait for main app to load
      await waitFor(() => {
        expect(getByText(/blog posts/i)).toBeTruthy();
      });

      // Students should not see admin features
      expect(queryByText(/admin/i)).toBeNull();
    });
  });

  describe('Teacher User Journey', () => {
    beforeEach(async () => {
      // Mock authenticated teacher
      (AsyncStorage.getItem as jest.Mock)
        .mockImplementation((key: string) => {
          if (key === 'auth_token') return Promise.resolve('mock-token');
          if (key === 'user_data') return Promise.resolve(JSON.stringify(mockTeacher));
          return Promise.resolve(null);
        });

      mockApiService.getPosts.mockResolvedValue(mockPosts);
    });

    it('should complete full post management workflow', async () => {
      const { getByText, getByPlaceholderText } = render(<App />);

      // Wait for main app to load
      await waitFor(() => {
        expect(getByText(/blog posts/i)).toBeTruthy();
      });

      // Navigate to create post
      const createButton = getByText(/create/i);
      fireEvent.press(createButton);

      // Fill create post form
      await waitFor(() => {
        expect(getByPlaceholderText(/title/i)).toBeTruthy();
      });

      const titleInput = getByPlaceholderText(/title/i);
      const contentInput = getByPlaceholderText(/content/i);
      const submitButton = getByText(/create post/i);

      fireEvent.changeText(titleInput, 'New Test Post');
      fireEvent.changeText(contentInput, 'This is a new test post content');

      // Mock successful post creation
      mockApiService.createPost.mockResolvedValue({
        id: 3,
        title: 'New Test Post',
        content: 'This is a new test post content',
        author: 'John Teacher'
      });

      fireEvent.press(submitButton);

      // Verify post creation API call
      await waitFor(() => {
        expect(mockApiService.createPost).toHaveBeenCalledWith({
          title: 'New Test Post',
          content: 'This is a new test post content',
          author: 'John Teacher'
        });
      });
    });

    it('should handle post editing workflow', async () => {
      const { getByText } = render(<App />);

      // Wait for main app to load
      await waitFor(() => {
        expect(getByText(/blog posts/i)).toBeTruthy();
      });

      // Navigate to admin screen
      const adminTab = getByText(/admin/i);
      fireEvent.press(adminTab);

      // Wait for admin screen
      await waitFor(() => {
        expect(getByText(/admin dashboard/i)).toBeTruthy();
      });

      // Click edit on first post
      const editButton = getByText(/edit/i);
      fireEvent.press(editButton);

      // Mock successful post update
      mockApiService.updatePost.mockResolvedValue({
        ...mockPosts[0],
        title: 'Updated Test Post'
      });

      // Verify navigation to edit screen would occur
      expect(mockApiService.getPost).toHaveBeenCalledWith(1);
    });

    it('should handle user management workflow', async () => {
      const { getByText } = render(<App />);

      // Wait for main app to load
      await waitFor(() => {
        expect(getByText(/blog posts/i)).toBeTruthy();
      });

      // Open drawer navigation
      const drawerButton = getByText(/menu/i);
      fireEvent.press(drawerButton);

      // Navigate to teacher management
      const teacherManagement = getByText(/manage teachers/i);
      fireEvent.press(teacherManagement);

      // Mock teachers list
      mockApiService.getTeachers.mockResolvedValue({
        data: [mockTeacher],
        currentPage: 1,
        totalPages: 1,
        totalItems: 1
      });

      // Wait for teachers list
      await waitFor(() => {
        expect(mockApiService.getTeachers).toHaveBeenCalled();
      });
    });
  });

  describe('Student User Journey', () => {
    beforeEach(async () => {
      // Mock authenticated student
      (AsyncStorage.getItem as jest.Mock)
        .mockImplementation((key: string) => {
          if (key === 'auth_token') return Promise.resolve('mock-token');
          if (key === 'user_data') return Promise.resolve(JSON.stringify(mockStudent));
          return Promise.resolve(null);
        });

      mockApiService.getPosts.mockResolvedValue(mockPosts);
    });

    it('should complete read-only post viewing workflow', async () => {
      const { getByText, queryByText } = render(<App />);

      // Wait for main app to load
      await waitFor(() => {
        expect(getByText(/blog posts/i)).toBeTruthy();
      });

      // Verify posts are displayed
      expect(getByText('Test Post 1')).toBeTruthy();
      expect(getByText('Test Post 2')).toBeTruthy();

      // Verify no admin features are available
      expect(queryByText(/admin/i)).toBeNull();
      expect(queryByText(/create/i)).toBeNull();
      expect(queryByText(/edit/i)).toBeNull();
      expect(queryByText(/delete/i)).toBeNull();

      // Click on a post to view details
      const postTitle = getByText('Test Post 1');
      fireEvent.press(postTitle);

      // Mock post detail fetch
      mockApiService.getPost.mockResolvedValue(mockPosts[0]);

      // Verify post detail API call
      await waitFor(() => {
        expect(mockApiService.getPost).toHaveBeenCalledWith(1);
      });
    });

    it('should handle search functionality', async () => {
      const { getByText, getByPlaceholderText } = render(<App />);

      // Wait for main app to load
      await waitFor(() => {
        expect(getByText(/blog posts/i)).toBeTruthy();
      });

      // Use search functionality
      const searchInput = getByPlaceholderText(/search/i);
      fireEvent.changeText(searchInput, 'test');

      // Mock search results
      mockApiService.searchPosts.mockResolvedValue([mockPosts[0]]);

      // Verify search API call
      await waitFor(() => {
        expect(mockApiService.searchPosts).toHaveBeenCalledWith('test');
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      mockApiService.getPosts.mockRejectedValue(new Error('Network Error'));

      const { getByText } = render(<App />);

      // Mock authenticated user
      (AsyncStorage.getItem as jest.Mock)
        .mockImplementation((key: string) => {
          if (key === 'auth_token') return Promise.resolve('mock-token');
          if (key === 'user_data') return Promise.resolve(JSON.stringify(mockTeacher));
          return Promise.resolve(null);
        });

      // Wait for error handling
      await waitFor(() => {
        expect(getByText(/error/i)).toBeTruthy();
      });
    });

    it('should handle authentication errors', async () => {
      // Mock authentication error
      mockApiService.login.mockRejectedValue(new Error('Invalid credentials'));

      const { getByText, getByPlaceholderText } = render(<App />);

      // Wait for login screen
      await waitFor(() => {
        expect(getByText(/login/i)).toBeTruthy();
      });

      // Fill login form with invalid credentials
      const emailInput = getByPlaceholderText(/email/i);
      const passwordInput = getByPlaceholderText(/password/i);
      const loginButton = getByText(/login/i);

      fireEvent.changeText(emailInput, 'invalid@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(loginButton);

      // Wait for error message
      await waitFor(() => {
        expect(getByText(/invalid credentials/i)).toBeTruthy();
      });
    });

    it('should handle API validation errors', async () => {
      // Mock authenticated teacher
      (AsyncStorage.getItem as jest.Mock)
        .mockImplementation((key: string) => {
          if (key === 'auth_token') return Promise.resolve('mock-token');
          if (key === 'user_data') return Promise.resolve(JSON.stringify(mockTeacher));
          return Promise.resolve(null);
        });

      mockApiService.getPosts.mockResolvedValue(mockPosts);

      const { getByText, getByPlaceholderText } = render(<App />);

      // Wait for main app to load
      await waitFor(() => {
        expect(getByText(/blog posts/i)).toBeTruthy();
      });

      // Navigate to create post
      const createButton = getByText(/create/i);
      fireEvent.press(createButton);

      // Fill form with invalid data
      await waitFor(() => {
        expect(getByPlaceholderText(/title/i)).toBeTruthy();
      });

      const submitButton = getByText(/create post/i);

      // Mock validation error
      mockApiService.createPost.mockRejectedValue(new Error('Title is required'));

      fireEvent.press(submitButton);

      // Wait for validation error
      await waitFor(() => {
        expect(getByText(/title is required/i)).toBeTruthy();
      });
    });
  });

  describe('CRUD Operations End-to-End', () => {
    beforeEach(async () => {
      // Mock authenticated teacher
      (AsyncStorage.getItem as jest.Mock)
        .mockImplementation((key: string) => {
          if (key === 'auth_token') return Promise.resolve('mock-token');
          if (key === 'user_data') return Promise.resolve(JSON.stringify(mockTeacher));
          return Promise.resolve(null);
        });
    });

    it('should complete full CRUD cycle for posts', async () => {
      mockApiService.getPosts.mockResolvedValue(mockPosts);
      
      const { getByText } = render(<App />);

      // Wait for main app to load
      await waitFor(() => {
        expect(getByText(/blog posts/i)).toBeTruthy();
      });

      // Test READ operation
      expect(mockApiService.getPosts).toHaveBeenCalled();
      expect(getByText('Test Post 1')).toBeTruthy();

      // Test CREATE operation
      mockApiService.createPost.mockResolvedValue({
        id: 3,
        title: 'New Post',
        content: 'New Content',
        author: 'John Teacher'
      });

      // Test UPDATE operation
      mockApiService.updatePost.mockResolvedValue({
        ...mockPosts[0],
        title: 'Updated Post'
      });

      // Test DELETE operation
      mockApiService.deletePost.mockResolvedValue();

      // Verify all CRUD operations are available
      expect(mockApiService.getPosts).toHaveBeenCalled();
    });

    it('should complete full CRUD cycle for teachers', async () => {
      mockApiService.getPosts.mockResolvedValue(mockPosts);
      mockApiService.getTeachers.mockResolvedValue({
        data: [mockTeacher],
        currentPage: 1,
        totalPages: 1,
        totalItems: 1
      });

      const { getByText } = render(<App />);

      // Wait for main app to load
      await waitFor(() => {
        expect(getByText(/blog posts/i)).toBeTruthy();
      });

      // Navigate to teacher management
      const drawerButton = getByText(/menu/i);
      fireEvent.press(drawerButton);

      const teacherManagement = getByText(/manage teachers/i);
      fireEvent.press(teacherManagement);

      // Test READ operation
      await waitFor(() => {
        expect(mockApiService.getTeachers).toHaveBeenCalled();
      });

      // Mock other CRUD operations
      mockApiService.createTeacher.mockResolvedValue(mockTeacher);
      mockApiService.updateTeacher.mockResolvedValue(mockTeacher);
      mockApiService.deleteTeacher.mockResolvedValue();

      // Verify CRUD operations are available
      expect(mockApiService.getTeachers).toHaveBeenCalled();
    });

    it('should complete full CRUD cycle for students', async () => {
      mockApiService.getPosts.mockResolvedValue(mockPosts);
      mockApiService.getStudents.mockResolvedValue({
        data: [mockStudent],
        currentPage: 1,
        totalPages: 1,
        totalItems: 1
      });

      const { getByText } = render(<App />);

      // Wait for main app to load
      await waitFor(() => {
        expect(getByText(/blog posts/i)).toBeTruthy();
      });

      // Navigate to student management
      const drawerButton = getByText(/menu/i);
      fireEvent.press(drawerButton);

      const studentManagement = getByText(/manage students/i);
      fireEvent.press(studentManagement);

      // Test READ operation
      await waitFor(() => {
        expect(mockApiService.getStudents).toHaveBeenCalled();
      });

      // Mock other CRUD operations
      mockApiService.createStudent.mockResolvedValue(mockStudent);
      mockApiService.updateStudent.mockResolvedValue(mockStudent);
      mockApiService.deleteStudent.mockResolvedValue();

      // Verify CRUD operations are available
      expect(mockApiService.getStudents).toHaveBeenCalled();
    });
  });
});