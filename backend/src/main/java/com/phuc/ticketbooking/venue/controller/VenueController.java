package com.phuc.ticketbooking.venue.controller;

import com.phuc.ticketbooking.auth.security.AuthenticatedSession;
import com.phuc.ticketbooking.common.constant.AppPermissions;
import com.phuc.ticketbooking.common.dto.PageResponse;
import com.phuc.ticketbooking.venue.dto.request.CreateVenueRequest;
import com.phuc.ticketbooking.venue.dto.request.UpdateVenueRequest;
import com.phuc.ticketbooking.venue.dto.response.VenueResponse;
import com.phuc.ticketbooking.venue.dto.response.VenueSummaryResponse;
import com.phuc.ticketbooking.venue.service.application.VenueAppService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

import com.phuc.ticketbooking.venue.entity.VenueVisibility;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueAppService venueAppService;

    /** GET /api/venues/{id} — get venue details. */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('" + AppPermissions.VENUE_VIEW + "')")
    public VenueResponse getById(@PathVariable UUID id) {
        return venueAppService.getById(id);
    }

    /** GET /api/venues — list venues with pagination and optional filters. */
    @GetMapping
    @PreAuthorize("hasAuthority('" + AppPermissions.VENUE_LIST + "')")
    public PageResponse<VenueSummaryResponse> getAll(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) VenueVisibility visibility,
            Pageable pageable) {
        return venueAppService.getAll(city, visibility, pageable);
    }

    /** POST /api/venues — create a venue. */
    @PostMapping
    @PreAuthorize("hasAuthority('" + AppPermissions.VENUE_CREATE + "')")
    public VenueResponse create(
            @AuthenticationPrincipal AuthenticatedSession session,
            @Valid @RequestBody CreateVenueRequest request) {
        return venueAppService.create(session != null ? session.userId() : null, request);
    }

    /** PUT /api/venues/{id} — update a venue. */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('" + AppPermissions.VENUE_UPDATE + "')")
    public VenueResponse update(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedSession session,
            @Valid @RequestBody UpdateVenueRequest request) {
        return venueAppService.update(id, session, request);
    }

    /** DELETE /api/venues/{id} — soft-delete a venue. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('" + AppPermissions.VENUE_DELETE + "')")
    public void delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedSession session) {
        venueAppService.delete(id, session);
    }
}