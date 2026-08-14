import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { tokenStorage } from "@/core/auth/tokenStorage";
import type { AuthState } from "../types/auth.types";
import type { User } from "@/shared/types/user.type";
import { loginThunk, registerThunk, logoutThunk, fetchMeThunk } from "./auth.thunk";

const initialState: AuthState = {
  user: null,
  accessToken: tokenStorage.getAccessToken(),
  isAuthenticated: Boolean(tokenStorage.getAccessToken()),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      tokenStorage.clearAccessToken();
    },
    setToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
      tokenStorage.setAccessToken(action.payload);
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending  = (state: AuthState) => { state.isLoading = true; state.error = null; };
    const rejected = (state: AuthState, action: { payload?: string; error?: { message?: string } }) => {
      state.isLoading = false;
      state.error = action.payload ?? action.error?.message ?? "Đã xảy ra lỗi";
    };

    builder
      .addCase(loginThunk.pending, pending)
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        tokenStorage.setAccessToken(action.payload.accessToken);
      })
      .addCase(loginThunk.rejected, rejected)

      .addCase(registerThunk.pending, pending)
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        tokenStorage.setAccessToken(action.payload.accessToken);
      })
      .addCase(registerThunk.rejected, rejected)

      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        tokenStorage.clearAccessToken();
      })

      // OAuth2 flow: fetchMeThunk populates user after access token is set via setToken action
      .addCase(fetchMeThunk.pending, pending)
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMeThunk.rejected, (state, action) => {
        // Reset auth state if we cannot hydrate the user after OAuth2
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = action.payload ?? "Không thể tải thông tin người dùng";
        tokenStorage.clearAccessToken();
      });
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
