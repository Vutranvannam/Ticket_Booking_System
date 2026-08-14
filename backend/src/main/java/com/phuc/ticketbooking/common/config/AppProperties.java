package com.phuc.ticketbooking.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

@Validated
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Jwt jwt,
        Oauth2 oauth2,
        Security security,
        Mail mail,
        Otp otp,
        ResetToken resetToken,
        Cache cache
) {
    public record Jwt(
            @NotBlank(message = "JWT secret cannot be blank")
            @Size(min = 32, message = "JWT secret must be at least 32 characters (256 bits)")
            String secret, 
            long accessTokenExpiry, 
            long refreshTokenExpiry) {}
    public record Oauth2(String redirectUri, String failureUri) {}
    public record Security(boolean cookieSecure, Cors cors, int cacheTtlSeconds) {
        public record Cors(List<String> allowedOrigins) {}
    }
    public record Mail(String from) {}
    public record Otp(int expirySeconds, int maxAttempts, int cooldownSeconds) {}
    public record ResetToken(int expirySeconds) {}
    public record Cache(int emailTtlHours) {}
}
