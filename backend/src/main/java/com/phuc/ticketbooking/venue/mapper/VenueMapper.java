package com.phuc.ticketbooking.venue.mapper;

import com.phuc.ticketbooking.venue.dto.response.VenueResponse;
import com.phuc.ticketbooking.venue.dto.response.VenueSummaryResponse;
import com.phuc.ticketbooking.venue.entity.Venue;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class VenueMapper {

    public abstract VenueResponse toResponse(Venue venue);

    public abstract VenueSummaryResponse toSummaryResponse(Venue venue);

    protected OffsetDateTime map(Instant instant) {
        return instant == null
                ? null
                : instant.atOffset(ZoneOffset.UTC);
    }
}
