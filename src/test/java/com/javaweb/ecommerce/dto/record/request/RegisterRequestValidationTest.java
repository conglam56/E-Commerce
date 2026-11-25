package com.javaweb.ecommerce.dto.record.request;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class RegisterRequestValidationTest {

    private static final ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory();
    private static final Validator validator = validatorFactory.getValidator();

    @AfterAll
    static void closeValidatorFactory() {
        validatorFactory.close();
    }

    @ParameterizedTest
    @ValueSource(strings = { "", "a", "12345" })
    void rejectsPasswordsShorterThanSixCharacters(String password) {
        RegisterRequest request = new RegisterRequest("Nguyễn Văn An", "customer@example.com", password, password);

        assertTrue(validator.validate(request).stream()
                .anyMatch(violation -> violation.getPropertyPath().toString().equals("password")));
    }

    @Test
    void acceptsPasswordWithExactlySixCharacters() {
        RegisterRequest request = new RegisterRequest("Nguyễn Văn An", "customer@example.com", "123456", "123456");

        assertTrue(validator.validate(request).isEmpty());
    }
}
