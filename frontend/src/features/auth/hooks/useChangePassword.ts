import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { changePasswordSchema, type ChangePasswordFormData } from "../schemas/auth.schemas";
import { authService } from "../services/auth.service";
import { useAuth } from "./useAuth";

export function useChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsLoading(true);
      setError("");
      
      // Step 1: Call verify-old-password
      const verifyRes = await authService.verifyOldPassword({ oldPassword: data.oldPassword });
      const resetToken = verifyRes.resetToken;

      // Step 2 & 3: Zod already verified newPassword == confirmPassword
      // Now call reset-password with the new token
      await authService.resetPassword({
        resetToken,
        newPassword: data.newPassword,
      });

      toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      logout();
      navigate("/login");
      
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        setError(err.message as string);
      } else {
        setError("Đã xảy ra lỗi khi đổi mật khẩu");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { form, isLoading, error, onSubmit };
}
