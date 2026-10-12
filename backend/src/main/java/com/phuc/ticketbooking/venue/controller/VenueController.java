package com.phuc.ticketbooking.venue.controller;

import com.phuc.ticketbooking.venue.service.application.VenueAppService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueAppService venueAppService;

}