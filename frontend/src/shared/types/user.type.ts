/** Aligned with backend UserResponse record */
export interface User {
  id: string;           // UUID
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  roles: string[];
  permissions: string[];
}
