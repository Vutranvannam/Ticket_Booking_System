import type { User } from "@/shared/types/user.type";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginRequest { email: string; password: string; }

export interface AuthResponse { user: User; accessToken: string; }

export interface ForgotPasswordRequest { email: string; }
export interface ForgotPasswordResponse { message: string; expiresInSeconds: number; }

export interface VerifyResetOtpRequest { email: string; otp: string; }
export interface ResetTokenResponse {
  resetToken: string;
  expiresInSeconds: number;
}

export interface VerifyOldPasswordRequest {
  oldPassword: string;
}

export interface ResetPasswordRequest { resetToken: string; newPassword: string; }
