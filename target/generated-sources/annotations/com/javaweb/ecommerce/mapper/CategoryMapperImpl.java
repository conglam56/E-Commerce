package com.javaweb.ecommerce.mapper;

import com.javaweb.ecommerce.dto.record.request.CategoryRequest;
import com.javaweb.ecommerce.dto.record.response.CategoryResponse;
import com.javaweb.ecommerce.entity.Category;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-10T20:40:24+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class CategoryMapperImpl implements CategoryMapper {

    @Override
    public Category toCategory(CategoryRequest categoryRequest) {
        if ( categoryRequest == null ) {
            return null;
        }

        Category.CategoryBuilder category = Category.builder();

        category.name( categoryRequest.name() );
        category.slug( categoryRequest.slug() );

        return category.build();
    }

    @Override
    public CategoryResponse toCategoryResponse(Category category) {
        if ( category == null ) {
            return null;
        }

        CategoryResponse.CategoryResponseBuilder categoryResponse = CategoryResponse.builder();

        categoryResponse.id( category.getId() );
        categoryResponse.name( category.getName() );
        categoryResponse.slug( category.getSlug() );

        return categoryResponse.build();
    }

    @Override
    public void updateCategory(CategoryRequest categoryRequest, Category category) {
        if ( categoryRequest == null ) {
            return;
        }

        category.setName( categoryRequest.name() );
        category.setSlug( categoryRequest.slug() );
    }
}
