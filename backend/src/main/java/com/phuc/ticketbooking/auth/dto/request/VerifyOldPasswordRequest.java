package com.phuc.ticketbooking.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyOldPasswordRequest(
        @NotBlank(message = "Mật khẩu cũ không được để trống")
        @Size(min = 6, max = 50, message = "Mật khẩu cũ phải từ 6 đến 50 ký tự")
        String oldPassword
) {
}
