CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  name VARCHAR(150) NOT NULL,
  serial_number VARCHAR(120) NOT NULL UNIQUE,
  status ENUM('online', 'offline') NOT NULL DEFAULT 'offline',
  fan_status ENUM('on', 'off') NOT NULL DEFAULT 'off',
  ac_status ENUM('on', 'off') NOT NULL DEFAULT 'off',
  api_key_hash VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_devices_users FOREIGN KEY (user_id) REFERENCES users(id)
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

CREATE TABLE IF NOT EXISTS logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  level ENUM('info', 'warn', 'error') NOT NULL,
  source VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_logs_level_created_at (level, created_at DESC)
);
