export function formatRelativeClock(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatLocalDateTime(iso: string): string {
  const normalized = iso.includes("T") ? iso : iso.replace(" ", "T");
  const hasExplicitTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized);
  const parseTarget = hasExplicitTimezone ? normalized : `${normalized}Z`;
  const date = new Date(parseTarget);
  const displayTimeZone = (import.meta.env.VITE_DISPLAY_TIMEZONE || "Asia/Dhaka").trim();

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  try {
    return new Intl.DateTimeFormat([], {
      timeZone: displayTimeZone,
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(date);
  } catch {
    // Fallback for environments where IANA timezone support is unavailable.
    const dhakaUtcOffsetMs = 6 * 60 * 60 * 1000;
    const dhakaDate = new Date(date.getTime() + dhakaUtcOffsetMs);
    const year = dhakaDate.getUTCFullYear();
    const month = String(dhakaDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(dhakaDate.getUTCDate()).padStart(2, "0");
    const hour = String(dhakaDate.getUTCHours()).padStart(2, "0");
    const minute = String(dhakaDate.getUTCMinutes()).padStart(2, "0");
    const second = String(dhakaDate.getUTCSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
}

export function formatUnixDateTime(unixSeconds: number): string {
  const displayTimeZone = (import.meta.env.VITE_DISPLAY_TIMEZONE || "Asia/Dhaka").trim();
  const date = new Date(unixSeconds * 1000);

  if (Number.isNaN(date.getTime())) {
    return String(unixSeconds);
  }

  return new Intl.DateTimeFormat([], {
    timeZone: displayTimeZone,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);
}

export function formatKwh(value: number): string {
  return `${value.toFixed(2)} kWh`;
}

export function computeEnergyUsage(temperature: number, humidity: number, deviceCount: number): number {
  const thermal = Math.max(temperature - 20, 0) * 0.16;
  const moisture = Math.max(humidity - 40, 0) * 0.07;
  return (thermal + moisture + deviceCount * 0.24) * 1.8;
}
