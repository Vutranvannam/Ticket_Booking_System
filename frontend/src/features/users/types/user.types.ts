export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
  avatarUrl?: string;
}

export interface UserListParams {
  page: number;
  size: number;
  search?: string;
  role?: string;
}
