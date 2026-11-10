package com.javaweb.ecommerce.exception;

public class EmptyCartException extends RuntimeException {
    public EmptyCartException() {
        super("Giỏ hàng đang trống, không thể tiến hành đặt hàng");
    }
}

