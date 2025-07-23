import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RetryService } from './retryService';
import {
  ApiService,
  ApiError,
  Post,
  AuthResponse,
  LoginRequest,
  CreatePostRequest,
  UpdatePostRequest,
  Comment,
  Like,
  RegisterRequest,
} from '../types';
import { API_CONFIG, STORAGE_KEYS } from '../config';

class BlogApiService implements ApiService {
  private client: AxiosInstance;
  private currentBaseUrl: string;
  private isConnectivityTested: boolean = false;
  private onTokenExpired?: () => void;

  constructor() {
    this.currentBaseUrl = API_CONFIG.BASE_URL;
    this.client = this.createAxiosInstance(this.currentBaseUrl);
    this.setupInterceptors();
  }

  /**
   * Set callback to be called when token expires (401 error)
   */
  setTokenExpiredCallback(callback: () => void): void {
    this.onTokenExpired = callback;
  }

  private createAxiosInstance(baseURL: string): AxiosInstance {
    return axios.create({
      baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Test connectivity with different base URLs and select the working one
   */
  private async testConnectivity(): Promise<void> {
    if (this.isConnectivityTested) {
      return;
    }

    console.log('Testing API connectivity...');

    for (const baseUrl of API_CONFIG.FALLBACK_URLS) {
      try {
        const testClient = this.createAxiosInstance(baseUrl);

        // Test with a simple GET request with short timeout
        await testClient.get('/posts', {
          timeout: API_CONFIG.CONNECTION_TIMEOUT,
          // Don't include auth headers for connectivity test
          headers: { 'Content-Type': 'application/json' }
        });

        console.log(`✅ API connectivity successful with: ${baseUrl}`);

        // Update base URL if different from current
        if (baseUrl !== this.currentBaseUrl) {
          this.currentBaseUrl = baseUrl;
          this.client = this.createAxiosInstance(baseUrl);
          this.setupInterceptors();
          console.log(`🔄 Switched to working base URL: ${baseUrl}`);
        }

        this.isConnectivityTested = true;
        return;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorCode = (error as any)?.code || 'UNKNOWN';
        console.log(`❌ Failed to connect to: ${baseUrl}`, errorCode, errorMessage);
        continue;
      }
    }

    // If all URLs fail, keep the original but mark as tested to avoid repeated attempts
    this.isConnectivityTested = true;
    console.warn('⚠️ All API endpoints failed connectivity test. Using default URL.');
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token and test connectivity
    this.client.interceptors.request.use(
      async (config) => {
        try {
          // Test connectivity on first request
          await this.testConnectivity();

          const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
          if (token) {
            // Use accesstoken header as specified in API documentation
            config.headers.accesstoken = token;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.warn('Failed to get auth token from storage:', errorMessage);
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
          // Notify about token expiration to trigger redirect to login
          if (this.onTokenExpired) {
            this.onTokenExpired();
          }
        }

        // Handle network connectivity issues
        if (this.isNetworkError(error)) {
          // Reset connectivity test flag to retry on next request
          this.isConnectivityTested = false;
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private isNetworkError(error: AxiosError): boolean {
    return (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNABORTED' ||
      error.message.includes('timeout') ||
      error.message.includes('Network Error')
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as any;
      const serverMessage = responseData?.message || responseData?.error || 'Server error occurred';

      return {
        message: this.translatePortugueseError(serverMessage),
        status: error.response.status,
        code: responseData?.code || `HTTP_${error.response.status}`,
      };
    } else if (error.request) {
      // Network error - provide specific error messages based on error type
      if (error.code === 'ECONNREFUSED') {
        return {
          message: 'Unable to connect to server. Please check if the server is running.',
          code: 'CONNECTION_REFUSED',
        };
      } else if (error.code === 'ENOTFOUND') {
        return {
          message: 'Server not found. Please check your network connection.',
          code: 'HOST_NOT_FOUND',
        };
      } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        return {
          message: 'Request timed out. Please check your internet connection and try again.',
          code: 'TIMEOUT_ERROR',
        };
      } else if (error.code === 'ECONNABORTED') {
        return {
          message: 'Request was cancelled. Please try again.',
          code: 'REQUEST_CANCELLED',
        };
      } else {
        return {
          message: 'Network error - please check your connection and try again.',
          code: 'NETWORK_ERROR',
        };
      }
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Translate common Portuguese error messages to English
   */
  private translatePortugueseError(message: string): string {
    const translations: Record<string, string> = {
      'Token de acesso não fornecido': 'Access token not provided',
      'Token inválido': 'Invalid token',
      'Token expirado': 'Token expired',
      'Credenciais inválidas': 'Invalid credentials',
      'E-mail ou senha incorretos': 'Incorrect email or password',
      'E-mail já cadastrado': 'Email already registered',
      'Usuário não encontrado': 'User not found',
      'Post não encontrado': 'Post not found',
      'Comentário não encontrado': 'Comment not found',
      'Acesso negado': 'Access denied',
      'Dados inválidos': 'Invalid data',
      'Campo obrigatório': 'Required field',
      'Formato inválido': 'Invalid format',
      'Erro interno do servidor': 'Internal server error',
      'Serviço indisponível': 'Service unavailable',
    };

    // Check for exact matches first
    if (translations[message]) {
      return translations[message];
    }

    // Check for partial matches
    for (const [portuguese, english] of Object.entries(translations)) {
      if (message.includes(portuguese)) {
        return english;
      }
    }

    // Return original message if no translation found
    return message;
  }

  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Failed to clear auth data:', errorMessage);
    }
  }

  // Posts API methods with retry logic
  async getPosts(): Promise<Post[]> {
    return RetryService.withRetry(async () => {
      const response = await this.client.get<Post[]>('/posts');
      return response.data;
    });
  }

  async getPost(id: number): Promise<Post> {
    return RetryService.withRetry(async () => {
      const response = await this.client.get(`/posts/${id}`);
      // API returns an array with single post, extract the first item
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }

      // If data is not an array or is empty, check if it's a direct post object
      if (data && typeof data === 'object' && data.title) {
        return data;
      }

      // If we still don't have valid data, throw an error
      throw new Error(`Post with ID ${id} not found or invalid response format`);
    });
  }

  async searchPosts(term: string): Promise<Post[]> {
    return RetryService.withRetry(async () => {
      const response = await this.client.get<Post[]>(`/posts/search/${encodeURIComponent(term)}`);
      return response.data;
    });
  }

  async createPost(post: CreatePostRequest): Promise<Post> {
    // Don't retry create operations to avoid duplicates
    const response = await this.client.post('/posts', post);

    // API returns just the ID as a number, we need to fetch the full post
    const postId = response.data;
    if (typeof postId === 'number') {
      try {
        // Fetch the created post to return full post data
        return await this.getPost(postId);
      } catch (error) {
        // If fetching the created post fails, create a minimal post object
        console.warn('Failed to fetch created post, creating minimal object:', error);
        return {
          id: postId,
          title: post.title,
          content: post.content,
          author_id: postId,
          author: "Autor desconhecido"
        };
      }
    }

    // If response.data is already a post object, return it
    if (response.data && typeof response.data === 'object') {
      return response.data;
    }

    // Fallback: create minimal post object
    return {
      id: postId || Date.now(), // Use timestamp as fallback ID
      title: post.title,
      content: post.content,
      author_id: post.author_id,
      author: "Autor desconhecido"
    };
  }

  async updatePost(id: number, post: UpdatePostRequest, currentPost?: Post): Promise<Post> {
    return RetryService.withRetry(async () => {
      const response = await this.client.put(`/posts/${id}`, post);

      // If update returns success status, try to fetch the updated post
      if (response.status === 200) {
        try {
          return await this.getPost(id);
        } catch (error) {
          // If fetching the updated post fails, merge updates with current post data
          console.warn('Failed to fetch updated post, creating merged object:', error);

          if (currentPost) {
            // Merge the updates with the existing post data
            return {
              ...currentPost,
              ...post, // Apply the updates
              id, // Ensure ID is correct
              updatedAt: new Date().toISOString(),
            };
          }

          // Fallback if no current post data available
          return {
            id,
            title: post.title || 'Updated Post',
            content: post.content || 'Updated content',
          };
        }
      }

      // If response.data is already a post object, return it
      if (response.data && typeof response.data === 'object') {
        return response.data;
      }

      // Fallback: merge updates with current post or create minimal object
      if (currentPost) {
        return {
          ...currentPost,
          ...post, // Apply the updates
          id, // Ensure ID is correct
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        id,
        title: post.title || 'Updated Post',
        content: post.content || 'Updated content',
      };
    });
  }

  async deletePost(id: number): Promise<void> {
    return RetryService.withRetry(async () => {
      await this.client.delete(`/posts/${id}`);
    });
  }

  // Comments API methods with retry logic
  async getComments(postId: number): Promise<Comment[]> {
    return RetryService.withRetry(async () => {
      const response = await this.client.get<Comment[]>(`/posts/comentarios/${postId}`);
      return response.data;
    });
  }

  async createComment(postId: number, comentario: string): Promise<Comment> {
    // Don't retry create operations to avoid duplicates
    const response = await this.client.post('/posts/comentarios', {
      postId,
      comentario
    });

    // Handle different response formats
    const data = response.data;

    // If response contains error, throw it
    if (data && typeof data === 'object' && 'error' in data) {
      throw new Error(data.error);
    }

    // If response is just an ID, create a basic comment object
    if (typeof data === 'number') {
      return {
        id: data,
        post_id: postId,
        author_id: 1,
        comentario,
        author: "Autor desconhecido"
      };
    }

    return data;
  }

  async updateComment(id: number, comentario: string): Promise<Comment> {
    return RetryService.withRetry(async () => {
      const response = await this.client.put(`/posts/comentarios/${id}`, {
        comentario
      });

      // Handle different response formats
      const data = response.data;

      // If response contains error, throw it
      if (data && typeof data === 'object' && 'error' in data) {
        throw new Error(data.error);
      }

      // If successful, return updated comment data
      if (response.status === 200) {
        return {
          id,
          comentario,
          updatedAt: new Date().toISOString(),
          ...data
        };
      }

      return data;
    });
  }

  async deleteComment(id: number): Promise<void> {
    return RetryService.withRetry(async () => {
      await this.client.delete(`/posts/comentarios/${id}`);
    });
  }

  // Likes API methods with retry logic
  async toggleLike(postId: number): Promise<Like> {
    return RetryService.withRetry(async () => {
      const response = await this.client.post<Like>('/posts/like', {
        postId
      });
      return response.data;
    });
  }

  async getLikes(postId: number): Promise<Like[]> {
    return RetryService.withRetry(async () => {
      const response = await this.client.get<Like[]>(`/posts/like/${postId}`);
      return response.data;
    });
  }

  async removeLike(postId: number): Promise<void> {
    return RetryService.withRetry(async () => {
      await this.client.delete(`/posts/like/${postId}`);
    });
  }

  // User API methods with retry logic
  async getUser(id: number): Promise<any> {
    return RetryService.withRetry(async () => {
      const response = await this.client.get(`/users/${id}`);
      return response.data;
    });
  }

  // Registration methods (no retry to avoid duplicates)
  async register(userData: RegisterRequest): Promise<any> {
    const response = await this.client.post('/register', userData);
    return response.data;
  }

  async createTeacher(userData: RegisterRequest): Promise<any> {
    const teacherData = { ...userData, tipo_usuario: 'professor' as const };
    const response = await this.client.post('/register', teacherData);
    return response.data;
  }

  async createStudent(userData: RegisterRequest): Promise<any> {
    const studentData = { ...userData, tipo_usuario: 'aluno' as const };
    const response = await this.client.post('/register', studentData);
    return response.data;
  }

  // Authentication API methods (no retry for login to avoid account lockout)
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // LoginRequest now uses 'senha' to match backend API format
    const loginData = {
      email: credentials.email,
      senha: credentials.senha
    };

    const response = await this.client.post('/login', loginData);

    // Handle different response formats
    const responseData = response.data;
    let accessToken: string;

    if (responseData.accessToken) {
      accessToken = responseData.accessToken;
    } else if (responseData.token) {
      accessToken = responseData.token;
    } else {
      throw new Error('No access token received from login response');
    }

    // Store auth token
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);

    // Create AuthResponse format for compatibility
    const authResponse: AuthResponse = {
      user: {
        id: responseData.userId || responseData.id || 1,
        name: responseData.name || responseData.nome || responseData.usuario || 'Usuário',
        email: credentials.email,
        role: responseData.tipo_usuario || 'teacher',
        token: accessToken
      },
      token: accessToken
    };

    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authResponse.user));

    return authResponse;
  }

  async logout(): Promise<void> {
    return RetryService.withRetry(async () => {
      try {
        await this.client.post('/logout');
      } catch (error) {
        // Continue with logout even if server call fails
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Logout API call failed:', errorMessage);
      } finally {
        await this.clearAuthData();
      }
    });
  }

  /**
   * Test API connectivity and return current base URL
   */
  async testApiConnectivity(): Promise<{ success: boolean; baseUrl: string; error?: string }> {
    try {
      await this.testConnectivity();
      return { success: true, baseUrl: this.currentBaseUrl };
    } catch (error) {
      return {
        success: false,
        baseUrl: this.currentBaseUrl,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get current base URL being used
   */
  getCurrentBaseUrl(): string {
    return this.currentBaseUrl;
  }

  /**
   * Force reset connectivity test (useful for testing different networks)
   */
  resetConnectivityTest(): void {
    this.isConnectivityTested = false;
  }
}

// Export singleton instance
export const apiService = new BlogApiService();
export default apiService;

// Export the same instance as enhancedApiService for backward compatibility
export const enhancedApiService = apiService;