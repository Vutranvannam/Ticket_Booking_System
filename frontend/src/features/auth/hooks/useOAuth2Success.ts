import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/store/hook";
import { authActions } from "../store/auth.slice";
import { fetchMeThunk } from "../store/auth.thunk";
import { authService } from "../services/auth.service";

/**
 * Hook for OAuth2SuccessPage.
 *
 * After Google redirects the browser to /oauth2/success:
 * 1. POST /api/auth/refresh — the HttpOnly refresh-token cookie is sent
 *    automatically by the browser. Returns { accessToken }.
 * 2. dispatch setToken — stores the access token in memory.
 * 3. dispatch fetchMeThunk — GET /api/users/me to hydrate Redux with the user.
 * 4. navigate to /dashboard on success, or /login?error=oauth2 on failure.
 */
export function useOAuth2Success() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function handleOAuth2Callback() {
      try {
        // Step 1: Exchange the HttpOnly refresh cookie for an access token
        const refreshResult = await authService.refresh();
        const { accessToken } = refreshResult;

        if (!accessToken) {
          throw new Error("No access token in refresh response");
        }

        if (cancelled) return;

        // Step 2: Store access token in Redux + memory
        dispatch(authActions.setToken(accessToken));

        // Step 3: Hydrate user from /api/users/me
        const result = await dispatch(fetchMeThunk());

        if (cancelled) return;

        if (fetchMeThunk.fulfilled.match(result)) {
          navigate("/dashboard", { replace: true });
        } else {
          setError("Không thể tải thông tin tài khoản. Vui lòng thử lại.");
          setTimeout(() => navigate("/login?error=oauth2", { replace: true }), 2000);
        }
      } catch {
        if (!cancelled) {
          setError("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
          setTimeout(() => navigate("/login?error=oauth2", { replace: true }), 2000);
        }
      }
    }

    handleOAuth2Callback();
    return () => { cancelled = true; };
  }, [dispatch, navigate]);

  return { error };
}
