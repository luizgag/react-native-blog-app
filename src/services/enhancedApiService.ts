import { apiService } from './apiService';
import { RetryService } from './retryService';
import {
  ApiService,
  Post,
  AuthResponse,
  LoginRequest,
  CreatePostRequest,
  UpdatePostRequest,
  Comment,
  Like,
  RegisterRequest,
} from '../types';

/**
 * Enhanced API service with retry logic and additional error handling
 */
class EnhancedApiService implements ApiService {
  // Posts API methods with retry
  async getPosts(): Promise<Post[]> {
    return RetryService.withRetry(() => apiService.getPosts());
  }

  async getPost(id: number): Promise<Post> {
    return RetryService.withRetry(() => apiService.getPost(id));
  }

  async searchPosts(term: string): Promise<Post[]> {
    return RetryService.withRetry(() => apiService.searchPosts(term));
  }

  async createPost(post: CreatePostRequest): Promise<Post> {
    // Don't retry create operations to avoid duplicates
    return apiService.createPost(post);
  }

  async updatePost(id: number, post: UpdatePostRequest): Promise<Post> {
    return RetryService.withRetry(() => apiService.updatePost(id, post));
  }

  async deletePost(id: number): Promise<void> {
    return RetryService.withRetry(() => apiService.deletePost(id));
  }

  // Comments API methods with retry
  async getComments(postId: number): Promise<Comment[]> {
    return RetryService.withRetry(() => apiService.getComments(postId));
  }

  async createComment(postId: number, comentario: string): Promise<Comment> {
    // Don't retry create operations to avoid duplicates
    return apiService.createComment(postId, comentario);
  }

  async updateComment(id: number, comentario: string): Promise<Comment> {
    return RetryService.withRetry(() => apiService.updateComment(id, comentario));
  }

  async deleteComment(id: number): Promise<void> {
    return RetryService.withRetry(() => apiService.deleteComment(id));
  }

  // Likes API methods with retry
  async toggleLike(postId: number): Promise<Like> {
    return RetryService.withRetry(() => apiService.toggleLike(postId));
  }

  async getLikes(postId: number): Promise<Like[]> {
    return RetryService.withRetry(() => apiService.getLikes(postId));
  }

  async removeLike(postId: number): Promise<void> {
    return RetryService.withRetry(() => apiService.removeLike(postId));
  }

  // Users API methods with retry
  async getUser(id: number): Promise<any> {
    return RetryService.withRetry(() => apiService.getUser(id));
  }

  // Authentication API methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Don't retry login to avoid account lockout
    return apiService.login(credentials);
  }

  async logout(): Promise<void> {
    return RetryService.withRetry(() => apiService.logout());
  }

  async register(userData: RegisterRequest): Promise<any> {
    // Don't retry registration to avoid duplicates
    return apiService.register(userData);
  }
}

// Export singleton instance
export const enhancedApiService = new EnhancedApiService();
export default enhancedApiService;