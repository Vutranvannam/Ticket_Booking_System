package com.phuc.ticketbooking.venue.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "region_maps")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegionMap {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "region_id", nullable = false)
    private UUID regionId;

    @Column(name = "name", length = 200)
    private String name;

    @Column(name = "svg_content", nullable = false, columnDefinition = "TEXT")
    private String svgContent;

    @Column(name = "view_box", nullable = false, length = 100)
    private String viewBox;

    @Builder.Default
    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats = 0;

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
