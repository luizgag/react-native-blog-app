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
  RegisterRequest,
  CreatePostRequest,
  UpdatePostRequest,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  CreateStudentRequest,
  UpdateStudentRequest,
  PaginatedResponse,
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  Like,
} from '../types';
import { API_CONFIG, STORAGE_KEYS } from '../config';
import { decodeToken, isTokenExpired, getUserFromToken } from '../utils/jwt';

class BlogApiService implements ApiService {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

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
              // Try to refresh token before clearing auth data
              const refreshed = await this.refreshAccessToken();
              if (refreshed) {
                const newToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
                config.headers.accessToken = newToken;
              } else {
                await this.clearAuthData();
                throw new Error('Token expired and refresh failed');
              }
            } else {
              // Use accessToken header as specified in API documentation
              config.headers.accessToken = token;
            }
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

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 unauthorized errors with token refresh logic
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.accessToken = token;
              return this.client(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
              const newToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
              
              // Process queued requests
              this.processQueue(null, newToken);
              
              // Retry original request with new token
              originalRequest.headers.accessToken = newToken;
              return this.client(originalRequest);
            } else {
              // Refresh failed, clear auth data and reject queued requests
              this.processQueue(new Error('Token refresh failed'), null);
              await this.clearAuthData();
              return Promise.reject(this.handleError(error));
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            await this.clearAuthData();
            return Promise.reject(this.handleError(error));
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as any;
      const status = error.response.status;
      
      // Handle specific Portuguese error messages from API
      let message = responseData?.message || responseData?.error || 'Erro do servidor';
      
      // Handle specific error cases based on status and message content
      if (status === 401) {
        message = 'Credenciais inválidas ou sessão expirada';
      } else if (status === 403) {
        message = 'Acesso negado - permissões insuficientes';
      } else if (status === 422 || message.includes('Falha na validação')) {
        message = responseData?.message || 'Falha na validação dos dados';
      } else if (message.includes('Missing Param')) {
        message = 'Parâmetros obrigatórios não fornecidos';
      } else if (status >= 500) {
        message = 'Erro interno do servidor - tente novamente mais tarde';
      }
      
      return {
        message,
        status,
        code: responseData?.code,
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Erro de conexão - verifique sua internet',
        code: 'NETWORK_ERROR',
      };
    } else {
      // Other error
      return {
        message: error.message || 'Erro inesperado',
        code: 'UNKNOWN_ERROR',
      };
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN, 
        STORAGE_KEYS.REFRESH_TOKEN, 
        STORAGE_KEYS.USER_DATA
      ]);
    } catch (error) {
      console.warn('Failed to clear auth data:', error);
    }
  }

  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        console.warn('No refresh token available');
        return false;
      }

      // Note: Since the backend API documentation doesn't specify a refresh endpoint,
      // we'll implement a placeholder that can be updated when the actual endpoint is available
      // For now, we'll simulate the refresh token behavior
      
      // TODO: Replace with actual refresh endpoint when available
      // const response = await this.client.post('/auth/refresh', { refreshToken });
      
      // For now, return false to indicate refresh is not available
      // This will cause the app to redirect to login when tokens expire
      console.warn('Refresh token endpoint not implemented in backend API');
      return false;

      // When the refresh endpoint is available, uncomment and modify this code:
      /*
      const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
        refreshToken
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        // Don't use interceptors for refresh request to avoid infinite loops
        timeout: API_CONFIG.TIMEOUT,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      // Store new tokens
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
      if (newRefreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      }

      // Update user data with new token
      const userFromToken = getUserFromToken(accessToken);
      if (userFromToken) {
        const userData = {
          id: userFromToken.id,
          name: userFromToken.email,
          email: userFromToken.email,
          role: userFromToken.role as 'teacher' | 'student',
          token: accessToken
        };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      }

      return true;
      */
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return false;
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
    // Use the dedicated search endpoint as specified in API documentation
    const response = await this.client.get<Post[]>(`/posts/search/${encodeURIComponent(term)}`);
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

    const response = await this.client.post<{ accessToken: string; refreshToken?: string }>('/login', loginData);

    // Store auth token (backend returns accessToken)
    const { accessToken, refreshToken } = response.data;
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);

    // Store refresh token if provided (for future use when backend implements refresh endpoint)
    if (refreshToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }

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

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Use the /api/register endpoint as specified in API documentation
    const response = await this.client.post<{ accessToken: string; refreshToken?: string }>('/register', userData);

    // Store auth token (backend returns accessToken)
    const { accessToken, refreshToken } = response.data;
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);

    // Store refresh token if provided (for future use when backend implements refresh endpoint)
    if (refreshToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }

    // Decode JWT token to extract user information
    const userFromToken = getUserFromToken(accessToken);
    
    // Create AuthResponse format for compatibility
    const authResponse: AuthResponse = {
      user: {
        id: userFromToken?.id || 0,
        name: userFromToken?.email || userData.email,
        email: userFromToken?.email || userData.email,
        role: (userFromToken?.role as 'teacher' | 'student') || userData.tipo_usuario,
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

  // Comments API methods
  async getComments(postId: number): Promise<Comment[]> {
    const response = await this.client.get<Comment[]>(`/posts/${postId}/comments`);
    return response.data;
  }

  async createComment(comment: CreateCommentRequest): Promise<Comment> {
    const response = await this.client.post<Comment>(`/posts/${comment.post_id}/comments`, {
      content: comment.content
    });
    return response.data;
  }

  async updateComment(id: number, comment: UpdateCommentRequest): Promise<Comment> {
    const response = await this.client.put<Comment>(`/comments/${id}`, comment);
    return response.data;
  }

  async deleteComment(id: number): Promise<void> {
    await this.client.delete(`/comments/${id}`);
  }

  // Likes API methods
  async getLikes(postId: number): Promise<Like[]> {
    const response = await this.client.get<Like[]>(`/posts/${postId}/likes`);
    return response.data;
  }

  async toggleLike(postId: number): Promise<{ liked: boolean; count: number }> {
    const response = await this.client.post<{ liked: boolean; count: number }>(`/posts/${postId}/likes/toggle`);
    return response.data;
  }

  async removeLike(postId: number): Promise<void> {
    await this.client.delete(`/posts/${postId}/likes`);
  }
}

// Export singleton instance
export const apiService = new BlogApiService();
export default apiService;

// Re-export enhanced API service for components that need retry functionality
export { enhancedApiService } from './enhancedApiService';