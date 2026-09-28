package com.javaweb.ecommerce.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.javaweb.ecommerce.dto.record.request.CartItemRequest;
import com.javaweb.ecommerce.dto.record.response.CartResponse;

@Service
public interface CartService {
    CartResponse getMyCart();

    CartResponse addItemToCart(CartItemRequest request);

    CartResponse updateItemQuantity(UUID itemId, Integer quantity);

    CartResponse removeItemFromCart(UUID itemId);
}
