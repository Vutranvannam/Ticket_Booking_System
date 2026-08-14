package com.phuc.ticketbooking.auth.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import com.phuc.ticketbooking.common.config.AppProperties;

import java.io.IOException;

/**
 * Handles failed OAuth2 Google authentication (e.g., user denied access).
 *
 * <p>
 * Redirects to the configured frontend failure URL so the user sees a
 * friendly error message instead of a raw Spring error page.
 *
 * <p>
 * The failure URL defaults to {@code http://localhost:5173/login?error=oauth2}.
 * Override with the {@code OAUTH2_FAILURE_URI} environment variable.
 */
@Slf4j
@Component
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    public OAuth2FailureHandler(AppProperties appProperties) {
        super(appProperties.oauth2().failureUri());
        setUseForward(false); // use redirect, not forward
    }

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {
        log.warn("OAuth2 authentication failed: {}", exception.getMessage());
        super.onAuthenticationFailure(request, response, exception);
    }
}
