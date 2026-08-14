import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../services/auth.service";
import { userService } from "@/features/users/services/user.service";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth.types";
import type { User } from "@/shared/types/user.type";

export const loginThunk = createAsyncThunk<AuthResponse, LoginRequest, { rejectValue: string }>(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      return await authService.login(data);
    } catch (err: unknown) {
      return rejectWithValue((err as { message?: string })?.message ?? "Đăng nhập thất bại");
    }
  }
);

export const registerThunk = createAsyncThunk<AuthResponse, RegisterRequest, { rejectValue: string }>(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      return await authService.register(data);
    } catch (err: unknown) {
      return rejectWithValue((err as { message?: string })?.message ?? "Đăng ký thất bại");
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try { await authService.logout(); } catch { /* ignore */ }
});

/**
 * Fetches the current user's profile from GET /api/users/me.
 * Used by OAuth2SuccessPage after acquiring an access token via /auth/refresh.
 */
export const fetchMeThunk = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getMe();
    } catch (err: unknown) {
      return rejectWithValue((err as { message?: string })?.message ?? "Không thể tải thông tin người dùng");
    }
  }
);
