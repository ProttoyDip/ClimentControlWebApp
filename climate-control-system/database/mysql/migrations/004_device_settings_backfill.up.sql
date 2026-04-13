INSERT INTO device_settings (
  device_id,
  target_temperature,
  humidity_target,
  mode,
  fan_speed,
  auto_control_enabled
)
SELECT
  d.id AS device_id,
  COALESCE(
    CAST(JSON_UNQUOTE(JSON_EXTRACT(d.settings_json, '$.targetTemp')) AS DECIMAL(4,1)),
    CAST(JSON_UNQUOTE(JSON_EXTRACT(d.settings_json, '$.targetTemperature')) AS DECIMAL(4,1)),
    22.0
  ) AS target_temperature,
  CAST(JSON_UNQUOTE(JSON_EXTRACT(d.settings_json, '$.humidityTarget')) AS DECIMAL(4,1)) AS humidity_target,
  COALESCE(
    JSON_UNQUOTE(JSON_EXTRACT(d.settings_json, '$.mode')),
    'auto'
  ) AS mode,
  COALESCE(
    CAST(JSON_UNQUOTE(JSON_EXTRACT(d.settings_json, '$.fanSpeed')) AS UNSIGNED),
    1
  ) AS fan_speed,
  COALESCE(
    CAST(JSON_UNQUOTE(JSON_EXTRACT(d.settings_json, '$.autoControlEnabled')) AS UNSIGNED),
    1
  ) AS auto_control_enabled
FROM devices d
WHERE NOT EXISTS (
  SELECT 1
  FROM device_settings ds
  WHERE ds.device_id = d.id
);
