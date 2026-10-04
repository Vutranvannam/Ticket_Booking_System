package com.phuc.ticketbooking.venue.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * RegionType entity representing predefined region categories (e.g., VIP, STANDARD, BALCONY).
 * <p>
 * Maps to the {@code region_types} table.
 * NOTE: Does NOT extend {@link com.phuc.ticketbooking.common.entity.BaseEntity}
 * because the {@code region_types} table uses {@code code} as primary key and has no {@code id},
 * {@code version}, {@code created_at}, or {@code updated_at} columns.
 */
@Entity
@Table(name = "region_types")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegionType {

    @Id
    @Column(nullable = false, length = 30)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "is_bookable_default", nullable = false)
    private boolean bookableDefault = false;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "default_seating_type", nullable = false, length = 30)
    private SeatingType defaultSeatingType = SeatingType.NONE;

    @Column(length = 50)
    private String icon;

    @Column(name = "color_default", length = 7)
    private String colorDefault;

    @Builder.Default
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @PrePersist
    @PreUpdate
    private void ensureUpperCaseCode() {
        if (this.code != null) {
            this.code = this.code.trim().toUpperCase();
        }
    }

    // ── Factory Method ────────────────────────────────────────────────────────

    public static RegionType createNew(String code, String name, SeatingType defaultSeatingType, boolean bookableDefault) {
        return RegionType.builder()
                .code(code != null ? code.trim().toUpperCase() : null)
                .name(name)
                .defaultSeatingType(defaultSeatingType != null ? defaultSeatingType : SeatingType.NONE)
                .bookableDefault(bookableDefault)
                .displayOrder(0)
                .active(true)
                .build();
    }
}
