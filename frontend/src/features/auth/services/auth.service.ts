import { publicPost } from "@/core/api/client/publicClient";
import { privatePost } from "@/core/api/client/privateClient";
import { AUTH_ENDPOINTS } from "@/core/api/endpoints";
import type {
  AuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyResetOtpRequest,
  ResetTokenResponse,
  VerifyOldPasswordRequest,
} from "../types/auth.types";

export const authService = {
  login(data: LoginRequest): Promise<AuthResponse> {
    return publicPost<AuthResponse>(AUTH_ENDPOINTS.LOGIN, data);
  },

  register(data: RegisterRequest): Promise<AuthResponse> {
    return publicPost<AuthResponse>(AUTH_ENDPOINTS.REGISTER, data);
  },

  logout(): Promise<void> {
    return privatePost<void>(AUTH_ENDPOINTS.LOGOUT);
  },

  refresh(): Promise<{ accessToken: string }> {
    return publicPost<{ accessToken: string }>(AUTH_ENDPOINTS.REFRESH);
  },

  forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return publicPost<ForgotPasswordResponse>(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
  },

  verifyResetOtp(data: VerifyResetOtpRequest): Promise<ResetTokenResponse> {
    return publicPost<ResetTokenResponse>(AUTH_ENDPOINTS.VERIFY_RESET_OTP, data);
  },

  verifyOldPassword(data: VerifyOldPasswordRequest): Promise<ResetTokenResponse> {
    return privatePost<ResetTokenResponse>('/auth/verify-old-password', data);
  },

  resetPassword(data: ResetPasswordRequest): Promise<void> {
    return publicPost<void>(AUTH_ENDPOINTS.RESET_PASSWORD, data);
  },
};
