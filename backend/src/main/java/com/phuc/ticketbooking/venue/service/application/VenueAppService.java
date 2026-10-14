
package com.phuc.ticketbooking.venue.service.application;

import com.phuc.ticketbooking.common.dto.PageResponse;
import com.phuc.ticketbooking.venue.dto.request.CreateVenueRequest;
import com.phuc.ticketbooking.venue.dto.request.UpdateVenueRequest;
import com.phuc.ticketbooking.venue.dto.response.VenueResponse;
import com.phuc.ticketbooking.venue.dto.response.VenueSummaryResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

import com.phuc.ticketbooking.auth.security.AuthenticatedSession;
import com.phuc.ticketbooking.venue.entity.VenueVisibility;

public interface VenueAppService {

    VenueResponse getById(UUID venueId);

    PageResponse<VenueSummaryResponse> getAll(String city, VenueVisibility visibility, Pageable pageable);

    VenueResponse create(UUID createdBy, CreateVenueRequest request);

    VenueResponse update(UUID venueId, AuthenticatedSession session, UpdateVenueRequest request);

    void delete(UUID venueId, AuthenticatedSession session);
}
