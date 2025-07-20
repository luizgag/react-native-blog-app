import { apiService } from './apiService';
import { RetryService } from './retryService';
import {
  ApiService,
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

  // Authentication API methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Don't retry login to avoid account lockout
    return apiService.login(credentials);
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Don't retry registration to avoid duplicate accounts
    return apiService.register(userData);
  }

  async logout(): Promise<void> {
    return RetryService.withRetry(() => apiService.logout());
  }

  // Teachers API methods with retry
  async getTeachers(page: number = 1): Promise<PaginatedResponse<Teacher>> {
    return RetryService.withRetry(() => apiService.getTeachers(page));
  }

  async createTeacher(teacher: CreateTeacherRequest): Promise<Teacher> {
    // Don't retry create operations to avoid duplicates
    return apiService.createTeacher(teacher);
  }

  async updateTeacher(id: number, teacher: UpdateTeacherRequest): Promise<Teacher> {
    return RetryService.withRetry(() => apiService.updateTeacher(id, teacher));
  }

  async deleteTeacher(id: number): Promise<void> {
    return RetryService.withRetry(() => apiService.deleteTeacher(id));
  }

  // Students API methods with retry
  async getStudents(page: number = 1): Promise<PaginatedResponse<Student>> {
    return RetryService.withRetry(() => apiService.getStudents(page));
  }

  async createStudent(student: CreateStudentRequest): Promise<Student> {
    // Don't retry create operations to avoid duplicates
    return apiService.createStudent(student);
  }

  async updateStudent(id: number, student: UpdateStudentRequest): Promise<Student> {
    return RetryService.withRetry(() => apiService.updateStudent(id, student));
  }

  async deleteStudent(id: number): Promise<void> {
    return RetryService.withRetry(() => apiService.deleteStudent(id));
  }

  // Comments API methods with retry
  async getComments(postId: number): Promise<Comment[]> {
    return RetryService.withRetry(() => apiService.getComments(postId));
  }

  async createComment(comment: CreateCommentRequest): Promise<Comment> {
    // Don't retry create operations to avoid duplicates
    return apiService.createComment(comment);
  }

  async updateComment(id: number, comment: UpdateCommentRequest): Promise<Comment> {
    return RetryService.withRetry(() => apiService.updateComment(id, comment));
  }

  async deleteComment(id: number): Promise<void> {
    return RetryService.withRetry(() => apiService.deleteComment(id));
  }

  // Likes API methods with retry
  async getLikes(postId: number): Promise<Like[]> {
    return RetryService.withRetry(() => apiService.getLikes(postId));
  }

  async toggleLike(postId: number): Promise<{ liked: boolean; count: number }> {
    return RetryService.withRetry(() => apiService.toggleLike(postId));
  }

  async removeLike(postId: number): Promise<void> {
    return RetryService.withRetry(() => apiService.removeLike(postId));
  }
}

// Export singleton instance
export const enhancedApiService = new EnhancedApiService();
export default enhancedApiService;