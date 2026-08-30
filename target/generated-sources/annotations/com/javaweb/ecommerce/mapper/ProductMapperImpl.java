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
    date = "2026-08-30T21:40:34+0700",
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

        product.description( productRequest.description() );
        product.imageUrl( productRequest.imageUrl() );
        product.name( productRequest.name() );
        product.price( productRequest.price() );
        product.quantity( productRequest.quantity() );

        return product.build();
    }

    @Override
    public ProductResponse toProductResponse(Product product) {
        if ( product == null ) {
            return null;
        }

        ProductResponse.ProductResponseBuilder productResponse = ProductResponse.builder();

        productResponse.category( categoryToCategoryResponse( product.getCategory() ) );
        productResponse.description( product.getDescription() );
        productResponse.id( product.getId() );
        productResponse.imageUrl( product.getImageUrl() );
        productResponse.name( product.getName() );
        productResponse.price( product.getPrice() );
        productResponse.quantity( product.getQuantity() );

        return productResponse.build();
    }

    @Override
    public void updateProduct(ProductRequest productRequest, Product product) {
        if ( productRequest == null ) {
            return;
        }

        product.setDescription( productRequest.description() );
        product.setImageUrl( productRequest.imageUrl() );
        product.setName( productRequest.name() );
        product.setPrice( productRequest.price() );
        product.setQuantity( productRequest.quantity() );
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
