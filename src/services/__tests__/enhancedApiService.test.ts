import { enhancedApiService } from '../enhancedApiService';
import { apiService } from '../apiService';
import { RetryService } from '../retryService';
import { Post, Teacher, Student } from '../../types';

// Mock the dependencies
jest.mock('../apiService');
jest.mock('../retryService');

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockRetryService = RetryService as jest.Mocked<typeof RetryService>;

describe('EnhancedApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Posts API with retry', () => {
    const mockPost: Post = {
      id: 1,
      title: 'Test Post',
      content: 'Test Content',
      author: 'Test Author',
      createdAt: '2023-01-01T00:00:00Z',
    };

    it('should retry getPosts', async () => {
      const mockPosts = [mockPost];
      mockRetryService.withRetry.mockResolvedValue(mockPosts);

      const result = await enhancedApiService.getPosts();

      expect(result).toEqual(mockPosts);
      expect(mockRetryService.withRetry).toHaveBeenCalledWith(
        expect.any(Function)
      );
      
      // Test that the function passed to withRetry calls apiService.getPosts
      const retryFunction = mockRetryService.withRetry.mock.calls[0][0];
      mockApiService.getPosts.mockResolvedValue(mockPosts);
      await retryFunction();
      expect(mockApiService.getPosts).toHaveBeenCalled();
    });

    it('should retry getPost', async () => {
      mockRetryService.withRetry.mockResolvedValue(mockPost);

      const result = await enhancedApiService.getPost(1);

      expect(result).toEqual(mockPost);
      expect(mockRetryService.withRetry).toHaveBeenCalledWith(
        expect.any(Function)
      );

      // Test that the function passed to withRetry calls apiService.getPost
      const retryFunction = mockRetryService.withRetry.mock.calls[0][0];
      mockApiService.getPost.mockResolvedValue(mockPost);
      await retryFunction();
      expect(mockApiService.getPost).toHaveBeenCalledWith(1);
    });

    it('should retry searchPosts', async () => {
      const searchResults = [mockPost];
      mockRetryService.withRetry.mockResolvedValue(searchResults);

      const result = await enhancedApiService.searchPosts('test');

      expect(result).toEqual(searchResults);
      expect(mockRetryService.withRetry).toHaveBeenCalledWith(
        expect.any(Function)
      );

      // Test that the function passed to withRetry calls apiService.searchPosts
      const retryFunction = mockRetryService.withRetry.mock.calls[0][0];
      mockApiService.searchPosts.mockResolvedValue(searchResults);
      await retryFunction();
      expect(mockApiService.searchPosts).toHaveBeenCalledWith('test');
    });

    it('should NOT retry createPost to avoid duplicates', async () => {
      const newPost = {
        title: 'New Post',
        content: 'New Content',
        author: 'New Author',
      };
      mockApiService.createPost.mockResolvedValue(mockPost);

      const result = await enhancedApiService.createPost(newPost);

      expect(result).toEqual(mockPost);
      expect(mockApiService.createPost).toHaveBeenCalledWith(newPost);
      expect(mockRetryService.withRetry).not.toHaveBeenCalled();
    });

    it('should retry updatePost', async () => {
      const updateData = { title: 'Updated Title' };
      const updatedPost = { ...mockPost, ...updateData };
      mockRetryService.withRetry.mockResolvedValue(updatedPost);

      const result = await enhancedApiService.updatePost(1, updateData);

      expect(result).toEqual(updatedPost);
      expect(mockRetryService.withRetry).toHaveBeenCalledWith(
        expect.any(Function)
      );

      // Test that the function passed to withRetry calls apiService.updatePost
      const retryFunction = mockRetryService.withRetry.mock.calls[0][0];
      mockApiService.updatePost.mockResolvedValue(updatedPost);
      await retryFunction();
      expect(mockApiService.updatePost).toHaveBeenCalledWith(1, updateData);
    });

    it('should retry deletePost', async () => {
      mockRetryService.withRetry.mockResolvedValue(undefined);

      await enhancedApiService.deletePost(1);

      expect(mockRetryService.withRetry).toHaveBeenCalledWith(
        expect.any(Function)
      );

      // Test that the function passed to withRetry calls apiService.deletePost
      const retryFunction = mockRetryService.withRetry.mock.calls[0][0];
      mockApiService.deletePost.mockResolvedValue();
      await retryFunction();
      expect(mockApiService.deletePost).toHaveBeenCalledWith(1);
    });
  });

  describe('Authentication API', () => {
    it('should NOT retry login to avoid account lockout', async () => {
      const credentials = { email: 'test@test.com', password: 'password' };
      const authResponse = {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@test.com',
          role: 'teacher' as const,
          token: 'test-token',
        },
        token: 'test-token',
      };
      mockApiService.login.mockResolvedValue(authResponse);

      const result = await enhancedApiService.login(credentials);

      expect(result).toEqual(authResponse);
      expect(mockApiService.login).toHaveBeenCalledWith(credentials);
      expect(mockRetryService.withRetry).not.toHaveBeenCalled();
    });

    it('should retry logout', async () => {
      mockRetryService.withRetry.mockResolvedValue(undefined);

      await enhancedApiService.logout();

      expect(mockRetryService.withRetry).toHaveBeenCalledWith(
        expect.any(Function)
      );

      // Test that the function passed to withRetry calls apiService.logout
      const retryFunction = mockRetryService.withRetry.mock.calls[0][0];
      mockApiService.logout.mockResolvedValue();
      await retryFunction();
      expect(mockApiService.logout).toHaveBeenCalled();
    });
  });

  describe('Teachers API with retry', () => {
    const mockTeacher: Teacher = {
      id: 1,
      name: 'John Doe',
      email: 'john@test.com',
      role: 'teacher',
      department: 'Computer Science',
      createdAt: '2023-01-01T00:00:00Z',
    };

    const mockPaginatedResponse = {
      data: [mockTeacher],
      currentPage: 1,
      totalPages: 1,
      totalItems: 1,
    };

    it('should retry getTeachers', async () => {
      mockRetryService.withRetry.mockResolvedValue(mockPaginatedResponse);

      const result = await enhancedApiService.getTeachers(1);

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockRetryService.withRetry).toHaveBeenCalledWith(
        expect.any(Function)
      );

      // Test that the function passed to withRetry calls apiService.getTeachers
      const retryFunction = mockRetryService.withRetry.mock.calls[0][0];
      mockApiService.getTeachers.mockResolvedValue(mockPaginatedResponse);
      await retryFunction();
      expect(mockApiService.getTeachers).toHaveBeenCalledWith(1);
    });

    it('should NOT retry createTeacher to avoid duplicates', async () => {
      const newTeacher = {
        name: 'Jane Smith',
        email: 'jane@test.com',
        password: 'password',
        department: 'Mathematics',
      };
      mockApiService.createTeacher.mockResolvedValue(mockTeacher);

      const result = await enhancedApiService.createTeacher(newTeacher);

      expect(result).toEqual(mockTeacher);
      expect(mockApiService.createTeacher).toHaveBeenCalledWith(newTeacher);
      expect(mockRetryService.withRetry).not.toHaveBeenCalled();
    });

    it('should retry updateTeacher', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedTeacher = { ...mockTeacher, ...updateData };
      mockRetryService.withRetry.mockResolvedValue(updatedTeacher);

      const result = await enhancedApiService.updateTeacher(1, updateData);

      expect(result).toEqual(updatedTeacher);
      expect(mockRetryService.withRetry).toHaveBeenCalledWith(
        expect.any(Function)
      );

      // Test that the function passed to withRetry calls apiService.updateTeacher
      const retryFunction = mockRetryService.withRetry.mock.calls[0][0];
      mockApiService.updateTeacher.mockResolvedValue(updatedTeacher);
      await retryFunction();
      expect(mockApiService.updateTeacher).toHaveBeenCalledWith(1, updateData);
    });

    it('should retry deleteTeacher', async () => {
      mockRetryService.withRetry.mockResolvedValue(undefined);

      await enhancedApiService.deleteTeacher(1);

      expect(mockRetryService.withRetry).toHaveBeenCalledWith(
        expect.any(Function)
      );

      // Test that the function passed to withRetry calls apiService.deleteTeacher
      const retryFunction = mockRetryService.withRetry.mock.calls[0][0];
      mockApiService.deleteTeacher.mockResolvedValue();
      await retryFunction();
      expect(mockApiService.deleteTeacher).toHaveBeenCalledWith(1);
    });
  });

  describe('Students API with retry', () => {
    const mockStudent: Student = {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@test.com',
      role: 'student',
      studentId: 'STU001',
      createdAt: '2023-01-01T00:00:00Z',
    };

    const mockPaginatedResponse = {
      data: [mockStudent],
      currentPage: 1,
      totalPages: 1,
      totalItems: 1,
    };

    it('should retry getStudents', async () => {
      mockRetryService.withRetry.mockResolvedValue(mockPaginatedResponse);

      const result = await enhancedApiService.getStudents(1);

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockRetryService.withRetry).toHaveBeenCalledWith(
        expect.any(Function)
      );

      // Test that the function passed to withRetry calls apiService.getStudents
      const retryFunction = mockRetryService.withRetry.mock.calls[0][0];
      mockApiService.getStudents.mockResolvedValue(mockPaginatedResponse);
      await retryFunction();
      expect(mockApiService.getStudents).toHaveBeenCalledWith(1);
    });

    it('should NOT retry createStudent to avoid duplicates', async () => {
      const newStudent = {
        name: 'Bob Wilson',
        email: 'bob@test.com',
        password: 'password',
        studentId: 'STU002',
      };
      mockApiService.createStudent.mockResolvedValue(mockStudent);

      const result = await enhancedApiService.createStudent(newStudent);

      expect(result).toEqual(mockStudent);
      expect(mockApiService.createStudent).toHaveBeenCalledWith(newStudent);
      expect(mockRetryService.withRetry).not.toHaveBeenCalled();
    });

    it('should retry updateStudent', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedStudent = { ...mockStudent, ...updateData };
      mockRetryService.withRetry.mockResolvedValue(updatedStudent);

      const result = await enhancedApiService.updateStudent(1, updateData);

      expect(result).toEqual(updatedStudent);
      expect(mockRetryService.withRetry).toHaveBeenCalledWith(
        expect.any(Function)
      );

      // Test that the function passed to withRetry calls apiService.updateStudent
      const retryFunction = mockRetryService.withRetry.mock.calls[0][0];
      mockApiService.updateStudent.mockResolvedValue(updatedStudent);
      await retryFunction();
      expect(mockApiService.updateStudent).toHaveBeenCalledWith(1, updateData);
    });

    it('should retry deleteStudent', async () => {
      mockRetryService.withRetry.mockResolvedValue(undefined);

      await enhancedApiService.deleteStudent(1);

      expect(mockRetryService.withRetry).toHaveBeenCalledWith(
        expect.any(Function)
      );

      // Test that the function passed to withRetry calls apiService.deleteStudent
      const retryFunction = mockRetryService.withRetry.mock.calls[0][0];
      mockApiService.deleteStudent.mockResolvedValue();
      await retryFunction();
      expect(mockApiService.deleteStudent).toHaveBeenCalledWith(1);
    });
  });
});