import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { AuthLayout } from "../components/AuthLayout";
import { FloatingInput } from "@/shared/components/molecules/FloatingInput";
import { Button } from "@/shared/components/atoms/Button";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { motion, AnimatePresence } from "framer-motion";
import { AUTH_ENDPOINTS } from "@/core/api/endpoints";

export default function RegisterPage() {
  const { form, onSubmit, errors, isLoading, error } = useRegisterForm();

  const handleGoogleRegister = () => {
    window.location.href = `/api${AUTH_ENDPOINTS.GOOGLE_OAUTH2}`;
  };

  return (
    <AuthLayout title="Tạo tài khoản" subtitle="Gia nhập cộng đồng TicketHub ngay hôm nay. Hàng ngàn sự kiện đỉnh cao đang chờ đón bạn!">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FloatingInput
          id="reg-fullname"
          label="Họ và tên"
          autoComplete="name"
          error={!!errors.fullName}
          errorMessage={errors.fullName?.message}
          {...form.register("fullName")}
        />
        <FloatingInput
          id="reg-email"
          label="Email"
          type="email"
          autoComplete="email"
          error={!!errors.email}
          errorMessage={errors.email?.message}
          {...form.register("email")}
        />
        <FloatingInput
          id="reg-password"
          label="Mật khẩu"
          isPassword
          error={!!errors.password}
          errorMessage={errors.password?.message}
          {...form.register("password")}
        />

        <FloatingInput
          id="reg-confirm-password"
          label="Xác nhận mật khẩu"
          isPassword
          error={!!errors.confirmPassword}
          errorMessage={errors.confirmPassword?.message}
          {...form.register("confirmPassword")}
        />

        <AnimatePresence>
          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <Button type="submit" disabled={isLoading} fullWidth className="mt-6 font-semibold">
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </Button>

        <p className="text-center text-[13px] text-text-secondary mt-4 leading-relaxed">
          Bằng việc đăng ký, bạn đồng ý với{" "}
          <a href="#" className="text-indigo-600 hover:underline">Điều khoản dịch vụ</a> và{" "}
          <a href="#" className="text-indigo-600 hover:underline">Chính sách bảo mật</a>.
        </p>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-surface px-2 text-text-secondary">Hoặc đăng ký bằng</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            id="register-google-btn"
            type="button"
            variant="outline"
            onClick={handleGoogleRegister}
            className="w-full border-border hover:border-border-hover text-text-primary bg-background hover:bg-surface-1 transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
          >
            <FcGoogle className="text-[18px]" />
            <span>Google</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled
            className="w-full border-border text-text-primary bg-background font-medium shadow-sm flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
          >
            <FaFacebook className="text-[#1877F2] text-[18px]" />
            <span>Facebook</span>
          </Button>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">Đăng nhập</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
