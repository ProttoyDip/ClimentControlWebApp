INSERT INTO users (name, email, password_hash, role)
VALUES
  ('Admin User', 'admin@climate.local', '$2a$12$m8D9sGqQ9sWFR8W4wY7u5u9JiGiCJ5G59R7PA8A6ULFhYjA9gkQte', 'admin'),
  ('Facility Operator', 'operator@climate.local', '$2a$12$m8D9sGqQ9sWFR8W4wY7u5u9JiGiCJ5G59R7PA8A6ULFhYjA9gkQte', 'user');

INSERT INTO devices (user_id, name, serial_number, device_type, status, power_status, fan_status, ac_status, settings_json)
VALUES
  (1, 'Main Lobby Controller', 'CCS-LOBBY-001', 'ac', 'online', 'on', 'on', 'off', JSON_OBJECT('targetTemp', 23, 'mode', 'cool')),
  (2, 'Server Room Controller', 'CCS-SRV-009', 'fan', 'online', 'on', 'on', 'off', JSON_OBJECT('fanSpeed', 3));

INSERT INTO sensor_data (device_id, temperature, humidity, fan_status, ac_status, recorded_at)
VALUES
  (1, 24.30, 55.10, 'on', 'off', TIMESTAMPADD(MINUTE, -15, NOW())),
  (1, 24.90, 56.30, 'on', 'off', TIMESTAMPADD(MINUTE, -8, NOW())),
  (2, 20.10, 45.60, 'on', 'off', TIMESTAMPADD(MINUTE, -4, NOW()));

INSERT INTO alerts (device_id, type, message, payload_json)
VALUES
  (1, 'warning', 'Temperature above threshold (31.5C > 30C)', JSON_OBJECT('temperature', 31.5, 'threshold', 30));

INSERT INTO logs (level, source, message, metadata)
VALUES
  ('info', 'seed', 'Database seeded with starter records', JSON_OBJECT('seed', true));
