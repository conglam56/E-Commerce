package com.javaweb.ecommerce.mapper;

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

    default String generatePaymentInstruction(Order order) {
        if (order.getPaymentMethod() == PaymentMethod.BANK_TRANSFER) {
            return String.format(
                    "Chuyển khoản MBBank (mô phỏng), số tiền %s VNĐ, mã đơn %s. Demo không yêu cầu chuyển tiền.",
                    order.getTotalAmount().toPlainString(),
                    order.getId().toString().substring(0, 8).toUpperCase());
        }
        return "Thanh toán tiền mặt khi nhận hàng (COD).";
    }
}

