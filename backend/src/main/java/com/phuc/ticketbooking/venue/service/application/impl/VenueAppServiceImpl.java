
package com.phuc.ticketbooking.venue.service.application.impl;

import com.phuc.ticketbooking.common.dto.PageResponse;
import com.phuc.ticketbooking.venue.dto.request.CreateVenueRequest;
import com.phuc.ticketbooking.venue.dto.request.UpdateVenueRequest;
import com.phuc.ticketbooking.venue.dto.response.VenueResponse;
import com.phuc.ticketbooking.venue.dto.response.VenueSummaryResponse;
import com.phuc.ticketbooking.venue.entity.Venue;
import com.phuc.ticketbooking.venue.mapper.VenueMapper;
import com.phuc.ticketbooking.venue.service.application.VenueAppService;
import com.phuc.ticketbooking.venue.service.domain.VenueDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import com.phuc.ticketbooking.auth.security.AuthenticatedSession;
import com.phuc.ticketbooking.common.exception.ApiException;
import com.phuc.ticketbooking.common.exception.ErrorCode;
import com.phuc.ticketbooking.venue.entity.VenueVisibility;

@Service
@RequiredArgsConstructor
public class VenueAppServiceImpl implements VenueAppService {

    private final VenueDomainService venueDomainService;
    private final VenueMapper venueMapper;

    @Override
    @Transactional(readOnly = true)
    public VenueResponse getById(UUID venueId) {
        Venue venue = venueDomainService.findActiveVenueById(venueId);
        return venueMapper.toResponse(venue);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<VenueSummaryResponse> getAll(String city, VenueVisibility visibility, Pageable pageable) {
        Page<Venue> venuePage = venueDomainService.findAllActive(city, visibility, pageable);
        var content = venuePage.getContent().stream()
                .map(venueMapper::toSummaryResponse)
                .toList();
        return PageResponse.of(venuePage, content);
    }

    @Override
    @Transactional
    public VenueResponse create(UUID createdBy, CreateVenueRequest request) {
        Venue venue = Venue.builder()
                .createdBy(createdBy)
                .name(request.name())
                .address(request.address())
                .city(request.city())
                .state(request.state())
                .country(request.country())
                .zipCode(request.zipCode())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .phone(request.phone())
                .email(request.email())
                .description(request.description())
                .visibility(request.visibility() != null
                        ? request.visibility()
                        : com.phuc.ticketbooking.venue.entity.VenueVisibility.PRIVATE)
                .build();

        Venue savedVenue = venueDomainService.create(venue);
        return venueMapper.toResponse(savedVenue);
    }

    @Override
    @Transactional
    public VenueResponse update(UUID venueId, AuthenticatedSession session, UpdateVenueRequest request) {
        Venue existing = venueDomainService.findActiveVenueById(venueId);
        checkOwnershipOrAdmin(existing, session);

        Venue updatedVenue = Venue.builder()
                .name(request.name())
                .address(request.address())
                .city(request.city())
                .state(request.state())
                .country(request.country())
                .zipCode(request.zipCode())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .phone(request.phone())
                .email(request.email())
                .description(request.description())
                .visibility(request.visibility())
                .build();

        Venue savedVenue = venueDomainService.update(venueId, updatedVenue);
        return venueMapper.toResponse(savedVenue);
    }

    @Override
    @Transactional
    public void delete(UUID venueId, AuthenticatedSession session) {
        Venue existing = venueDomainService.findActiveVenueById(venueId);
        checkOwnershipOrAdmin(existing, session);
        venueDomainService.softDelete(venueId);
    }

    private void checkOwnershipOrAdmin(Venue venue, AuthenticatedSession session) {
        if (session == null) {
            throw new ApiException(ErrorCode.UNAUTHORIZED, "Authentication required");
        }

        // Check if user has ADMIN or SUPER_ADMIN role
        boolean isAdmin = session.userSecurity().authorities().stream()
                .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ROLE_SUPER_ADMIN"));

        if (!isAdmin) {
            // Organizer can only manage their own venues
            if (venue.getCreatedBy() == null || !venue.getCreatedBy().equals(session.userId())) {
                throw new ApiException(ErrorCode.ACCESS_DENIED, "You can only modify or delete venues you created");
            }
        }
    }
}
