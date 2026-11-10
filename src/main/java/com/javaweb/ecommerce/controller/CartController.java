package com.javaweb.ecommerce.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.javaweb.ecommerce.common.ApiResponse;
import com.javaweb.ecommerce.common.BaseController;
import com.javaweb.ecommerce.dto.record.request.CartItemRequest;
import com.javaweb.ecommerce.dto.record.request.UpdateCartItemRequest;
import com.javaweb.ecommerce.dto.record.response.CartResponse;
import com.javaweb.ecommerce.service.CartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController extends BaseController {
    private final CartService cartService;

    @GetMapping
    public ApiResponse<CartResponse> getMyCart() {
        return success(cartService.getMyCart());
    }

    @PostMapping("/items")
    public ApiResponse<CartResponse> addItemToCart(@Valid @RequestBody CartItemRequest request) {
        return success(cartService.addItemToCart(request));
    }

    @PutMapping("/items/{itemId}")
    public ApiResponse<CartResponse> updateItemQuantity(@PathVariable UUID itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return success(cartService.updateItemQuantity(itemId, request.quantity()));
    }

    @DeleteMapping("/items/{itemId}")
    public ApiResponse<CartResponse> removeItemFromCart(@PathVariable UUID itemId) {
        return success(cartService.removeItemFromCart(itemId));
    }
}

