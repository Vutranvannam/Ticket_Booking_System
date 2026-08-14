import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .regex(/[a-z]/, "Phải có ít nhất 1 chữ thường")
  .regex(/[A-Z]/, "Phải có ít nhất 1 chữ hoa")
  .regex(/[0-9]/, "Phải có ít nhất 1 chữ số")
  .regex(/[@$!%*?&]/, "Phải có ít nhất 1 ký tự đặc biệt (@$!%*?&)");

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ").trim(),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ").trim(),
  fullName: z.string().min(1, "Vui lòng nhập họ tên").trim(),
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ").trim(),
});

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "Mã OTP phải có đúng 6 chữ số")
    .regex(/^\d{6}$/, "Mã OTP chỉ gồm chữ số"),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export type LoginFormData         = z.infer<typeof loginSchema>;
export type RegisterFormData      = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpFormData     = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordFormData  = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
