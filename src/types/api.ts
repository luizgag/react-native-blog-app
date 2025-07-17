// API service interface definitions
import {
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
} from './index';

export interface ApiService {
  // Posts
  getPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post>;
  searchPosts(term: string): Promise<Post[]>;
  createPost(post: CreatePostRequest): Promise<Post>;
  updatePost(id: number, post: UpdatePostRequest): Promise<Post>;
  deletePost(id: number): Promise<void>;

  // Authentication
  login(credentials: LoginRequest): Promise<AuthResponse>;
  logout(): Promise<void>;

  // Teachers (assumed endpoints)
  getTeachers(page: number): Promise<PaginatedResponse<Teacher>>;
  createTeacher(teacher: CreateTeacherRequest): Promise<Teacher>;
  updateTeacher(id: number, teacher: UpdateTeacherRequest): Promise<Teacher>;
  deleteTeacher(id: number): Promise<void>;

  // Students (assumed endpoints)
  getStudents(page: number): Promise<PaginatedResponse<Student>>;
  createStudent(student: CreateStudentRequest): Promise<Student>;
  updateStudent(id: number, student: UpdateStudentRequest): Promise<Student>;
  deleteStudent(id: number): Promise<void>;
}

// HTTP error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}