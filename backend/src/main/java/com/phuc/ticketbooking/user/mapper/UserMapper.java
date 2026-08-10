package com.phuc.ticketbooking.user.mapper;

import com.phuc.ticketbooking.user.dto.response.UserResponse;
import com.phuc.ticketbooking.user.entity.Role;
import com.phuc.ticketbooking.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "roles", source = "roles", qualifiedByName = "mapRoles")
    @Mapping(target = "permissions", source = "roles", qualifiedByName = "mapPermissions")
    @Mapping(target = "isEmailVerified", source = "emailVerified")
    UserResponse toResponse(User user);

    @Named("mapRoles")
    default Set<String> mapRoles(Set<Role> roles) {
        if (roles == null)
            return Set.of();
        return roles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }

    @Named("mapPermissions")
    default Set<String> mapPermissions(Set<Role> roles) {
        if (roles == null)
            return Set.of();
        return roles.stream()
                .flatMap(role -> role.getPermissions() == null
                        ? java.util.stream.Stream.empty()
                        : role.getPermissions().stream())
                .map(p -> p.getCode())
                .collect(Collectors.toSet());
    }
}
