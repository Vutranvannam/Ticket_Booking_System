package com.phuc.ticketbooking.venue.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "seats")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Seat {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "region_id", nullable = false)
    private UUID regionId;

    @Column(name = "seat_type_code", nullable = false, length = 30)
    private String seatTypeCode;

    @Column(name = "row_label", nullable = false, length = 10)
    private String rowLabel;

    @Column(name = "seat_number", nullable = false)
    private Integer seatNumber;

    @Column(name = "svg_element_id", nullable = false, length = 100)
    private String svgElementId;

    @Column(name = "x_coord", nullable = false, precision = 10, scale = 2)
    private BigDecimal xCoord;

    @Column(name = "y_coord", nullable = false, precision = 10, scale = 2)
    private BigDecimal yCoord;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}