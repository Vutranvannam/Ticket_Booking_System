package com.phuc.ticketbooking.auth.security;

import com.phuc.ticketbooking.user.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Wraps the {@link User} entity to implement Spring Security's {@link UserDetails}.
 * Authorities include both {@code ROLE_xxx} strings and fine-grained permission codes.
 */
@Getter
public class CustomUserDetails implements UserDetails {

    private final UUID userId;
    private final String email;
    private final String passwordHash;
    private final boolean emailVerified;
    private final boolean accountLocked;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(User user) {
        this.userId       = user.getId();
        this.email        = user.getEmail();
        this.passwordHash = user.getPasswordHash();
        this.emailVerified = user.isEmailVerified();
        this.accountLocked = user.isLocked();
        this.authorities  = user.getRoles().stream()
                .flatMap(role -> Stream.concat(
                        Stream.of(new SimpleGrantedAuthority("ROLE_" + role.getName())),
                        role.getPermissions().stream()
                                .map(p -> new SimpleGrantedAuthority(p.getCode()))
                ))
                .collect(Collectors.toSet());
    }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public String getPassword()     { return passwordHash; }
    @Override public String getUsername()     { return email; }        // Spring Security uses this for auth
    @Override public boolean isAccountNonExpired()   { return true; }
    @Override public boolean isAccountNonLocked()    { return !accountLocked; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()     { return true; }

    /** Convenience getter — returns the wrapped User's UUID. */
    public UUID getUserId() { return userId; }
}
