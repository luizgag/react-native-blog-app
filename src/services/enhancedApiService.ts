import { apiService } from './apiService';
import { RetryService } from './retryService';
import {
  ApiService,
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
}

// Export singleton instance
export const enhancedApiService = new EnhancedApiService();
export default enhancedApiService;