package com.phuc.ticketbooking.user.entity;

import com.phuc.ticketbooking.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "is_email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    @Column(name = "security_stamp", nullable = false)
    private long securityStamp = 1L;

    @Column(name = "permission_version", nullable = false)
    private long permissionVersion = 1L;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    // ── Factory ──────────────────────────────────────────────────────────────

    public static User createNew(String email, String passwordHash, String fullName, String phone) {
        User user = new User();
        user.email = email;
        user.passwordHash = passwordHash;
        user.fullName = fullName;
        user.phone = phone;
        return user;
    }

    /** Creates an OAuth2 user (no password). */
    public static User createOAuth2User(String email, String fullName) {
        User user = new User();
        user.email = email;
        user.fullName = fullName;
        user.emailVerified = true;
        return user;
    }

    // ── Domain Methods ────────────────────────────────────────────────────────

    public void changePassword(String newPasswordHash) {
        this.passwordHash = newPasswordHash;
        this.securityStamp++;
    }

    public void changeFullName(String fullName) {
        this.fullName = fullName;
    }

    public void changePhone(String phone) {
        this.phone = phone;
    }

    public void changeAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public void markEmailVerified() {
        this.emailVerified = true;
    }

    public void addRole(Role role) {
        if (role != null) {
            this.roles.add(role);
        }
    }

    public void removeRole(Role role) {
        if (role != null) {
            this.roles.remove(role);
        }
    }

    public void increaseSecurityStamp() {
        this.securityStamp++;
    }

    public void increasePermissionVersion() {
        this.permissionVersion++;
    }

    public void softDelete() {
        this.deletedAt = Instant.now();
    }

    // ── Query Helpers ─────────────────────────────────────────────────────────

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public boolean isLocked() {
        return lockedUntil != null && lockedUntil.isAfter(Instant.now());
    }
}
