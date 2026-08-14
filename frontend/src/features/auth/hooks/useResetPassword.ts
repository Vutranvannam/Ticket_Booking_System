import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { authService } from "../services/auth.service";
import { resetPasswordSchema, type ResetPasswordFormData } from "../schemas/auth.schemas";

/**
 * Manages the reset-password page (Step 3 of the forgot-password flow).
 *
 * - Reads `resetToken` from the URL query param `?token=...`
 * - Redirects to `/forgot-password` if no token is present
 * - On success, navigates to `/login` with a success toast
 */
export function useResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token") ?? "";

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Guard: redirect if token is absent
  useEffect(() => {
    if (!resetToken) {
      navigate("/forgot-password", { replace: true });
    }
  }, [resetToken, navigate]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await authService.resetPassword({
        resetToken,
        newPassword: data.password,
      });
      toast.success("Mật khẩu đã được cập nhật! Vui lòng đăng nhập lại.");
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Đã có lỗi xảy ra, vui lòng thử lại.";
      toast.error(msg);
    }
  });

  return { form, onSubmit, resetToken };
}
