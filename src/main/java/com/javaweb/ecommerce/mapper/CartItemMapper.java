package com.javaweb.ecommerce.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Mappings;

import com.javaweb.ecommerce.dto.record.response.CartItemResponse;
import com.javaweb.ecommerce.entity.CartItem;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CartItemMapper {
    @Mappings({
            @Mapping(source = "product.id", target = "productId"),
            @Mapping(source = "product.name", target = "productName"),
            @Mapping(source = "product.price", target = "productPrice")
    })
    CartItemResponse toResponse(CartItem item);

}
