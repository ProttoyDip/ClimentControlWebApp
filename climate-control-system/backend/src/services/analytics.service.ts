import { getReadingsSince, getTrendBuckets } from "../models/sensorData.model";

function estimateEnergyKwh(args: { avgTemp: number; avgHumidity: number; acDutyCycle: number; fanDutyCycle: number }) {
  const thermalPenalty = Math.max(0, args.avgTemp - 24) * 0.04 + Math.max(0, args.avgHumidity - 55) * 0.02;
  const hvacLoad = args.acDutyCycle * 1.3 + args.fanDutyCycle * 0.28;
  return Number((hvacLoad + thermalPenalty).toFixed(3));
}

export async function getAnalyticsSummary(period: "day" | "week" | "month") {
  const trend = await getTrendBuckets(period);

  const averageTemperature =
    trend.length > 0
      ? Number((trend.reduce((acc, point) => acc + Number(point.avg_temperature), 0) / trend.length).toFixed(2))
      : 0;

  const averageHumidity =
    trend.length > 0
      ? Number((trend.reduce((acc, point) => acc + Number(point.avg_humidity), 0) / trend.length).toFixed(2))
      : 0;

  const fanOnTotal = trend.reduce((acc, point) => acc + Number(point.fan_on_count), 0);
  const acOnTotal = trend.reduce((acc, point) => acc + Number(point.ac_on_count), 0);
  const totalUsage = fanOnTotal + acOnTotal || 1;

  const estimatedEnergyKwh = estimateEnergyKwh({
    avgTemp: averageTemperature,
    avgHumidity: averageHumidity,
    acDutyCycle: acOnTotal / totalUsage,
    fanDutyCycle: fanOnTotal / totalUsage
  });

  return {
    period,
    averageTemperature,
    averageHumidity,
    usage: {
      fanOnTotal,
      acOnTotal
    },
    energyDistribution: [
      { label: "AC", value: Number(((acOnTotal / totalUsage) * 100).toFixed(2)) },
      { label: "Fan", value: Number(((fanOnTotal / totalUsage) * 100).toFixed(2)) }
    ],
    estimatedEnergyKwh,
    trend: trend.map((point) => ({
      bucket: point.bucket,
      avgTemperature: Number(Number(point.avg_temperature).toFixed(2)),
      avgHumidity: Number(Number(point.avg_humidity).toFixed(2)),
      fanOnCount: Number(point.fan_on_count),
      acOnCount: Number(point.ac_on_count)
    }))
  };
}

export async function getPredictiveSignals() {
  const readings = await getReadingsSince(24);
  if (readings.length < 6) {
    return {
      forecast: null,
      recommendation: "Collect at least 6 data points before generating predictions."
    };
  }

  const points = readings.map((reading, index) => ({
    x: index,
    temp: Number(reading.temperature),
    humidity: Number(reading.humidity)
  }));

  const n = points.length;
  const sumX = points.reduce((acc, p) => acc + p.x, 0);
  const sumTemp = points.reduce((acc, p) => acc + p.temp, 0);
  const sumHumidity = points.reduce((acc, p) => acc + p.humidity, 0);
  const sumXTemp = points.reduce((acc, p) => acc + p.x * p.temp, 0);
  const sumXHumidity = points.reduce((acc, p) => acc + p.x * p.humidity, 0);
  const sumXX = points.reduce((acc, p) => acc + p.x * p.x, 0);

  const denominator = n * sumXX - sumX * sumX || 1;
  const slopeTemp = (n * sumXTemp - sumX * sumTemp) / denominator;
  const interceptTemp = (sumTemp - slopeTemp * sumX) / n;

  const slopeHumidity = (n * sumXHumidity - sumX * sumHumidity) / denominator;
  const interceptHumidity = (sumHumidity - slopeHumidity * sumX) / n;

  const nextStep = n + Math.ceil((2 * 60 * 60) / 30);
  const predictedTemperature = Number((slopeTemp * nextStep + interceptTemp).toFixed(2));
  const predictedHumidity = Number((slopeHumidity * nextStep + interceptHumidity).toFixed(2));

  const projectedEnergySpike = predictedTemperature >= 30 || predictedHumidity >= 75;
  const recommendation =
    predictedTemperature >= 30
      ? "Temperature is projected to exceed 30C. Pre-cool by switching AC to ON."
      : projectedEnergySpike
        ? "Energy spike risk detected. Reduce fan cycle and tighten threshold rules."
        : "Current trend is stable. Keep automation policy unchanged.";

  return {
    forecast: {
      next2hTemperature: predictedTemperature,
      next2hHumidity: predictedHumidity,
      projectedEnergySpike
    },
    recommendation
  };
}
