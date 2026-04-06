import { Thermometer, Droplets, Zap, Cpu } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface StatsCardsProps {
  temperature: string;
  humidity: string;
  energyUsage: string;
  activeDevices: string;
}

export function StatsCards({ temperature, humidity, energyUsage, activeDevices }: StatsCardsProps) {
  const cards = [
    { label: "Temperature", value: temperature, icon: Thermometer },
    { label: "Humidity", value: humidity, icon: Droplets },
    { label: "Energy Usage", value: energyUsage, icon: Zap },
    { label: "Active Devices", value: activeDevices, icon: Cpu }
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <GlassCard key={card.label} className="neon-ring">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-subtle">{card.label}</p>
            <card.icon size={18} className="text-cyan-300" />
          </div>
          <p className="text-2xl font-semibold">{card.value}</p>
        </GlassCard>
      ))}
    </section>
  );
}
