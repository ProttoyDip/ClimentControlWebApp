ALTER TABLE users
  ADD COLUMN reset_token VARCHAR(255) NULL AFTER role,
  ADD COLUMN reset_token_expiry TIMESTAMP NULL AFTER reset_token,
  ADD INDEX idx_users_reset_token (reset_token),
  ADD INDEX idx_users_reset_token_expiry (reset_token_expiry);
