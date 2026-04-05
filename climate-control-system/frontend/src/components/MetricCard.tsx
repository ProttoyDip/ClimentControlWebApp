interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
}

export function MetricCard({ title, value, subtitle }: MetricCardProps) {
  return (
    <article className="metric-card">
      <p className="metric-card__title">{title}</p>
      <h3 className="metric-card__value">{value}</h3>
      <p className="metric-card__subtitle">{subtitle}</p>
    </article>
  );
}
