package com.javaweb.ecommerce.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.javaweb.ecommerce.dto.record.request.CheckoutRequest;
import com.javaweb.ecommerce.dto.record.response.OrderResponse;
import com.javaweb.ecommerce.entity.Cart;
import com.javaweb.ecommerce.entity.CartItem;
import com.javaweb.ecommerce.entity.Order;
import com.javaweb.ecommerce.entity.OrderItem;
import com.javaweb.ecommerce.entity.Product;
import com.javaweb.ecommerce.entity.User;
import com.javaweb.ecommerce.entity.enums.OrderStatus;
import com.javaweb.ecommerce.exception.EmptyCartException;
import com.javaweb.ecommerce.exception.InsufficientStockException;
import com.javaweb.ecommerce.exception.InvalidOrderStateException;
import com.javaweb.ecommerce.exception.ResourceNotFoundException;
import com.javaweb.ecommerce.mapper.OrderMapper;
import com.javaweb.ecommerce.repository.CartRepository;
import com.javaweb.ecommerce.repository.OrderRepository;
import com.javaweb.ecommerce.repository.ProductRepository;
import com.javaweb.ecommerce.service.OrderService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final OrderMapper orderMapper;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
    }

    private boolean isCurrentUserAdmin() {
        return getCurrentUser().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse checkout(CheckoutRequest request) {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser_Id(user.getId())
                .orElseThrow(EmptyCartException::new);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new EmptyCartException();
        }

        Order order = Order.builder()
                .user(user)
                .receiverName(request.receiverName())
                .phoneNumber(request.phoneNumber())
                .shippingAddress(request.shippingAddress())
                .paymentMethod(request.paymentMethod())
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem item : cart.getItems()) {
            // Re-fetch product to ensure managed state and latest @Version check
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", item.getProduct().getId()));

            if (product.getQuantity() < item.getQuantity()) {
                throw new InsufficientStockException(product.getName(), product.getQuantity());
            }

            // Deduct inventory (optimistic lock updates @Version upon commit/flush)
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(item.getQuantity())
                    .price(product.getPrice())
                    .build();

            order.addItem(orderItem);
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        // Clear cart after checkout
        cart.getItems().clear();
        cartRepository.save(cart);

        return orderMapper.toResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getMyOrders() {
        User user = getCurrentUser();
        return orderRepository.findByUser_IdOrderByCreatedAtDesc(user.getId()).stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Override
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findWithDetailsById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", orderId));

        User currentUser = getCurrentUser();
        if (!order.getUser().getId().equals(currentUser.getId()) && !isCurrentUserAdmin()) {
            throw new AccessDeniedException("Bạn không có quyền xem đơn hàng này");
        }

        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse cancelOrder(UUID orderId) {
        Order order = orderRepository.findWithDetailsById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", orderId));

        User currentUser = getCurrentUser();
        if (!order.getUser().getId().equals(currentUser.getId()) && !isCurrentUserAdmin()) {
            throw new AccessDeniedException("Bạn không có quyền thao tác trên đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new InvalidOrderStateException(
                    "Chỉ có thể hủy đơn hàng ở trạng thái PENDING. Trạng thái hiện tại: " + order.getStatus());
        }

        // Refund inventory
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order updatedOrder = orderRepository.save(order);

        return orderMapper.toResponse(updatedOrder);
    }

    @Override
    public Page<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable) {
        Page<Order> orders = (status != null)
                ? orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                : orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        return orders.map(orderMapper::toResponse);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        Order order = orderRepository.findWithDetailsById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", orderId));

        OrderStatus currentStatus = order.getStatus();

        if (currentStatus == OrderStatus.DELIVERED) {
            throw new InvalidOrderStateException("Đơn hàng đã giao thành công, không thể thay đổi trạng thái");
        }

        if (currentStatus == OrderStatus.CANCELLED) {
            throw new InvalidOrderStateException("Đơn hàng đã bị hủy, không thể thay đổi trạng thái");
        }

        if (newStatus == OrderStatus.CANCELLED) {
            // Refund stock if cancelled by admin
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setQuantity(product.getQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        return orderMapper.toResponse(updatedOrder);
    }
}
