package com.javaweb.ecommerce.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import com.javaweb.ecommerce.dto.record.response.CartResponse;
import com.javaweb.ecommerce.entity.Cart;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = CartItemMapper.class)
public interface CartMapper {
    @Mapping(source = "items", target = "items")
    CartResponse toCartResponse(Cart cart);
}
