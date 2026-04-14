import { motion } from 'framer-motion';
import { TrendingUp, Leaf, Activity } from 'lucide-react';

const stats = [
  {
    value: '35%',
    label: 'Energy Savings',
    icon: TrendingUp,
    color: 'emerald',
  },
  {
    value: '22kg',
    label: 'CO2 Reduced',
    icon: Leaf,
    color: 'green',
  },
  {
    value: '98%',
    label: 'Uptime',
    icon: Activity,
    color: 'cyan',
  },
];

interface StatCardProps {
  value: string;
  label: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}

function StatCard({ value, label, icon: Icon, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="glass-card p-8 text-center hover:bg-white/20"
      whileHover={{ scale: 1.05 }}
    >
      <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-${color}-400/20 border-2 border-${color}-400/30 flex items-center justify-center shadow-glow`}>
        <Icon className={`w-10 h-10 text-${color}-300`} />
      </div>
      <div className="metric-value text-4xl mb-2">{value}</div>
      <div className="text-white/70 uppercase tracking-wider text-sm font-mono">{label}</div>
    </motion.div>
  );
}

export function SustainabilityStats() {
  return (
    <section className="py-32 bg-black/20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="eyebrow mb-6">Sustainability Impact</div>
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent mb-6">
            Greener Tomorrow
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Our AI optimization reduces energy consumption while maintaining perfect climate control.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <StatCard
              key={stat.label}
              {...stat}
              delay={idx * 0.2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

