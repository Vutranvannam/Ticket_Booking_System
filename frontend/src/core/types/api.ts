export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  timestamp?: string;
  path?: string;
  isNetworkError?: boolean;
  isAuthError?: boolean;
}
