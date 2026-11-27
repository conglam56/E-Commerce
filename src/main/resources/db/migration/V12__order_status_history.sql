CREATE TABLE order_status_history (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status varchar(50),
    to_status varchar(50) NOT NULL,
    changed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    baseline boolean NOT NULL DEFAULT false
);

CREATE INDEX order_status_history_order_idx ON order_status_history(order_id, id DESC);

-- Existing orders start with a snapshot captured when this migration runs.
INSERT INTO order_status_history(order_id, to_status, baseline)
SELECT id, status, true FROM orders;

CREATE FUNCTION record_order_status_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO order_status_history(order_id, to_status)
        VALUES (NEW.id, NEW.status);
    ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history(order_id, from_status, to_status)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER orders_status_history
AFTER INSERT OR UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION record_order_status_change();
