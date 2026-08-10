package com.phuc.ticketbooking.auth.oauth2;

import com.phuc.ticketbooking.common.constant.AppConstants;
import com.phuc.ticketbooking.common.exception.ApiException;
import com.phuc.ticketbooking.common.exception.ErrorCode;
import com.phuc.ticketbooking.user.entity.Role;
import com.phuc.ticketbooking.user.entity.User;
import com.phuc.ticketbooking.user.service.domain.RoleDomainService;
import com.phuc.ticketbooking.user.service.domain.UserDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

/**
 * Handles OAuth2 user info loading after Google redirects back.
 * <p>
 * Flow:
 * <ol>
 * <li>Extract email from Google's user info.</li>
 * <li>Find existing user by email or create a new one.</li>
 * <li>Return a {@link CustomOAuth2User} wrapping both the User entity and
 * OAuth2 attributes.</li>
 * </ol>
 */
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserDomainService userDomainService;
    private final RoleDomainService roleDomainService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String fullName = oAuth2User.getAttribute("name");

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not provided by OAuth2 provider");
        }

        User user = findOrCreateUser(email, fullName);
        return new CustomOAuth2User(user, oAuth2User.getAttributes());
    }

    private User findOrCreateUser(String email, String fullName) {
        try {
            return userDomainService.findActiveUserByIdWithRolesAndPermissions(
                    userDomainService.findActiveUserByEmail(email).getId());
        } catch (ApiException ex) {
            if (ex.getErrorCode() == ErrorCode.USER_NOT_FOUND) {
                return createOAuth2User(email, fullName);
            }
            throw ex;
        }
    }

    private User createOAuth2User(String email, String fullName) {
        User user = User.createOAuth2User(email, fullName != null ? fullName : email);
        Role customerRole = roleDomainService.findByName(AppConstants.CUSTOMER_ROLE);
        user.addRole(customerRole);
        return userDomainService.save(user);
    }
}
