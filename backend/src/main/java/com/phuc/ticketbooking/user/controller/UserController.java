package com.phuc.ticketbooking.user.controller;

import com.phuc.ticketbooking.auth.security.AuthenticatedSession;
import com.phuc.ticketbooking.common.dto.PageResponse;
import com.phuc.ticketbooking.user.dto.request.UpdateProfileRequest;
import com.phuc.ticketbooking.user.dto.response.UserResponse;
import com.phuc.ticketbooking.user.service.application.UserAppService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.phuc.ticketbooking.common.constant.AppPermissions;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserAppService userAppService;

    /** GET /api/users/me — get the currently authenticated user's profile. */
    @GetMapping("/me")
    public UserResponse getMe(@AuthenticationPrincipal AuthenticatedSession principal) {
        return userAppService.getMe(principal.userId());
    }

    /** PUT /api/users/me — update the currently authenticated user's profile. */
    @PutMapping("/me")
    public UserResponse updateMe(
            @AuthenticationPrincipal AuthenticatedSession principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return userAppService.updateMe(principal.userId(), request);
    }

    /** GET /api/users — list all users (admin only). */
    @GetMapping
    @PreAuthorize("hasAuthority('" + AppPermissions.USER_LIST + "')")
    public PageResponse<UserResponse> listUsers(Pageable pageable) {
        return userAppService.listUsers(pageable);
    }
}
