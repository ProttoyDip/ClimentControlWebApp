import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ChartPoint } from "../../types";

interface ClimateTrendChartProps {
  data: ChartPoint[];
}

export function ClimateTrendChart({ data }: ClimateTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="temperature" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="humidity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(148,163,184,0.2)" vertical={false} />
        <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
        <Tooltip
          contentStyle={{
            borderRadius: 14,
            border: "1px solid rgba(148,163,184,0.24)",
            background: "rgba(15,23,42,0.9)",
            color: "#e2e8f0"
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="temperature"
          stroke="#22d3ee"
          fill="url(#temperature)"
          strokeWidth={2.5}
          name="Temperature (C)"
          isAnimationActive
          animationDuration={700}
        />
        <Area
          type="monotone"
          dataKey="humidity"
          stroke="#3b82f6"
          fill="url(#humidity)"
          strokeWidth={2.5}
          name="Humidity (%)"
          isAnimationActive
          animationDuration={700}
          animationBegin={120}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
