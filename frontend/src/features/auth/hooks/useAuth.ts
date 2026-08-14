import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { loginThunk, registerThunk, logoutThunk } from "../store/auth.thunk";
import { authActions } from "../store/auth.slice";
import { selectAuthData } from "../store/auth.selectors";
import type { LoginFormData, RegisterFormData } from "../schemas/auth.schemas";

export function useAuth() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(selectAuthData);

  const login = useCallback(async (data: LoginFormData) => {
    const { rememberMe: _rm, ...request } = data;
    const result = await dispatch(loginThunk(request));
    if (loginThunk.fulfilled.match(result)) {
      navigate("/dashboard", { replace: true });
    }
    return result;
  }, [dispatch, navigate]);

  const register = useCallback(async (data: RegisterFormData) => {
    const { confirmPassword: _cp, ...request } = data;
    const result = await dispatch(registerThunk(request));
    if (registerThunk.fulfilled.match(result)) {
      navigate("/dashboard", { replace: true });
    }
    return result;
  }, [dispatch, navigate]);

  const logout = useCallback(async () => {
    await dispatch(logoutThunk());
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);

  const dismissError = useCallback(() => dispatch(authActions.clearError()), [dispatch]);

  return { user, isAuthenticated, isLoading, error, login, register, logout, dismissError };
}
