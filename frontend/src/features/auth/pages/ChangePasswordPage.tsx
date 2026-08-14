import { Link } from "react-router-dom";
import { Ticket, ArrowLeft, KeyRound } from "lucide-react";
import { FormField } from "@/shared/components/molecules/FormField";
import { Input } from "@/shared/components/atoms/Input";
import { Button } from "@/shared/components/atoms/Button";
import { useChangePassword } from "../hooks/useChangePassword";

export default function ChangePasswordPage() {
  const { form, isLoading, error, onSubmit } = useChangePassword();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-100/30 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/30 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-surface-1 rounded-2xl shadow-card border border-border p-8 backdrop-blur-xl">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-indigo-600 mb-6 hover:scale-105 transition-transform">
              <Ticket className="h-8 w-8" />
              TicketHub
            </Link>
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Đổi mật khẩu</h1>
            <p className="text-sm text-text-muted">
              Nhập mật khẩu cũ và mật khẩu mới để thay đổi. Bạn sẽ cần đăng nhập lại sau khi đổi.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger text-center font-medium">
                {error}
              </div>
            )}

            <FormField
              label="Mật khẩu cũ"
              error={form.formState.errors.oldPassword?.message}
            >
              <Input
                type="password"
                placeholder="Nhập mật khẩu hiện tại"
                {...form.register("oldPassword")}
              />
            </FormField>

            <FormField
              label="Mật khẩu mới"
              error={form.formState.errors.newPassword?.message}
            >
              <Input
                type="password"
                placeholder="Tối thiểu 8 ký tự, gồm số, chữ và ký tự đặc biệt"
                {...form.register("newPassword")}
              />
            </FormField>

            <FormField
              label="Xác nhận mật khẩu mới"
              error={form.formState.errors.confirmPassword?.message}
            >
              <Input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                {...form.register("confirmPassword")}
              />
            </FormField>

            <Button
              type="submit"
              className="w-full h-11 text-[15px]"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </Button>

            <div className="text-center mt-6 pt-4 border-t border-border">
              <Link to="/" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-primary-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Trở về trang chủ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
