
package com.phuc.ticketbooking.venue.service.domain.impl;

import com.phuc.ticketbooking.common.exception.ApiException;
import com.phuc.ticketbooking.common.exception.ErrorCode;
import com.phuc.ticketbooking.venue.entity.Venue;
import com.phuc.ticketbooking.venue.repository.VenueRepository;
import com.phuc.ticketbooking.venue.service.domain.VenueDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VenueDomainServiceImpl implements VenueDomainService {

    private final VenueRepository venueRepository;

    @Override
    @Transactional(readOnly = true)
    public Venue findActiveVenueById(UUID venueId) {
        return venueRepository.findByIdAndDeletedAtIsNull(venueId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND,
                        "Venue not found: " + venueId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Venue> findAllActive(Pageable pageable) {
        return venueRepository.findAllByDeletedAtIsNull(pageable);
    }

    @Override
    @Transactional
    public Venue create(Venue venue) {
        return venueRepository.save(venue);
    }

    @Override
    @Transactional
    public Venue update(UUID venueId, Venue updatedVenue) {
        Venue existingVenue = findActiveVenueById(venueId);

        if (updatedVenue.getName() != null) {
            existingVenue.setName(updatedVenue.getName());
        }
        if (updatedVenue.getAddress() != null) {
            existingVenue.setAddress(updatedVenue.getAddress());
        }
        if (updatedVenue.getCity() != null) {
            existingVenue.setCity(updatedVenue.getCity());
        }
        if (updatedVenue.getState() != null) {
            existingVenue.setState(updatedVenue.getState());
        }
        if (updatedVenue.getCountry() != null) {
            existingVenue.setCountry(updatedVenue.getCountry());
        }
        if (updatedVenue.getZipCode() != null) {
            existingVenue.setZipCode(updatedVenue.getZipCode());
        }
        if (updatedVenue.getLatitude() != null) {
            existingVenue.setLatitude(updatedVenue.getLatitude());
        }
        if (updatedVenue.getLongitude() != null) {
            existingVenue.setLongitude(updatedVenue.getLongitude());
        }
        if (updatedVenue.getPhone() != null) {
            existingVenue.setPhone(updatedVenue.getPhone());
        }
        if (updatedVenue.getEmail() != null) {
            existingVenue.setEmail(updatedVenue.getEmail());
        }
        if (updatedVenue.getDescription() != null) {
            existingVenue.setDescription(updatedVenue.getDescription());
        }
        if (updatedVenue.getVisibility() != null) {
            existingVenue.setVisibility(updatedVenue.getVisibility());
        }

        return venueRepository.save(existingVenue);
    }

    @Override
    @Transactional
    public void softDelete(UUID venueId) {
        Venue venue = findActiveVenueById(venueId);
        venue.softDelete();
        venueRepository.save(venue);
    }
}
