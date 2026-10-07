package com.phuc.ticketbooking.venue.dto.response;

import com.phuc.ticketbooking.venue.entity.VenueVisibility;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record VenueResponse(
        UUID id,
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
        String description,
        VenueVisibility visibility,
        Boolean active,
        Integer version,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}