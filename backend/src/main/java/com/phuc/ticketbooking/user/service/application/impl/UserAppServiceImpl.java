package com.phuc.ticketbooking.user.service.application.impl;

import com.phuc.ticketbooking.common.dto.PageResponse;
import com.phuc.ticketbooking.user.dto.request.UpdateProfileRequest;
import com.phuc.ticketbooking.user.dto.response.UserResponse;
import com.phuc.ticketbooking.user.entity.User;
import com.phuc.ticketbooking.user.mapper.UserMapper;
import com.phuc.ticketbooking.user.service.application.UserAppService;
import com.phuc.ticketbooking.user.service.domain.UserDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserAppServiceImpl implements UserAppService {

    private final UserDomainService userDomainService;
    private final UserMapper userMapper;

    @Override
    public UserResponse getMe(UUID userId) {
        User user = userDomainService.findActiveUserByIdWithRolesAndPermissions(userId);
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse updateMe(UUID userId, UpdateProfileRequest request) {
        User user = userDomainService.findActiveUserByIdWithRolesAndPermissions(userId);

        if (request.fullName() != null) {
            user.changeFullName(request.fullName());
        }
        if (request.phone() != null) {
            user.changePhone(request.phone());
        }
        if (request.avatarUrl() != null) {
            user.changeAvatarUrl(request.avatarUrl());
        }

        user = userDomainService.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    public PageResponse<UserResponse> listUsers(Pageable pageable) {
        Page<User> page = userDomainService.findAllActive(pageable);
        List<UserResponse> content = page.getContent().stream()
                .map(userMapper::toResponse)
                .toList();
        return PageResponse.of(page, content);
    }
}
