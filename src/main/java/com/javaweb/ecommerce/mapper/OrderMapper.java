package com.javaweb.ecommerce.mapper;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import com.javaweb.ecommerce.dto.record.response.OrderResponse;
import com.javaweb.ecommerce.entity.Order;
import com.javaweb.ecommerce.entity.enums.PaymentMethod;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = OrderItemMapper.class)
public interface OrderMapper {

    @Mapping(source = "items", target = "items")
    @Mapping(target = "paymentInstruction", expression = "java(generatePaymentInstruction(order))")
    OrderResponse toResponse(Order order);

    // Order lifecycle timestamps are stored as wall time in the JVM's timezone.
    default OffsetDateTime toOffsetDateTime(LocalDateTime value) {
        return value == null ? null : value.atZone(ZoneId.systemDefault()).toOffsetDateTime();
    }

    default String generatePaymentInstruction(Order order) {
        if (order.getPaymentMethod() == PaymentMethod.BANK_TRANSFER) {
            return String.format(
                    "Chuyển khoản MBBank (mô phỏng), số tiền %s VNĐ, mã đơn %s. Demo không yêu cầu chuyển tiền.",
                    order.getTotalAmount().toPlainString(),
                    order.getId().toString().substring(0, 8).toUpperCase());
        }
        if (order.getPaymentMethod() == PaymentMethod.VNPAY) return "Thanh toán qua VNPay Sandbox.";
        return "Thanh toán tiền mặt khi nhận hàng (COD).";
    }
}

