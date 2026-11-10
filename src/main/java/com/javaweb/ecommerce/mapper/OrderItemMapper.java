package com.javaweb.ecommerce.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Mappings;

import com.javaweb.ecommerce.dto.record.response.OrderItemResponse;
import com.javaweb.ecommerce.entity.OrderItem;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface OrderItemMapper {

    @Mappings({
            @Mapping(source = "product.id", target = "productId"),
            @Mapping(source = "product.name", target = "productName"),
            @Mapping(source = "product.imageUrl", target = "productImageUrl")
    })
    OrderItemResponse toResponse(OrderItem item);
}

