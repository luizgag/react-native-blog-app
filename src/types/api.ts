// API service interface definitions
import {
  Post,
  AuthResponse,
  LoginRequest,
  CreatePostRequest,
  UpdatePostRequest,
  Comment,
  Like,
  RegisterRequest,
  User,
} from './index';

export interface ApiService {
  // Posts
  getPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post>;
  searchPosts(term: string): Promise<Post[]>;
  createPost(post: CreatePostRequest): Promise<Post>;
  updatePost(id: number, post: UpdatePostRequest, currentPost?: Post): Promise<Post>;
  deletePost(id: number): Promise<void>;

  // Comments
  getComments(postId: number): Promise<Comment[]>;
  createComment(postId: number, comentario: string): Promise<Comment>;
  updateComment(id: number, comentario: string): Promise<Comment>;
  deleteComment(id: number): Promise<void>;

  // Likes
  toggleLike(postId: number): Promise<Like>;
  getLikes(postId: number): Promise<Like[]>;
  removeLike(postId: number): Promise<void>;

  // Users
  getUser(id: number): Promise<User>;

  // Authentication
  login(credentials: LoginRequest): Promise<AuthResponse>;
  logout(): Promise<void>;
  register(userData: RegisterRequest): Promise<any>;
  
  // User creation methods
  createTeacher(userData: RegisterRequest): Promise<any>;
  createStudent(userData: RegisterRequest): Promise<any>;
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

// Comment creation request
export interface CreateCommentRequest {
  post_id: number;
  comentario: string;
}

// Like creation request
export interface CreateLikeRequest {
  post_id: number;
}