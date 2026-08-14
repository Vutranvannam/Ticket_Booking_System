package com.phuc.ticketbooking.auth.service.application.impl;

import com.phuc.ticketbooking.auth.cache.UserSecurityCache;
import com.phuc.ticketbooking.auth.cache.UserSecurityCacheService;
import com.phuc.ticketbooking.auth.service.application.AuthSecurityAppService;
import com.phuc.ticketbooking.user.entity.User;
import com.phuc.ticketbooking.user.service.domain.UserDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthSecurityAppServiceImpl implements AuthSecurityAppService {

    private final UserDomainService userDomainService;
    private final UserSecurityCacheService userSecurityCacheService;

    @Override
    public UserSecurityCache getOrLoadSecurityProfile(UUID userId) {
        UserSecurityCache cache = userSecurityCacheService.getUserSecurityCache(userId);
        if (cache != null) {
            return cache;
        }

        // Cache miss — load from DB and populate
        User user = userDomainService.findActiveUserByIdWithRolesAndPermissions(userId);
        userSecurityCacheService.putUserSecurityCache(user);
        
        return userSecurityCacheService.getUserSecurityCache(userId);
    }
}
