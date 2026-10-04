package com.phuc.ticketbooking.venue.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "map_regions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapRegion {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "map_id", nullable = false)
    private UUID mapId;

    @Column(name = "region_type_code", nullable = false, length = 30)
    private String regionTypeCode;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "svg_element_id", nullable = false, length = 100)
    private String svgElementId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "seating_type", nullable = false, length = 30)
    private SeatingType seatingType = SeatingType.NONE;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "color_code", length = 7)
    private String colorCode;

    @Builder.Default
    @Column(name = "is_bookable", nullable = false)
    private Boolean bookable = false;

    @Builder.Default
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "properties", nullable = false, columnDefinition = "JSONB")
    private String properties;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
