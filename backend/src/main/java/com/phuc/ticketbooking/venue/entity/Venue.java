package com.phuc.ticketbooking.venue.entity;

import com.phuc.ticketbooking.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "venues")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Venue extends BaseEntity {

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "country", nullable = false, length = 100)
    private String country;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 20)
    private VenueVisibility visibility = VenueVisibility.PRIVATE;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Version
    @Builder.Default
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    // ── Domain Methods ────────────────────────────────────────────────────────

    public void update(
            String name,
            String address,
            String city,
            String state,
            String country,
            String zipCode,
            BigDecimal latitude,
            BigDecimal longitude,
            String phone,
            String email,
            String description
    ) {
        this.name = name;
        this.address = address;
        this.city = city;
        this.state = state;
        this.country = country;
        this.zipCode = zipCode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.phone = phone;
        this.email = email;
        this.description = description;
    }

    public void changeVisibility(VenueVisibility newVisibility) {
        this.visibility = newVisibility;
    }

    public void softDelete() {
        this.deletedAt = Instant.now();
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }

    // ── Query Helpers ─────────────────────────────────────────────────────────

    public boolean isDeleted() {
        return this.deletedAt != null;
    }

    public boolean isPublic() {
        return this.visibility == VenueVisibility.PUBLIC;
    }

    public boolean isPrivate() {
        return this.visibility == VenueVisibility.PRIVATE;
    }
}
