package com.javaweb.ecommerce.service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.javaweb.ecommerce.config.VnpayConfig;
import com.javaweb.ecommerce.entity.Order;
import com.javaweb.ecommerce.entity.OrderItem;
import com.javaweb.ecommerce.entity.User;
import com.javaweb.ecommerce.entity.enums.OrderStatus;
import com.javaweb.ecommerce.entity.enums.PaymentMethod;
import com.javaweb.ecommerce.entity.enums.PaymentStatus;
import com.javaweb.ecommerce.exception.ResourceNotFoundException;
import com.javaweb.ecommerce.repository.OrderRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VnpayPayments {
    private static final DateTimeFormatter VNPAY_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final ZoneId VNPAY_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private final OrderRepository orders;
    private final VnpayConfig config;
    private final VnpaySignature signature;

    public void requireAvailable(PaymentMethod method) {
        if (method == PaymentMethod.VNPAY && !config.available())
            throw new IllegalArgumentException("Thanh toán VNPay Sandbox chưa được cấu hình.");
    }

    @Transactional(readOnly = true)
    public String paymentUrl(UUID id, User user, String ipAddress) {
        requireAvailable(PaymentMethod.VNPAY);
        Order order = orders.findById(id).orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", id));
        if (!order.getUser().getId().equals(user.getId())) throw new AccessDeniedException("Order unavailable");
        if (order.getPaymentMethod() != PaymentMethod.VNPAY || order.getStatus() != OrderStatus.PENDING
                || order.getPaymentStatus() != PaymentStatus.UNPAID
                || !order.getPaymentExpiresAt().isAfter(now()))
            throw new IllegalArgumentException("Đơn hàng không còn chờ thanh toán. Hãy làm mới danh sách đơn.");
        Map<String, String> parameters = new HashMap<>();
        parameters.put("vnp_Version", "2.1.0");
        parameters.put("vnp_Command", "pay");
        parameters.put("vnp_TmnCode", config.getTmnCode());
        parameters.put("vnp_Amount", order.getTotalAmount().movePointRight(2).toBigIntegerExact().toString());
        parameters.put("vnp_CurrCode", "VND");
        parameters.put("vnp_TxnRef", id.toString().replace("-", ""));
        parameters.put("vnp_OrderInfo", "Thanh toan don hang " + id);
        parameters.put("vnp_OrderType", "other");
        parameters.put("vnp_Locale", "vn");
        parameters.put("vnp_ReturnUrl", config.getPublicUrl().replaceAll("/+$", "") + "/orders");
        parameters.put("vnp_IpAddr", ipAddress);
        parameters.put("vnp_CreateDate", providerTime(order.getPaymentExpiresAt().minusMinutes(15)));
        parameters.put("vnp_ExpireDate", providerTime(order.getPaymentExpiresAt()));
        return "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?" + signature.query(parameters)
                + "&vnp_SecureHash=" + signature.sign(parameters);
    }

    @Transactional
    public Map<String, String> notify(Map<String, String> parameters) {
        if (!signature.valid(parameters)) return reply("97", "Invalid signature");
        String reference = parameters.getOrDefault("vnp_TxnRef", "");
        if (!reference.matches("[a-fA-F0-9]{32}")) return reply("01", "Order not found");
        UUID id = UUID.fromString(reference.replaceFirst(
                "(.{8})(.{4})(.{4})(.{4})(.{12})", "$1-$2-$3-$4-$5"));
        Order order = orders.findLockedById(id).orElse(null);
        if (order == null || order.getPaymentMethod() != PaymentMethod.VNPAY) return reply("01", "Order not found");
        String amount = order.getTotalAmount().movePointRight(2).toBigIntegerExact().toString();
        if (!amount.equals(parameters.get("vnp_Amount"))) return reply("04", "Invalid amount");
        if (order.getPaymentStatus() == PaymentStatus.PAID || order.getPaymentStatus() == PaymentStatus.REVIEW
                || order.getPaymentStatus() == PaymentStatus.FAILED)
            return reply("02", "Order already confirmed");
        boolean success = "00".equals(parameters.get("vnp_ResponseCode"))
                && "00".equals(parameters.get("vnp_TransactionStatus"));
        if (parameters.get("vnp_ResponseCode") == null || parameters.get("vnp_TransactionStatus") == null)
            return reply("99", "Missing payment result");
        if (success) {
            String transaction = parameters.getOrDefault("vnp_TransactionNo", "");
            if (!transaction.matches("[0-9]{1,64}") || !parameters.getOrDefault("vnp_PayDate", "").matches("[0-9]{14}"))
                return reply("99", "Missing transaction details");
            order.setPaymentTransaction(transaction);
            String paidAt = parameters.get("vnp_PayDate");
            boolean withinWindow = paidAt.compareTo(providerTime(order.getPaymentExpiresAt())) <= 0
                    && paidAt.compareTo(providerTime(order.getPaymentExpiresAt().minusMinutes(15))) >= 0;
            if (order.getStatus() == OrderStatus.PENDING && order.getPaymentStatus() == PaymentStatus.UNPAID && withinWindow) {
                order.setPaymentStatus(PaymentStatus.PAID);
                order.setStatus(OrderStatus.CONFIRMED);
            } else {
                order.setPaymentStatus(PaymentStatus.REVIEW);
                cancelPending(order);
            }
        } else {
            order.setPaymentStatus(PaymentStatus.FAILED);
            cancelPending(order);
        }
        orders.saveAndFlush(order);
        return reply("00", "Confirm success");
    }

    @Transactional
    public int expire() {
        var ids = orders.findExpiredPaymentIds(now(), PageRequest.of(0, 20));
        int expired = 0;
        for (UUID id : ids) {
            Order order = orders.findLockedById(id).orElseThrow();
            if (order.getStatus() == OrderStatus.PENDING && order.getPaymentStatus() == PaymentStatus.UNPAID
                    && !order.getPaymentExpiresAt().isAfter(now())) {
                order.setPaymentStatus(PaymentStatus.EXPIRED);
                cancelPending(order);
                expired++;
            }
        }
        orders.flush();
        return expired;
    }

    private void cancelPending(Order order) {
        if (order.getStatus() != OrderStatus.PENDING) return;
        for (OrderItem item : order.getItems()) {
            var product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
        }
        order.setStatus(OrderStatus.CANCELLED);
    }

    private String providerTime(LocalDateTime utc) {
        return utc.atOffset(ZoneOffset.UTC).atZoneSameInstant(VNPAY_ZONE).format(VNPAY_TIME);
    }

    private LocalDateTime now() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }

    private Map<String, String> reply(String code, String message) {
        return Map.of("RspCode", code, "Message", message);
    }
}
