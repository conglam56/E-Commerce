package com.javaweb.ecommerce.dto.record.request;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.core.MethodParameter;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import com.javaweb.ecommerce.common.ApiResponse;
import com.javaweb.ecommerce.controller.ProductController;
import com.javaweb.ecommerce.exception.GlobalExceptionHandler;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class ProductRequestValidationTest {

    private static final ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory();
    private static final Validator validator = validatorFactory.getValidator();

    @AfterAll
    static void closeValidatorFactory() {
        validatorFactory.close();
    }

    @Test
    void acceptsZeroQuantityForOutOfStockProduct() {
        ProductRequest request = new ProductRequest(
                "Tai nghe QA",
                0,
                "Mô tả",
                "/catalog/photos/sony-wh-1000xm3.webp",
                new BigDecimal("1500000"),
                UUID.randomUUID());

        assertTrue(validator.validate(request).isEmpty());
    }

    @Test
    void acceptsPositiveQuantityAndPrice() {
        ProductRequest request = new ProductRequest(
                "Tai nghe QA",
                10,
                "Mô tả",
                "/catalog/photos/sony-wh-1000xm3.webp",
                new BigDecimal("1500000"),
                UUID.randomUUID());

        assertTrue(validator.validate(request).isEmpty());
    }

    @Test
    void rejectsNegativeQuantity() {
        ProductRequest request = new ProductRequest(
                "Tai nghe QA",
                -1,
                "Mô tả",
                "/catalog/photos/sony-wh-1000xm3.webp",
                new BigDecimal("1500000"),
                UUID.randomUUID());

        assertTrue(validator.validate(request).stream()
                .anyMatch(violation -> violation.getPropertyPath().toString().equals("quantity")));
    }

    @ParameterizedTest
    @ValueSource(strings = { "0", "-1", "-100000" })
    void rejectsZeroOrNegativePrice(String priceValue) {
        ProductRequest request = new ProductRequest(
                "Tai nghe QA",
                10,
                "Mô tả",
                "/catalog/photos/sony-wh-1000xm3.webp",
                new BigDecimal(priceValue),
                UUID.randomUUID());

        assertTrue(validator.validate(request).stream()
                .anyMatch(violation -> violation.getPropertyPath().toString().equals("price")));
    }

    @ParameterizedTest
    @ValueSource(strings = { "", "   " })
    void rejectsBlankName(String name) {
        ProductRequest request = new ProductRequest(
                name,
                10,
                "Mô tả",
                "/catalog/photos/sony-wh-1000xm3.webp",
                new BigDecimal("1500000"),
                UUID.randomUUID());

        assertTrue(validator.validate(request).stream()
                .anyMatch(violation -> violation.getPropertyPath().toString().equals("name")));
    }

    @Test
    void rejectsNullCategoryId() {
        ProductRequest request = new ProductRequest(
                "Tai nghe QA",
                10,
                "Mô tả",
                "/catalog/photos/sony-wh-1000xm3.webp",
                new BigDecimal("1500000"),
                null);

        assertEquals(1, validator.validate(request).stream()
                .filter(violation -> violation.getPropertyPath().toString().equals("categoryId"))
                .count());
    }

    @Test
    void validationExceptionHandlerReturnsVietnameseSummaryAndFieldErrors() throws NoSuchMethodException {
        ProductRequest invalidRequest = new ProductRequest("", -1, null, null, BigDecimal.ZERO, null);
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(invalidRequest, "productRequest");
        bindingResult.addError(new FieldError("productRequest", "name", "Tên sản phẩm không được để trống!"));
        bindingResult.addError(new FieldError("productRequest", "price", "Giá tiền phải là số dương"));

        Method method = ProductController.class.getMethod("createProduct", ProductRequest.class);
        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(
                new MethodParameter(method, 0), bindingResult);

        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        ApiResponse<Map<String, String>> response = handler.handleValidationExceptions(exception);

        assertEquals(400, response.code());
        assertEquals("Dữ liệu nhập vào chưa hợp lệ. Vui lòng kiểm tra lại các trường báo lỗi.", response.message());
        assertNotNull(response.data());
        assertEquals("Tên sản phẩm không được để trống!", response.data().get("name"));
        assertEquals("Giá tiền phải là số dương", response.data().get("price"));
    }
}
