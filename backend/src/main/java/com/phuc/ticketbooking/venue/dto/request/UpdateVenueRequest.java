package com.phuc.ticketbooking.venue.dto.request;

import com.phuc.ticketbooking.venue.entity.VenueVisibility;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateVenueRequest(

        @Size(max = 200)
        String name,

        String address,

        @Size(max = 100)
        String city,

        @Size(max = 100)
        String state,

        @Size(max = 100)
        String country,

        @Size(max = 20)
        String zipCode,

        BigDecimal latitude,

        BigDecimal longitude,

        @Size(max = 20)
        String phone,

        @Email
        @Size(max = 255)
        String email,

        String description,

        VenueVisibility visibility
) {
}