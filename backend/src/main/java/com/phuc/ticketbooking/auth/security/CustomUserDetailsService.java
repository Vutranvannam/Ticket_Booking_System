package com.phuc.ticketbooking.auth.security;

import com.phuc.ticketbooking.user.entity.User;
import com.phuc.ticketbooking.user.service.domain.UserDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Security {@link UserDetailsService} backed by email lookup.
 * Used by {@code DaoAuthenticationProvider} during the email+password login flow.
 * Loads roles and permissions eagerly via JOIN FETCH to populate authorities.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserDomainService userDomainService;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userDomainService.findActiveUserByEmailWithRolesAndPermissions(email);
        return new CustomUserDetails(user);
    }
}
