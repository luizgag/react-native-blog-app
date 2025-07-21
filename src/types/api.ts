// API service interface definitions
import {
  Post,
  AuthResponse,
  LoginRequest,
  CreatePostRequest,
  UpdatePostRequest,
} from './index';

export interface ApiService {
  // Posts
  getPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post>;
  searchPosts(term: string): Promise<Post[]>;
  createPost(post: CreatePostRequest): Promise<Post>;
  updatePost(id: number, post: UpdatePostRequest): Promise<Post>;
  deletePost(id: number): Promise<void>;

  // Comments
  getComments(postId: number): Promise<any[]>;
  createComment(postId: number, comentario: string): Promise<any>;
  updateComment(id: number, comentario: string): Promise<any>;
  deleteComment(id: number): Promise<void>;

  // Likes
  toggleLike(postId: number): Promise<any>;
  getLikes(postId: number): Promise<any[]>;
  removeLike(postId: number): Promise<void>;

  // Users
  getUser(id: number): Promise<any>;

  // Authentication
  login(credentials: LoginRequest): Promise<AuthResponse>;
  logout(): Promise<void>;
  register(userData: {
    nome: string;
    email: string;
    senha: string;
    tipo_usuario: 'professor' | 'aluno';
  }): Promise<any>;
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