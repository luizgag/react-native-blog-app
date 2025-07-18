import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../apiService';
import { API_CONFIG, STORAGE_KEYS } from '../../config';
import {
  Post,
  Teacher,
  Student,
  AuthResponse,
  PaginatedResponse,
} from '../../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('ApiService', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
  });

  beforeAll(() => {
    // Mock axios.create before any tests run
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
  });

  describe('Posts API', () => {
    const mockPosts: Post[] = [
      {
        id: 1,
        title: 'Test Post 1',
        content: 'Content 1',
        author: 'Author 1',
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        id: 2,
        title: 'Test Post 2',
        content: 'Content 2',
        author: 'Author 2',
        createdAt: '2023-01-02T00:00:00Z',
      },
    ];

    it('should fetch all posts', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockPosts });

      const result = await apiService.getPosts();

      expect(result).toEqual(mockPosts);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/posts');
    });

    it('should fetch a single post', async () => {
      const mockPost = mockPosts[0];
      mockAxiosInstance.get.mockResolvedValue({ data: mockPost });

      const result = await apiService.getPost(1);

      expect(result).toEqual(mockPost);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/posts/1');
    });

    it('should search posts', async () => {
      const searchResults = [mockPosts[0]];
      mockAxiosInstance.get.mockResolvedValue({ data: searchResults });

      const result = await apiService.searchPosts('test');

      expect(result).toEqual(searchResults);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/posts/search', {
        params: { q: 'test' },
      });
    });

    it('should create a post', async () => {
      const newPost = {
        title: 'New Post',
        content: 'New Content',
        author: 'New Author',
      };
      const createdPost: Post = {
        id: 3,
        ...newPost,
        createdAt: '2023-01-03T00:00:00Z',
      };
      mockAxiosInstance.post.mockResolvedValue({ data: createdPost });

      const result = await apiService.createPost(newPost);

      expect(result).toEqual(createdPost);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/posts', newPost);
    });

    it('should update a post', async () => {
      const updateData = { title: 'Updated Title' };
      const updatedPost: Post = {
        ...mockPosts[0],
        ...updateData,
      };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedPost });

      const result = await apiService.updatePost(1, updateData);

      expect(result).toEqual(updatedPost);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/posts/1', updateData);
    });

    it('should delete a post', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await apiService.deletePost(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/posts/1');
    });
  });

  describe('Authentication API', () => {
    it('should login successfully', async () => {
      const credentials = { email: 'test@test.com', password: 'password' };
      const authResponse: AuthResponse = {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@test.com',
          role: 'teacher',
          token: 'test-token',
        },
        token: 'test-token',
      };
      mockAxiosInstance.post.mockResolvedValue({ data: authResponse });

      const result = await apiService.login(credentials);

      expect(result).toEqual(authResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.AUTH_TOKEN,
        'test-token'
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(authResponse.user)
      );
    });

    it('should logout successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({});

      await apiService.logout();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/logout');
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    });

    it('should logout even if API call fails', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Network error'));

      await apiService.logout();

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    });
  });

  describe('Teachers API', () => {
    const mockTeacher: Teacher = {
      id: 1,
      name: 'John Doe',
      email: 'john@test.com',
      role: 'teacher',
      department: 'Computer Science',
      createdAt: '2023-01-01T00:00:00Z',
    };

    const mockPaginatedResponse: PaginatedResponse<Teacher> = {
      data: [mockTeacher],
      currentPage: 1,
      totalPages: 1,
      totalItems: 1,
    };

    it('should fetch teachers with pagination', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockPaginatedResponse });

      const result = await apiService.getTeachers(1);

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/teachers', {
        params: { page: 1 },
      });
    });

    it('should create a teacher', async () => {
      const newTeacher = {
        name: 'Jane Smith',
        email: 'jane@test.com',
        password: 'password',
        department: 'Mathematics',
      };
      mockAxiosInstance.post.mockResolvedValue({ data: mockTeacher });

      const result = await apiService.createTeacher(newTeacher);

      expect(result).toEqual(mockTeacher);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/teachers', newTeacher);
    });

    it('should update a teacher', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedTeacher = { ...mockTeacher, ...updateData };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedTeacher });

      const result = await apiService.updateTeacher(1, updateData);

      expect(result).toEqual(updatedTeacher);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/teachers/1', updateData);
    });

    it('should delete a teacher', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await apiService.deleteTeacher(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/teachers/1');
    });
  });

  describe('Students API', () => {
    const mockStudent: Student = {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@test.com',
      role: 'student',
      studentId: 'STU001',
      createdAt: '2023-01-01T00:00:00Z',
    };

    const mockPaginatedResponse: PaginatedResponse<Student> = {
      data: [mockStudent],
      currentPage: 1,
      totalPages: 1,
      totalItems: 1,
    };

    it('should fetch students with pagination', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockPaginatedResponse });

      const result = await apiService.getStudents(1);

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/students', {
        params: { page: 1 },
      });
    });

    it('should create a student', async () => {
      const newStudent = {
        name: 'Bob Wilson',
        email: 'bob@test.com',
        password: 'password',
        studentId: 'STU002',
      };
      mockAxiosInstance.post.mockResolvedValue({ data: mockStudent });

      const result = await apiService.createStudent(newStudent);

      expect(result).toEqual(mockStudent);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/students', newStudent);
    });

    it('should update a student', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedStudent = { ...mockStudent, ...updateData };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedStudent });

      const result = await apiService.updateStudent(1, updateData);

      expect(result).toEqual(updatedStudent);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/students/1', updateData);
    });

    it('should delete a student', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await apiService.deleteStudent(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/students/1');
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error', code: 'SERVER_ERROR' },
        },
      };
      mockAxiosInstance.get.mockRejectedValue(serverError);

      await expect(apiService.getPosts()).rejects.toEqual({
        message: 'Internal Server Error',
        status: 500,
        code: 'SERVER_ERROR',
      });
    });

    it('should handle network errors', async () => {
      const networkError = {
        request: {},
        message: 'Network Error',
      };
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(apiService.getPosts()).rejects.toEqual({
        message: 'Network error - please check your connection',
        code: 'NETWORK_ERROR',
      });
    });

    it('should handle unknown errors', async () => {
      const unknownError = {
        message: 'Unknown error',
      };
      mockAxiosInstance.get.mockRejectedValue(unknownError);

      await expect(apiService.getPosts()).rejects.toEqual({
        message: 'Unknown error',
        code: 'UNKNOWN_ERROR',
      });
    });

    it('should clear auth data on 401 error', async () => {
      const authError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      
      // Mock the response interceptor behavior
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      await expect(responseInterceptor(authError)).rejects.toBeDefined();
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    });
  });
});