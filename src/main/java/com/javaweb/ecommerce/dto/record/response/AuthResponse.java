package com.javaweb.ecommerce.dto.record.response;

import lombok.Builder;

@Builder
public record AuthResponse(
        String token) {

}
