import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ApiService,
  ApiError,
  Post,
  AuthResponse,
  LoginRequest,
  CreatePostRequest,
  UpdatePostRequest,
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
            // Use accesstoken header as specified in API documentation
            config.headers.accesstoken = token;
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
    const response = await this.client.get<Post[]>(`/posts/search/${encodeURIComponent(term)}`);
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

  // Comments API methods
  async getComments(postId: number): Promise<any[]> {
    const response = await this.client.get(`/posts/comentarios/${postId}`);
    return response.data;
  }

  async createComment(postId: number, comentario: string): Promise<any> {
    const response = await this.client.post('/posts/comentarios', {
      postId,
      comentario
    });
    return response.data;
  }

  async updateComment(id: number, comentario: string): Promise<any> {
    const response = await this.client.put(`/posts/comentarios/${id}`, {
      comentario
    });
    return response.data;
  }

  async deleteComment(id: number): Promise<void> {
    await this.client.delete(`/posts/comentarios/${id}`);
  }

  // Likes API methods
  async toggleLike(postId: number): Promise<any> {
    const response = await this.client.post('/posts/like', {
      postId
    });
    return response.data;
  }

  async getLikes(postId: number): Promise<any[]> {
    const response = await this.client.get(`/posts/like/${postId}`);
    return response.data;
  }

  async removeLike(postId: number): Promise<void> {
    await this.client.delete(`/posts/like/${postId}`);
  }

  // User API methods
  async getUser(id: number): Promise<any> {
    const response = await this.client.get(`/users/${id}`);
    return response.data;
  }

  // Registration method
  async register(userData: {
    nome: string;
    email: string;
    senha: string;
    tipo_usuario: 'professor' | 'aluno';
  }): Promise<any> {
    const response = await this.client.post('/register', userData);
    return response.data;
  }

  // Authentication API methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // LoginRequest now uses 'senha' to match backend API format
    const loginData = {
      email: credentials.email,
      senha: credentials.senha
    };

    const response = await this.client.post<{ accessToken: string }>('/login', loginData);

    // Store auth token (backend returns accessToken)
    const { accessToken } = response.data;
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);

    // Create AuthResponse format for compatibility
    const authResponse: AuthResponse = {
      user: {
        id: 1, // Will be updated when we have user info endpoint
        name: credentials.email,
        email: credentials.email,
        role: 'teacher', // Default role
        token: accessToken
      },
      token: accessToken
    };

    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authResponse.user));

    return authResponse;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/logout');
    } catch (error) {
      // Continue with logout even if server call fails
      console.warn('Logout API call failed:', error);
    } finally {
      await this.clearAuthData();
    }
  }


}

// Export singleton instance
export const apiService = new BlogApiService();
export default apiService;

// Re-export enhanced API service for components that need retry functionality
export { enhancedApiService } from './enhancedApiService';