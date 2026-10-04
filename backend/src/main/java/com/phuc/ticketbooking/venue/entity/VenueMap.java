package com.phuc.ticketbooking.venue.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "venue_maps")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueMap {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "venue_id", nullable = false)
    private UUID venueId;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "svg_content", columnDefinition = "TEXT")
    private String svgContent;

    @Column(name = "view_box", nullable = false, length = 100)
    private String viewBox;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 20)
    private VenueVisibility visibility = VenueVisibility.PRIVATE;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private VenueMapStatus status = VenueMapStatus.DRAFT;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Builder.Default
    @Version
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
