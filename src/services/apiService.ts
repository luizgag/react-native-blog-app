import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ApiService,
  ApiError,
  Post,
  Teacher,
  Student,
  AuthResponse,
  LoginRequest,
  CreatePostRequest,
  UpdatePostRequest,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  CreateStudentRequest,
  UpdateStudentRequest,
  PaginatedResponse,
} from '../types';
import { API_CONFIG, STORAGE_KEYS } from '../config';
import { decodeToken, isTokenExpired, getUserFromToken } from '../utils/jwt';

class BlogApiService implements ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
          if (token) {
            // Check if token is expired before using it
            if (isTokenExpired(token)) {
              await this.clearAuthData();
              throw new Error('Token expired');
            }
            // Use accessToken header as specified in API documentation
            config.headers.accessToken = token;
          }
        } catch (error) {
          console.warn('Failed to get auth token from storage:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        // Handle token expiration
        if (error.response?.status === 401) {
          await this.clearAuthData();
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as any;
      return {
        message: responseData?.message || 'Server error occurred',
        status: error.response.status,
        code: responseData?.code,
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error - please check your connection',
        code: 'NETWORK_ERROR',
      };
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      };
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA]);
    } catch (error) {
      console.warn('Failed to clear auth data:', error);
    }
  }

  // Posts API methods
  async getPosts(): Promise<Post[]> {
    const response = await this.client.get<Post[]>('/posts');
    return response.data;
  }

  async getPost(id: number): Promise<Post> {
    const response = await this.client.get<Post[]>(`/posts?id=${id}`);
    // Backend returns array, get first item
    return response.data[0] || null;
  }

  async searchPosts(term: string): Promise<Post[]> {
    const response = await this.client.get<Post[]>(`/posts?search=${encodeURIComponent(term)}`);
    return response.data;
  }

  async createPost(post: CreatePostRequest): Promise<Post> {
    // Get current user ID from stored token
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userFromToken = token ? getUserFromToken(token) : null;
    
    // Prepare post data with author_id from token
    const postData = {
      ...post,
      author: userFromToken?.id || post.author // Use author_id from token or fallback to provided author
    };

    const response = await this.client.post<Post>('/posts', postData);
    return response.data;
  }

  async updatePost(id: number, post: UpdatePostRequest): Promise<Post> {
    const response = await this.client.put<Post>(`/posts/${id}`, post);
    return response.data;
  }

  async deletePost(id: number): Promise<void> {
    await this.client.delete(`/posts/${id}`);
  }

  // Authentication API methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Transform credentials to match backend API format
    const loginData = {
      email: credentials.email,
      senha: credentials.password // Backend expects 'senha' instead of 'password'
    };

    const response = await this.client.post<{ accessToken: string }>('/login', loginData);

    // Store auth token (backend returns accessToken)
    const { accessToken } = response.data;
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);

    // Decode JWT token to extract user information
    const userFromToken = getUserFromToken(accessToken);
    
    // Create AuthResponse format for compatibility
    const authResponse: AuthResponse = {
      user: {
        id: userFromToken?.id || 0,
        name: userFromToken?.email || credentials.email,
        email: userFromToken?.email || credentials.email,
        role: (userFromToken?.role as 'teacher' | 'student') || 'teacher',
        token: accessToken
      },
      token: accessToken
    };

    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authResponse.user));

    return authResponse;
  }

  async logout(): Promise<void> {
    // Backend doesn't have a logout endpoint, just clear local data
    await this.clearAuthData();
  }

  // Teachers API methods (assumed endpoints)
  async getTeachers(page: number = 1): Promise<PaginatedResponse<Teacher>> {
    const response = await this.client.get<PaginatedResponse<Teacher>>('/teachers', {
      params: { page },
    });
    return response.data;
  }

  async createTeacher(teacher: CreateTeacherRequest): Promise<Teacher> {
    const response = await this.client.post<Teacher>('/teachers', teacher);
    return response.data;
  }

  async updateTeacher(id: number, teacher: UpdateTeacherRequest): Promise<Teacher> {
    const response = await this.client.put<Teacher>(`/teachers/${id}`, teacher);
    return response.data;
  }

  async deleteTeacher(id: number): Promise<void> {
    await this.client.delete(`/teachers/${id}`);
  }

  // Students API methods (assumed endpoints)
  async getStudents(page: number = 1): Promise<PaginatedResponse<Student>> {
    const response = await this.client.get<PaginatedResponse<Student>>('/students', {
      params: { page },
    });
    return response.data;
  }

  async createStudent(student: CreateStudentRequest): Promise<Student> {
    const response = await this.client.post<Student>('/students', student);
    return response.data;
  }

  async updateStudent(id: number, student: UpdateStudentRequest): Promise<Student> {
    const response = await this.client.put<Student>(`/students/${id}`, student);
    return response.data;
  }

  async deleteStudent(id: number): Promise<void> {
    await this.client.delete(`/students/${id}`);
  }
}

// Export singleton instance
export const apiService = new BlogApiService();
export default apiService;

// Re-export enhanced API service for components that need retry functionality
export { enhancedApiService } from './enhancedApiService';