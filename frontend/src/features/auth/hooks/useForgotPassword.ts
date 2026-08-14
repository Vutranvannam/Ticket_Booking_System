import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authService } from "../services/auth.service";
import {
  forgotPasswordSchema,
  verifyOtpSchema,
  type ForgotPasswordFormData,
  type VerifyOtpFormData,
} from "../schemas/auth.schemas";

const COOLDOWN_SECONDS = 60;

/**
 * Manages the 2-step forgot-password flow:
 *  - Step 1: email submission → POST /auth/forgot-password
 *  - Step 2: OTP verification → POST /auth/verify-reset-otp → navigate to reset-password page
 */
export function useForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [emailSnapshot, setEmailSnapshot] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Step 1 form ────────────────────────────────────────────────────────────
  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // ── Step 2 form ────────────────────────────────────────────────────────────
  const otpForm = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  // ── Cooldown timer ─────────────────────────────────────────────────────────
  const startCooldown = useCallback(() => {
    setCooldownSeconds(COOLDOWN_SECONDS);
    cooldownRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Step 1 submit ──────────────────────────────────────────────────────────
  const onEmailSubmit = emailForm.handleSubmit(async (data) => {
    try {
      await authService.forgotPassword({ email: data.email });
      setEmailSnapshot(data.email);
      setStep(2);
      startCooldown();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Đã có lỗi xảy ra, vui lòng thử lại.";
      toast.error(msg);
    }
  });

  // ── Step 2 submit ──────────────────────────────────────────────────────────
  const onOtpSubmit = otpForm.handleSubmit(async (data) => {
    try {
      const res = await authService.verifyResetOtp({ email: emailSnapshot, otp: data.otp });
      navigate(`/reset-password?token=${encodeURIComponent(res.resetToken)}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Mã OTP không hợp lệ hoặc đã hết hạn.";
      otpForm.setError("otp", { message: msg });
    }
  });

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const onResend = useCallback(async () => {
    if (cooldownSeconds > 0) return;
    try {
      await authService.forgotPassword({ email: emailSnapshot });
      toast.success("Mã OTP mới đã được gửi!");
      otpForm.reset();
      startCooldown();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Không thể gửi lại OTP, vui lòng thử sau.";
      toast.error(msg);
    }
  }, [cooldownSeconds, emailSnapshot, otpForm, startCooldown]);

  return {
    step,
    emailSnapshot,
    cooldownSeconds,
    emailForm,
    otpForm,
    onEmailSubmit,
    onOtpSubmit,
    onResend,
  };
}
