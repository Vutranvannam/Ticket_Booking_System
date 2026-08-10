package com.phuc.ticketbooking.user.service.domain;

import com.phuc.ticketbooking.user.entity.Role;

/**
 * Domain Service for Role.
 */
public interface RoleDomainService {

    Role findByName(String name);
}
