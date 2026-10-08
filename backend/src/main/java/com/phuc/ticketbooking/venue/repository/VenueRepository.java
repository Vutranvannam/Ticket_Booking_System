package com.phuc.ticketbooking.venue.repository;

import com.phuc.ticketbooking.venue.entity.Venue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VenueRepository extends JpaRepository<Venue, UUID> {

    Optional<Venue> findByIdAndDeletedAtIsNull(UUID id);

    Page<Venue> findAllByDeletedAtIsNull(Pageable pageable);
}

