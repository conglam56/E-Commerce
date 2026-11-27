ALTER TABLE orders
    ADD COLUMN payment_status varchar(30) NOT NULL DEFAULT 'UNPAID',
    ADD COLUMN payment_expires_at timestamp,
    ADD COLUMN payment_transaction varchar(64),
    ADD COLUMN shipping_carrier varchar(80),
    ADD COLUMN tracking_number varchar(100);
CREATE UNIQUE INDEX orders_payment_transaction_idx ON orders(payment_transaction) WHERE payment_transaction IS NOT NULL;
CREATE INDEX orders_payment_expiry_idx ON orders(payment_expires_at)
    WHERE payment_method = 'VNPAY' AND payment_status = 'UNPAID' AND status = 'PENDING';
