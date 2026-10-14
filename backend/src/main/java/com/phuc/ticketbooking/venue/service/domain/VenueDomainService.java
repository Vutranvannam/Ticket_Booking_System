package com.phuc.ticketbooking.venue.service.domain;

import com.phuc.ticketbooking.venue.entity.Venue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

import com.phuc.ticketbooking.venue.entity.VenueVisibility;

public interface VenueDomainService {

    Venue findActiveVenueById(UUID venueId);

    Page<Venue> findAllActive(Pageable pageable);

    Page<Venue> findAllActive(String city, VenueVisibility visibility, Pageable pageable);

    Venue create(Venue venue);

    Venue update(UUID venueId, Venue venue);

    void softDelete(UUID venueId);
}
