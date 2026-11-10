package com.javaweb.ecommerce.mapper;

import java.math.BigDecimal;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import com.javaweb.ecommerce.dto.record.response.CartResponse;
import com.javaweb.ecommerce.entity.Cart;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = CartItemMapper.class)
public interface CartMapper {
    @Mapping(source = "items", target = "items")
    @Mapping(target = "totalPrice", expression = "java(calculateTotalPrice(cart))")
    CartResponse toCartResponse(Cart cart);

    default BigDecimal calculateTotalPrice(Cart cart) {
        return cart.getItems().stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
