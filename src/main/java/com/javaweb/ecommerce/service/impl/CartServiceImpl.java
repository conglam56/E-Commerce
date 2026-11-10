package com.javaweb.ecommerce.service.impl;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.javaweb.ecommerce.dto.record.request.CartItemRequest;
import com.javaweb.ecommerce.dto.record.response.CartResponse;
import com.javaweb.ecommerce.entity.Cart;
import com.javaweb.ecommerce.entity.CartItem;
import com.javaweb.ecommerce.entity.Product;
import com.javaweb.ecommerce.entity.User;
import com.javaweb.ecommerce.exception.InsufficientStockException;
import com.javaweb.ecommerce.mapper.CartMapper;
import com.javaweb.ecommerce.repository.CartRepository;
import com.javaweb.ecommerce.repository.ProductRepository;
import com.javaweb.ecommerce.service.CartService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CartMapper cartMapper;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
    }

    @Override
    public CartResponse addItemToCart(CartItemRequest request) {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser_Id(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm không hợp lệ"));
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId())).findFirst();
        int totalQuantity = request.quantity();
        if (existingItem.isEmpty()){
                if(totalQuantity <= product.getQuantity()){
                        cart.addItem(CartItem.builder().product(product).quantity(request.quantity()).build());
                }
                else throw new InsufficientStockException(product.getName(), product.getQuantity());
        }
            
        else {
                CartItem item = existingItem.get();
                totalQuantity += item.getQuantity();
                if(totalQuantity <= product.getQuantity()){
                        item.setQuantity(totalQuantity);
                }
                else throw new InsufficientStockException(product.getName(), product.getQuantity());
        }
        cartRepository.save(cart);
        return cartMapper.toCartResponse(cart);
    }

    @Override
    public CartResponse getMyCart() {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser_Id(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
        return cartMapper.toCartResponse(cart);
    }

    @Override
    public CartResponse removeItemFromCart(UUID itemId) {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser_Id(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
        CartItem item = cart.getItems().stream().filter(i -> i.getId().equals(itemId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        cart.getItems().remove(item);
        cartRepository.save(cart);
        return cartMapper.toCartResponse(cart);
    }

    @Override
    public CartResponse updateItemQuantity(UUID itemId, Integer quantity) {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser_Id(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
        CartItem item = cart.getItems().stream().filter(i -> i.getId().equals(itemId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            Product product = item.getProduct();
            if (quantity > product.getQuantity())
                throw new InsufficientStockException(product.getName(), product.getQuantity());
            item.setQuantity(quantity);
        }
        cartRepository.save(cart);
        return cartMapper.toCartResponse(cart);
    }
}
