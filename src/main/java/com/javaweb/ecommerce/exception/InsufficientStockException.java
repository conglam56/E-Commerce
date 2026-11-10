package com.javaweb.ecommerce.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String productName, int available) {
        super("Sản phẩm " + productName + " chỉ còn " + available + " trong kho");
    }
}

