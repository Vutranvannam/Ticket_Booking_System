import { Link } from "react-router-dom";
import { Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { AuthLayout } from "../components/AuthLayout";
import { FloatingInput } from "@/shared/components/molecules/FloatingInput";
import { Button } from "@/shared/components/atoms/Button";
import { useResetPassword } from "../hooks/useResetPassword";

export default function ResetPasswordPage() {
  const { form, onSubmit } = useResetPassword();
  const { register, formState: { errors, isSubmitting } } = form;

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle="Nhập mật khẩu mới để hoàn tất quá trình đặt lại."
    >
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <KeyRound className="text-indigo-600" size={28} />
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <FloatingInput
          id="reset-password"
          label="Mật khẩu mới"
          type="password"
          error={!!errors.password}
          errorMessage={errors.password?.message}
          {...register("password")}
        />
        <FloatingInput
          id="reset-confirm-password"
          label="Xác nhận mật khẩu mới"
          type="password"
          error={!!errors.confirmPassword}
          errorMessage={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" disabled={isSubmitting} fullWidth className="mt-4">
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Cập nhật mật khẩu
        </Button>

        <Link
          to="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 font-medium transition-colors mt-6"
        >
          <ArrowLeft size={14} /> Quay lại đăng nhập
        </Link>
      </form>
    </AuthLayout>
  );
}
