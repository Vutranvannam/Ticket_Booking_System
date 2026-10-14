package com.phuc.ticketbooking.venue.repository;

import com.phuc.ticketbooking.venue.entity.Venue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

import com.phuc.ticketbooking.venue.entity.VenueVisibility;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface VenueRepository extends JpaRepository<Venue, UUID> {

    Optional<Venue> findByIdAndDeletedAtIsNull(UUID id);

    Page<Venue> findAllByDeletedAtIsNull(Pageable pageable);

    @Query("""
        SELECT v FROM Venue v
        WHERE v.deletedAt IS NULL
          AND (:city IS NULL OR LOWER(v.city) LIKE LOWER(CONCAT('%', :city, '%')))
          AND (:visibility IS NULL OR v.visibility = :visibility)
    """)
    Page<Venue> findWithFilters(
            @Param("city") String city,
            @Param("visibility") VenueVisibility visibility,
            Pageable pageable
    );
}

