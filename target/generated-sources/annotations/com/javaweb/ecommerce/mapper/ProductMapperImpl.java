package com.javaweb.ecommerce.mapper;

import com.javaweb.ecommerce.dto.record.request.ProductRequest;
import com.javaweb.ecommerce.dto.record.response.CategoryResponse;
import com.javaweb.ecommerce.dto.record.response.ProductResponse;
import com.javaweb.ecommerce.entity.Category;
import com.javaweb.ecommerce.entity.Product;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-10T20:40:24+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public Product toProduct(ProductRequest productRequest) {
        if ( productRequest == null ) {
            return null;
        }

        Product.ProductBuilder product = Product.builder();

        product.name( productRequest.name() );
        product.quantity( productRequest.quantity() );
        product.description( productRequest.description() );
        product.imageUrl( productRequest.imageUrl() );
        product.price( productRequest.price() );

        return product.build();
    }

    @Override
    public ProductResponse toProductResponse(Product product) {
        if ( product == null ) {
            return null;
        }

        ProductResponse.ProductResponseBuilder productResponse = ProductResponse.builder();

        productResponse.id( product.getId() );
        productResponse.name( product.getName() );
        productResponse.quantity( product.getQuantity() );
        productResponse.description( product.getDescription() );
        productResponse.imageUrl( product.getImageUrl() );
        productResponse.price( product.getPrice() );
        productResponse.category( categoryToCategoryResponse( product.getCategory() ) );

        return productResponse.build();
    }

    @Override
    public void updateProduct(ProductRequest productRequest, Product product) {
        if ( productRequest == null ) {
            return;
        }

        product.setName( productRequest.name() );
        product.setQuantity( productRequest.quantity() );
        product.setDescription( productRequest.description() );
        product.setImageUrl( productRequest.imageUrl() );
        product.setPrice( productRequest.price() );
    }

    protected CategoryResponse categoryToCategoryResponse(Category category) {
        if ( category == null ) {
            return null;
        }

        CategoryResponse.CategoryResponseBuilder categoryResponse = CategoryResponse.builder();

        categoryResponse.id( category.getId() );
        categoryResponse.name( category.getName() );
        categoryResponse.slug( category.getSlug() );

        return categoryResponse.build();
    }
}
