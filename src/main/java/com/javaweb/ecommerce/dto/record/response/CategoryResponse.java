package com.javaweb.ecommerce.dto.record.response;

import java.util.UUID;

import lombok.Builder;

@Builder
public record CategoryResponse(
                UUID id,
                String name,
                String slug) {

}
