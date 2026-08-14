package com.phuc.ticketbooking.auth.controller;

import com.phuc.ticketbooking.auth.dto.TokenPair;
import com.phuc.ticketbooking.auth.dto.request.ForgotPasswordRequest;
import com.phuc.ticketbooking.auth.dto.request.LoginRequest;
import com.phuc.ticketbooking.auth.dto.request.RegisterRequest;
import com.phuc.ticketbooking.auth.dto.request.VerifyOldPasswordRequest;
import com.phuc.ticketbooking.auth.dto.request.ResetPasswordRequest;
import com.phuc.ticketbooking.auth.dto.request.VerifyResetOtpRequest;
import com.phuc.ticketbooking.auth.dto.response.ForgotPasswordResponse;
import com.phuc.ticketbooking.auth.dto.response.RefreshResponse;
import com.phuc.ticketbooking.auth.dto.response.AuthResponse;
import com.phuc.ticketbooking.auth.dto.response.SessionResponse;
import com.phuc.ticketbooking.auth.dto.response.ResetTokenResponse;
import com.phuc.ticketbooking.auth.security.AuthenticatedSession;
import com.phuc.ticketbooking.auth.service.application.AuthAppService;
import com.phuc.ticketbooking.common.config.AppProperties;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthAppService authAppService;
        private final AppProperties appProperties;

        /** POST /api/auth/register */
        @PostMapping("/register")
        public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                        HttpServletRequest httpRequest) {
                TokenPair tokenPair = authAppService.register(request, httpRequest);
                return buildResponseWithCookie(tokenPair, HttpStatus.CREATED);
        }

        /** POST /api/auth/login */
        @PostMapping("/login")
        public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                        HttpServletRequest httpRequest) {
                TokenPair tokenPair = authAppService.login(request, httpRequest);
                return buildResponseWithCookie(tokenPair, HttpStatus.OK);
        }

        /** POST /api/auth/refresh */
        @PostMapping("/refresh")
        public ResponseEntity<RefreshResponse> refresh(
                        @CookieValue(name = "refreshToken") String refreshToken) {
                TokenPair tokenPair = authAppService.refresh(refreshToken);
                ResponseCookie cookie = ResponseCookie.from("refreshToken", tokenPair.refreshToken())
                                .httpOnly(true)
                                .secure(appProperties.security().cookieSecure())
                                .path("/api/auth/refresh")
                                .maxAge(tokenPair.refreshTokenExpiresIn())
                                .build();
                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                                .body(new RefreshResponse(tokenPair.accessToken(), tokenPair.expiresIn()));
        }

        /** POST /api/auth/logout */
        @PostMapping("/logout")
        public ResponseEntity<Void> logout(
                        @AuthenticationPrincipal AuthenticatedSession principal) {

                authAppService.logout(principal.userId(), principal.sessionId());
                return ResponseEntity.noContent()
                                .header(HttpHeaders.SET_COOKIE, expiredRefreshCookie().toString())
                                .build();
        }

        /** POST /api/auth/logout-all */
        @PostMapping("/logout-all")
        public ResponseEntity<Void> logoutAll(
                        @AuthenticationPrincipal AuthenticatedSession principal) {

                authAppService.logoutAll(principal.userId());
                return ResponseEntity.noContent()
                                .header(HttpHeaders.SET_COOKIE, expiredRefreshCookie().toString())
                                .build();
        }

        /** GET /api/auth/sessions */
        @GetMapping("/sessions")
        public ResponseEntity<List<SessionResponse>> getSessions(
                        @AuthenticationPrincipal AuthenticatedSession principal) {

                List<SessionResponse> sessions = authAppService.getActiveSessions(
                                principal.userId(), principal.sessionId());
                return ResponseEntity.ok(sessions);
        }

        /** DELETE /api/auth/sessions/{sessionId} */
        @DeleteMapping("/sessions/{sessionId}")
        public ResponseEntity<Void> revokeSession(
                        @AuthenticationPrincipal AuthenticatedSession principal,
                        @PathVariable UUID sessionId) {

                authAppService.revokeSession(principal.userId(), sessionId);
                return ResponseEntity.noContent().build();
        }

        /** POST /api/auth/forgot-password */
        @PostMapping("/forgot-password")
        public ForgotPasswordResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
                return authAppService.forgotPassword(request);
        }

        /** POST /api/auth/verify-reset-otp */
        @PostMapping("/verify-reset-otp")
        public ResetTokenResponse verifyResetOtp(@Valid @RequestBody VerifyResetOtpRequest request) {
                return authAppService.verifyResetOtp(request);
        }

        /** POST /api/auth/verify-old-password */
        @PostMapping("/verify-old-password")
        public ResetTokenResponse verifyOldPassword(
                        @AuthenticationPrincipal AuthenticatedSession principal,
                        @Valid @RequestBody VerifyOldPasswordRequest request) {
                return authAppService.verifyOldPassword(principal.userId(), request);
        }

        /** POST /api/auth/reset-password */
        @PostMapping("/reset-password")
        public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
                authAppService.resetPassword(request);
                return ResponseEntity.noContent().build();
        }

        // -- Private ---------------------------------------------------------------

        private ResponseEntity<AuthResponse> buildResponseWithCookie(TokenPair tokenPair, HttpStatus status) {
                ResponseCookie cookie = ResponseCookie.from("refreshToken", tokenPair.refreshToken())
                                .httpOnly(true)
                                .secure(appProperties.security().cookieSecure())
                                .path("/api/auth/refresh")
                                .maxAge(tokenPair.refreshTokenExpiresIn())
                                .build();

                AuthResponse responseBody = new AuthResponse(
                                tokenPair.accessToken(),
                                tokenPair.expiresIn(),
                                tokenPair.user());

                return ResponseEntity.status(status)
                                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                                .body(responseBody);
        }

        /** Builds a zero-maxAge cookie to clear the refresh token on the client. */
        private ResponseCookie expiredRefreshCookie() {
                return ResponseCookie.from("refreshToken", "")
                                .httpOnly(true)
                                .secure(appProperties.security().cookieSecure())
                                .path("/api/auth/refresh")
                                .maxAge(0)
                                .build();
        }
}