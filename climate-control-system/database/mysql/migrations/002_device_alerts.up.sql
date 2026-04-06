ALTER TABLE devices
  ADD COLUMN device_type ENUM('ac', 'fan', 'heater') NOT NULL DEFAULT 'ac' AFTER serial_number,
  ADD COLUMN power_status ENUM('on', 'off') NOT NULL DEFAULT 'off' AFTER status,
  ADD COLUMN settings_json JSON NULL AFTER ac_status;

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

UPDATE logs SET level = 'warn' WHERE level = 'warning';
ALTER TABLE logs MODIFY COLUMN level ENUM('info', 'warning', 'error') NOT NULL;
UPDATE logs SET level = 'warning' WHERE level = 'warn';
