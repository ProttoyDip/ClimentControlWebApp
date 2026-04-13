DELETE ds
FROM device_settings ds
INNER JOIN devices d ON d.id = ds.device_id;
