INSERT INTO users (name, email, password_hash, role)
VALUES
  ('Admin User', 'admin@climate.local', '$2a$12$m8D9sGqQ9sWFR8W4wY7u5u9JiGiCJ5G59R7PA8A6ULFhYjA9gkQte', 'admin'),
  ('Facility Operator', 'operator@climate.local', '$2a$12$m8D9sGqQ9sWFR8W4wY7u5u9JiGiCJ5G59R7PA8A6ULFhYjA9gkQte', 'user');

INSERT INTO devices (user_id, name, serial_number, status, fan_status, ac_status)
VALUES
  (1, 'Main Lobby Controller', 'CCS-LOBBY-001', 'online', 'on', 'off'),
  (2, 'Server Room Controller', 'CCS-SRV-009', 'offline', 'off', 'on');

INSERT INTO sensor_data (device_id, temperature, humidity, fan_status, ac_status, recorded_at)
VALUES
  (1, 24.30, 55.10, 'on', 'off', TIMESTAMPADD(MINUTE, -15, NOW())),
  (1, 24.90, 56.30, 'on', 'off', TIMESTAMPADD(MINUTE, -8, NOW())),
  (2, 20.10, 45.60, 'off', 'on', TIMESTAMPADD(MINUTE, -4, NOW()));

INSERT INTO logs (level, source, message, metadata)
VALUES
  ('info', 'seed', 'Database seeded with starter records', JSON_OBJECT('seed', true));
