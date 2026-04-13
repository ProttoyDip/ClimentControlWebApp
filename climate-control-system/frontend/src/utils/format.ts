export function formatRelativeClock(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatKwh(value: number): string {
  return `${value.toFixed(2)} kWh`;
}

export function computeEnergyUsage(temperature: number, humidity: number, deviceCount: number): number {
  const thermal = Math.max(temperature - 20, 0) * 0.16;
  const moisture = Math.max(humidity - 40, 0) * 0.07;
  return (thermal + moisture + deviceCount * 0.24) * 1.8;
}
