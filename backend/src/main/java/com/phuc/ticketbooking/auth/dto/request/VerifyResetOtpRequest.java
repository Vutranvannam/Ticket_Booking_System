package com.phuc.ticketbooking.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for POST /auth/verify-reset-otp.
 */
public record VerifyResetOtpRequest(
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        String email,

        @NotBlank(message = "OTP không được để trống")
        @Size(min = 6, max = 6, message = "OTP phải có đúng 6 chữ số")
        String otp
) {
}
