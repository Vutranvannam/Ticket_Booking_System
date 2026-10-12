
package com.phuc.ticketbooking.venue.service.application;

import com.phuc.ticketbooking.common.dto.PageResponse;
import com.phuc.ticketbooking.venue.dto.request.CreateVenueRequest;
import com.phuc.ticketbooking.venue.dto.request.UpdateVenueRequest;
import com.phuc.ticketbooking.venue.dto.response.VenueResponse;
import com.phuc.ticketbooking.venue.dto.response.VenueSummaryResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface VenueAppService {

    VenueResponse getById(UUID venueId);

    PageResponse<VenueSummaryResponse> getAll(Pageable pageable);

    VenueResponse create(CreateVenueRequest request);

    VenueResponse update(UUID venueId, UpdateVenueRequest request);

    void delete(UUID venueId);
}
