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

@Entity
@Table(name = "region_types")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegionType {

    @Id
    @Column(name = "code", nullable = false, length = 30)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "is_bookable_default", nullable = false)
    private Boolean bookableDefault = false;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "default_seating_type", nullable = false, length = 30)
    private SeatingType defaultSeatingType = SeatingType.NONE;

    @Column(name = "icon", length = 50)
    private String icon;

    @Column(name = "color_default", length = 7)
    private String colorDefault;

    @Builder.Default
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean active = true;
}
