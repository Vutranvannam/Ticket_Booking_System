package com.phuc.ticketbooking.venue.dto.response;

import com.phuc.ticketbooking.venue.entity.VenueVisibility;

import java.util.UUID;

public record VenueSummaryResponse(
        UUID id,
        String name,
        String city,
        String state,
        String country,
        VenueVisibility visibility,
        Boolean active) {
}
