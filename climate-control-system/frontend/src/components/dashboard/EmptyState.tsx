import { ThermometerSnowflake } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <GlassCard className="flex min-h-[220px] items-center justify-center">
      <div className="text-center">
        <ThermometerSnowflake size={30} className="mx-auto mb-2 text-cyan-300" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-subtle">{description}</p>
      </div>
    </GlassCard>
  );
}
