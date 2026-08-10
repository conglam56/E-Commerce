package com.javaweb.ecommerce.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;

import com.javaweb.ecommerce.dto.record.request.ProductRequest;
import com.javaweb.ecommerce.dto.record.response.ProductResponse;
import com.javaweb.ecommerce.entity.Product;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProductMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    Product toProduct(ProductRequest productRequest);

    ProductResponse toProductResponse(Product product);

    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "category", ignore = true)
    })
    void updateProduct(ProductRequest productRequest, @MappingTarget Product product);

}
