ALTER TABLE users
    ADD COLUMN email_verified boolean NOT NULL DEFAULT false,
    ADD COLUMN session_version integer NOT NULL DEFAULT 0,
    ADD COLUMN verification_hash varchar(64),
    ADD COLUMN verification_expires timestamptz,
    ADD COLUMN reset_hash varchar(64),
    ADD COLUMN reset_expires timestamptz;
CREATE UNIQUE INDEX users_reset_hash_idx ON users(reset_hash) WHERE reset_hash IS NOT NULL;
