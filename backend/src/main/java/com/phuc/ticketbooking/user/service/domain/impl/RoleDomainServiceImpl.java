package com.phuc.ticketbooking.user.service.domain.impl;

import com.phuc.ticketbooking.common.exception.ApiException;
import com.phuc.ticketbooking.common.exception.ErrorCode;
import com.phuc.ticketbooking.user.entity.Role;
import com.phuc.ticketbooking.user.repository.RoleRepository;
import com.phuc.ticketbooking.user.service.domain.RoleDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoleDomainServiceImpl implements RoleDomainService {

    private final RoleRepository roleRepository;

    @Override
    public Role findByName(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new ApiException(ErrorCode.INTERNAL_ERROR,
                        "Role not found: " + name));
    }
}
