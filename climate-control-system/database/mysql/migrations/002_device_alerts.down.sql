UPDATE logs SET level = 'warn' WHERE level = 'warning';
ALTER TABLE logs MODIFY COLUMN level ENUM('info', 'warn', 'error') NOT NULL;

DROP TABLE IF EXISTS alerts;

ALTER TABLE devices
  DROP COLUMN settings_json,
  DROP COLUMN power_status,
  DROP COLUMN device_type;
