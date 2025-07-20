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
            config.headers.Authorization = `Bearer ${token}`;
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
    const response = await this.client.get<Post>(`/posts/${id}`);
    return response.data;
  }

  async searchPosts(term: string): Promise<Post[]> {
    const response = await this.client.get<Post[]>('/posts/search', {
      params: { q: term },
    });
    return response.data;
  }

  async createPost(post: CreatePostRequest): Promise<Post> {
    const response = await this.client.post<Post>('/posts', post);
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
    const response = await this.client.post<AuthResponse>('/auth/login', credentials);

    // Store auth data
    const { user, token } = response.data;
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if server call fails
      console.warn('Logout API call failed:', error);
    } finally {
      await this.clearAuthData();
    }
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