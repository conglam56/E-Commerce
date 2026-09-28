-- 1. Bảng giỏ hàng (cart)
CREATE TABLE cart (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Bảng chi tiết từng món đồ trong giỏ (cart_item)
CREATE TABLE cart_item (
    id UUID PRIMARY KEY,
    cart_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Khóa ngoại nối sang bảng cart (nếu xóa giỏ thì xóa sạch item bên trong)
    CONSTRAINT fk_cart_item_cart FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    
    -- Khóa ngoại nối sang bảng product
    CONSTRAINT fk_cart_item_product FOREIGN KEY (product_id) REFERENCES product(id),
    
    -- TODO: Ràng buộc để 1 sản phẩm chỉ xuất hiện 1 lần trong 1 giỏ hàng
    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);
