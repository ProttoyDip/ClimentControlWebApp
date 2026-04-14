import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  className?: string;
}

export function MetricCard({ title, value, subtitle, className = '' }: MetricCardProps) {
  return (
    <motion.article 
      className={`glass-card p-8 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <p className="eyebrow mb-2">{title}</p>
      <h3 className="metric-value mb-2">{value}</h3>
      <p className="text-white/60 text-sm uppercase tracking-wider">{subtitle}</p>
    </motion.article>
  );
}
