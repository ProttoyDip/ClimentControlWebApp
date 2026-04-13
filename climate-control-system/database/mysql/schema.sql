CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  reset_token VARCHAR(255) NULL,
  reset_token_expiry TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  name VARCHAR(150) NOT NULL,
  serial_number VARCHAR(120) NOT NULL UNIQUE,
  device_type ENUM('ac', 'fan', 'heater') NOT NULL DEFAULT 'ac',
  status ENUM('online', 'offline') NOT NULL DEFAULT 'offline',
  power_status ENUM('on', 'off') NOT NULL DEFAULT 'off',
  fan_status ENUM('on', 'off') NOT NULL DEFAULT 'off',
  ac_status ENUM('on', 'off') NOT NULL DEFAULT 'off',
  settings_json JSON NULL,
  api_key_hash VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_devices_users FOREIGN KEY (user_id) REFERENCES users(id)
);

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

CREATE TABLE IF NOT EXISTS sensor_data (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  device_id BIGINT NOT NULL,
  temperature DECIMAL(5,2) NOT NULL,
  humidity DECIMAL(5,2) NOT NULL,
  fan_status ENUM('on', 'off') NOT NULL,
  ac_status ENUM('on', 'off') NOT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sensor_data_devices FOREIGN KEY (device_id) REFERENCES devices(id),
  INDEX idx_sensor_data_device_time (device_id, recorded_at DESC),
  INDEX idx_sensor_data_recorded_at (recorded_at DESC)
);

CREATE TABLE IF NOT EXISTS alerts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  device_id BIGINT NOT NULL,
  type ENUM('warning', 'error') NOT NULL,
  message TEXT NOT NULL,
  payload_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_alerts_devices FOREIGN KEY (device_id) REFERENCES devices(id),
  INDEX idx_alerts_created_at (created_at DESC),
  INDEX idx_alerts_device_id (device_id)
);

CREATE TABLE IF NOT EXISTS logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  level ENUM('info', 'warning', 'error') NOT NULL,
  source VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_logs_level_created_at (level, created_at DESC)
);
