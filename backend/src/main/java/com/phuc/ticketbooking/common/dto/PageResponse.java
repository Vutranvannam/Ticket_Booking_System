package com.phuc.ticketbooking.common.dto;

import lombok.Builder;

import java.util.List;

/**
 * Generic paginated response wrapper.
 * <p>
 * Usage:
 * <pre>
 * PageResponse&lt;UserResponse&gt; page = PageResponse.of(springPage, userResponses);
 * </pre>
 *
 * @param <T> the type of items in the page
 */
@Builder
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
) {

    /**
     * Creates a PageResponse from a Spring Data Page and a pre-mapped content list.
     */
    public static <T> PageResponse<T> of(org.springframework.data.domain.Page<?> springPage, List<T> content) {
        return PageResponse.<T>builder()
                .content(content)
                .page(springPage.getNumber())
                .size(springPage.getSize())
                .totalElements(springPage.getTotalElements())
                .totalPages(springPage.getTotalPages())
                .last(springPage.isLast())
                .build();
    }
}
