CREATE TABLE IF NOT EXISTS device_settings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  device_id BIGINT NOT NULL UNIQUE,
  target_temperature DECIMAL(4,1) NOT NULL DEFAULT 22.0,
  humidity_target DECIMAL(4,1) NULL,
  mode ENUM('auto', 'cool', 'dry', 'fan', 'off') NOT NULL DEFAULT 'auto',
  fan_speed TINYINT UNSIGNED NOT NULL DEFAULT 1,
  auto_control_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_device_settings_devices FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_device_settings_device_id (device_id),
  INDEX idx_device_settings_mode (mode)
);
