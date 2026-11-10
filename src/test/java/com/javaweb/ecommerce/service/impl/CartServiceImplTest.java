package com.javaweb.ecommerce.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import com.javaweb.ecommerce.dto.record.request.CartItemRequest;
import com.javaweb.ecommerce.dto.record.response.CartResponse;
import com.javaweb.ecommerce.entity.Cart;
import com.javaweb.ecommerce.entity.CartItem;
import com.javaweb.ecommerce.entity.Product;
import com.javaweb.ecommerce.entity.User;
import com.javaweb.ecommerce.exception.InsufficientStockException;
import com.javaweb.ecommerce.exception.ResourceNotFoundException;
import com.javaweb.ecommerce.mapper.CartMapper;
import com.javaweb.ecommerce.mapper.CartMapperImpl;
import com.javaweb.ecommerce.mapper.CartItemMapperImpl;
import com.javaweb.ecommerce.repository.CartRepository;
import com.javaweb.ecommerce.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock
    private CartRepository cartRepository;
    @Mock
    private ProductRepository productRepository;

    private CartServiceImpl cartService;

    private User user;
    private Cart cart;
    private Product iphone;
    private Product laptop;

    @BeforeEach
    void setUp() {
        CartMapper cartMapper = new CartMapperImpl();
        ReflectionTestUtils.setField(cartMapper, "cartItemMapper", new CartItemMapperImpl());
        cartService = new CartServiceImpl(cartRepository, productRepository, cartMapper);

        user = new User();
        user.setId(UUID.randomUUID());
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(user, null));

        cart = Cart.builder().id(UUID.randomUUID()).user(user).build();
        iphone = Product.builder().id(UUID.randomUUID()).name("iPhone")
                .price(new BigDecimal("1000")).quantity(5).build();
        laptop = Product.builder().id(UUID.randomUUID()).name("Laptop")
                .price(new BigDecimal("2000")).quantity(3).build();

        when(cartRepository.findByUser_Id(user.getId())).thenReturn(Optional.of(cart));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void addTwoProducts_totalPriceIsCorrect() {
        when(productRepository.findById(iphone.getId())).thenReturn(Optional.of(iphone));
        when(productRepository.findById(laptop.getId())).thenReturn(Optional.of(laptop));
        when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));

        cartService.addItemToCart(new CartItemRequest(iphone.getId(), 2));
        CartResponse response = cartService.addItemToCart(new CartItemRequest(laptop.getId(), 1));

        assertEquals(2, response.items().size());
        assertEquals(0, new BigDecimal("4000").compareTo(response.totalPrice()));
    }

    @Test
    void addSameProductTwice_quantityAccumulates() {
        when(productRepository.findById(iphone.getId())).thenReturn(Optional.of(iphone));
        when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));

        cartService.addItemToCart(new CartItemRequest(iphone.getId(), 2));
        CartResponse response = cartService.addItemToCart(new CartItemRequest(iphone.getId(), 3));

        assertEquals(1, response.items().size());
        assertEquals(5, response.items().get(0).quantity());
    }

    @Test
    void addMoreThanStock_throwsInsufficientStock() {
        when(productRepository.findById(iphone.getId())).thenReturn(Optional.of(iphone));

        assertThrows(InsufficientStockException.class,
                () -> cartService.addItemToCart(new CartItemRequest(iphone.getId(), 6)));
        assertTrue(cart.getItems().isEmpty());
    }

    @Test
    void addAccumulatedMoreThanStock_throwsInsufficientStock() {
        cart.addItem(CartItem.builder().id(UUID.randomUUID()).product(iphone).quantity(4).build());
        when(productRepository.findById(iphone.getId())).thenReturn(Optional.of(iphone));

        assertThrows(InsufficientStockException.class,
                () -> cartService.addItemToCart(new CartItemRequest(iphone.getId(), 2)));
        assertEquals(4, cart.getItems().get(0).getQuantity());
    }

    @Test
    void updateQuantityToZero_removesItem() {
        UUID itemId = UUID.randomUUID();
        cart.addItem(CartItem.builder().id(itemId).product(iphone).quantity(2).build());
        when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));

        CartResponse response = cartService.updateItemQuantity(itemId, 0);

        assertTrue(response.items().isEmpty());
        assertEquals(0, BigDecimal.ZERO.compareTo(response.totalPrice()));
    }

    @Test
    void updateQuantityMoreThanStock_throwsInsufficientStock() {
        UUID itemId = UUID.randomUUID();
        cart.addItem(CartItem.builder().id(itemId).product(iphone).quantity(2).build());

        assertThrows(InsufficientStockException.class,
                () -> cartService.updateItemQuantity(itemId, 10));
        assertEquals(2, cart.getItems().get(0).getQuantity());
    }

    @Test
    void addItem_productNotFound_throwsResourceNotFound() {
        UUID nonExistentProductId = UUID.randomUUID();
        when(productRepository.findById(nonExistentProductId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> cartService.addItemToCart(new CartItemRequest(nonExistentProductId, 1)));
    }

    @Test
    void updateQuantity_itemNotFound_throwsResourceNotFound() {
        UUID nonExistentItemId = UUID.randomUUID();

        assertThrows(ResourceNotFoundException.class,
                () -> cartService.updateItemQuantity(nonExistentItemId, 3));
    }

    @Test
    void removeItem_itemNotFound_throwsResourceNotFound() {
        UUID nonExistentItemId = UUID.randomUUID();

        assertThrows(ResourceNotFoundException.class,
                () -> cartService.removeItemFromCart(nonExistentItemId));
    }
}
