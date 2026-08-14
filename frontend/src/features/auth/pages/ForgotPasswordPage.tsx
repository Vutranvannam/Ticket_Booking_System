import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft, Mail, ShieldCheck, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthLayout } from "../components/AuthLayout";
import { FloatingInput } from "@/shared/components/molecules/FloatingInput";
import { Button } from "@/shared/components/atoms/Button";
import { useForgotPassword } from "../hooks/useForgotPassword";

import { OtpInput } from "../components/OtpInput";

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const {
    step,
    emailSnapshot,
    cooldownSeconds,
    emailForm,
    otpForm,
    onEmailSubmit,
    onOtpSubmit,
    onResend,
  } = useForgotPassword();

  // Auto-focus first OTP digit when step changes to 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        document.getElementById("otp-digit-0")?.focus();
      }, 400);
    }
  }, [step]);

  const otpValue = otpForm.watch("otp") ?? "";

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction * 40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction * -40,
      opacity: 0,
    }),
  };

  return (
    <AuthLayout
      title={step === 1 ? "Quên mật khẩu" : "Nhập mã OTP"}
      subtitle={
        step === 1
          ? "Nhập email để nhận hướng dẫn đặt lại mật khẩu."
          : `Mã OTP đã được gửi đến ${emailSnapshot}`
      }
    >
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-500 ${s === step
              ? "w-8 bg-indigo-600"
              : s < step
                ? "w-2 bg-indigo-300"
                : "w-2 bg-slate-200"
              }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={step}>
        {step === 1 ? (
          /* ── Step 1: Email ── */
          <motion.form
            key="step1"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            onSubmit={onEmailSubmit}
            className="space-y-4"
          >
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Mail className="text-indigo-600" size={28} />
              </div>
            </div>
            <FloatingInput
              id="forgot-email"
              label="Địa chỉ email"
              type="email"
              error={!!emailForm.formState.errors.email}
              errorMessage={emailForm.formState.errors.email?.message}
              {...emailForm.register("email")}
            />
            <Button
              type="submit"
              disabled={emailForm.formState.isSubmitting}
              fullWidth
              className="mt-4"
            >
              {emailForm.formState.isSubmitting && (
                <Loader2 size={16} className="animate-spin" />
              )}
              Gửi mã OTP
            </Button>
            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 font-medium transition-colors mt-6"
            >
              <ArrowLeft size={14} /> Quay lại đăng nhập
            </Link>
          </motion.form>
        ) : (
          /* ── Step 2: OTP ── */
          <motion.form
            key="step2"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            onSubmit={onOtpSubmit}
            className="space-y-6"
          >
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <ShieldCheck className="text-emerald-600" size={28} />
              </div>
            </div>

            <OtpInput
              value={otpValue}
              onChange={(val) => otpForm.setValue("otp", val, { shouldValidate: true })}
              error={otpForm.formState.errors.otp?.message}
            />

            <Button
              type="submit"
              disabled={otpForm.formState.isSubmitting || otpValue.replace(/\s/g, "").length < 6}
              fullWidth
            >
              {otpForm.formState.isSubmitting && (
                <Loader2 size={16} className="animate-spin" />
              )}
              Xác nhận OTP
            </Button>

            {/* Resend link */}
            <div className="text-center text-sm text-slate-500">
              Chưa nhận được mã?{" "}
              {cooldownSeconds > 0 ? (
                <span className="font-medium text-slate-400">
                  Gửi lại sau {cooldownSeconds}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onResend}
                  className="font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={13} />
                  Gửi lại OTP
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => { }}
              className="flex items-center justify-center gap-1.5 w-full text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
            >
              <ArrowLeft size={14} />
              Nhập lại email khác
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
