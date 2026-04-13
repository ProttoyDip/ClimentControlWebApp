import { memo } from "react";
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

type TrendTooltipPayload = {
  dataKey?: string;
  value?: number;
  color?: string;
  name?: string;
  payload?: {
    time?: string;
  };
};

function TrendTooltip({ active, payload }: { active?: boolean; payload?: TrendTooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.24em] text-subtle">Live reading</p>
      <p className="mt-1 text-sm font-semibold text-white">{payload[0]?.payload?.time}</p>
      <div className="mt-3 space-y-2">
        {payload.map((entry) => (
          <div key={String(entry.dataKey)} className="flex items-center justify-between gap-8 text-sm">
            <div className="flex items-center gap-2 text-subtle">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color || "#22d3ee" }} />
              <span>{entry.name}</span>
            </div>
            <span className="font-semibold text-white">{Number(entry.value ?? 0).toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ClimateTrendChartProps {
  data: ChartPoint[];
}

export const ClimateTrendChart = memo(function ClimateTrendChart({ data }: ClimateTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={340}>
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
        <Tooltip content={<TrendTooltip />} />
        <Legend wrapperStyle={{ paddingTop: 12, fontSize: 13, color: "#94a3b8" }} />
        <Area
          type="monotone"
          dataKey="temperature"
          stroke="#22d3ee"
          fill="url(#temperature)"
          strokeWidth={2.5}
          name="Temperature (°C)"
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
});
