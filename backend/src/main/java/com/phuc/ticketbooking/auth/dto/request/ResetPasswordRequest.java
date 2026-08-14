package com.phuc.ticketbooking.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for POST /auth/reset-password.
 */
public record ResetPasswordRequest(
        @NotBlank(message = "Reset token không được để trống")
        String resetToken,

        @NotBlank(message = "Mật khẩu mới không được để trống")
        @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
        String newPassword
) {
}
