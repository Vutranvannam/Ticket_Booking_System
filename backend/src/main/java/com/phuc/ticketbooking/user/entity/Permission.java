package com.phuc.ticketbooking.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Permission entity.
 * <p>
 * NOTE: Does NOT extend {@link com.phuc.ticketbooking.common.entity.BaseEntity}
 * because the {@code permissions} table has no {@code updated_at} or {@code version}
 * column — permissions are append-only, write-once data.
 */
@Entity
@Table(
        name = "permissions",
        uniqueConstraints = @UniqueConstraint(name = "uk_permissions_code", columnNames = "code")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String code;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, length = 50)
    private String module;

    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt = Instant.now();

    // ── Factory ──────────────────────────────────────────────────────────────

    public static Permission createNew(String code, String description, String module) {
        Permission permission = new Permission();
        permission.code = code;
        permission.description = description;
        permission.module = module;
        permission.createdAt = Instant.now();
        return permission;
    }
}
