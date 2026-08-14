import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";
import { AuthLayout } from "../components/AuthLayout";
import { FloatingInput } from "@/shared/components/molecules/FloatingInput";
import { Button } from "@/shared/components/atoms/Button";
import { Checkbox } from "@/shared/components/atoms/Checkbox";
import { useLoginForm } from "../hooks/useLoginForm";
import { AUTH_ENDPOINTS } from "@/core/api/endpoints";

export default function LoginPage() {
  const { form, onSubmit, errors, isLoading, error, setOAuth2Error } = useLoginForm();
  const [searchParams] = useSearchParams();

  // Show error when Google redirects back with ?error=oauth2 after a failure
  useEffect(() => {
    if (searchParams.get("error") === "oauth2") {
      setOAuth2Error("Đăng nhập bằng Google thất bại. Vui lòng thử lại hoặc dùng email/mật khẩu.");
    }
  }, [searchParams, setOAuth2Error]);

  const handleGoogleLogin = () => {
    window.location.href = `/api${AUTH_ENDPOINTS.GOOGLE_OAUTH2}`;
  };

  return (
    <AuthLayout title="Đăng nhập" subtitle="Truy cập ngay để săn những chiếc vé nóng hổi nhất và quản lý sự kiện của bạn.">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FloatingInput
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          error={!!errors.email}
          errorMessage={errors.email?.message}
          {...form.register("email")}
        />

        <FloatingInput
          id="login-password"
          label="Mật khẩu"
          isPassword
          error={!!errors.password}
          errorMessage={errors.password?.message}
          {...form.register("password")}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-text-primary cursor-pointer select-none">
            <Checkbox {...form.register("rememberMe")} />
            Ghi nhớ đăng nhập
          </label>
          <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
            Quên mật khẩu?
          </Link>
        </div>

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

        <Button
          type="submit"
          disabled={isLoading}
          fullWidth
          className="mt-6 font-semibold"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-surface px-2 text-text-secondary">Hoặc tiếp tục với</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            id="login-google-btn"
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
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
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
