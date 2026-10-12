
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
    public PageResponse<VenueSummaryResponse> getAll(Pageable pageable) {
        Page<Venue> venuePage = venueDomainService.findAllActive(pageable);

        return new PageResponse<>(
                venuePage.getContent().stream()
                        .map(venueMapper::toSummaryResponse)
                        .toList(),
                venuePage.getNumber(),
                venuePage.getSize(),
                venuePage.getTotalElements(),
                venuePage.getTotalPages(),
                venuePage.isLast());
    }

    @Override
    @Transactional
    public VenueResponse create(CreateVenueRequest request) {
        Venue venue = Venue.builder()
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
    public VenueResponse update(UUID venueId, UpdateVenueRequest request) {
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
    public void delete(UUID venueId) {
        venueDomainService.softDelete(venueId);
    }
}
