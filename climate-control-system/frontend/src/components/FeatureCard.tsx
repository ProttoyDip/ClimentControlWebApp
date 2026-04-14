import { motion } from 'framer-motion';
import { Users, Thermometer, Droplets, Zap, Globe, Settings } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Occupancy Detection',
    desc: 'AI-powered presence detection automatically adjusts climate when you enter or leave rooms.',
  },
  {
    icon: Thermometer,
    title: 'Temperature Control',
    desc: 'Precise temperature regulation maintaining your perfect comfort zone 22-24°C.',
  },
  {
    icon: Droplets,
    title: 'Humidity Control',
    desc: 'Optimal 40-60% humidity levels for health and comfort throughout your home.',
  },
  {
    icon: Zap,
    title: 'Energy Efficiency',
    desc: 'Smart Eco Mode saves up to 35% energy when no occupancy detected.',
  },
  {
    icon: Globe,
    title: 'Remote Access',
    desc: 'Control your climate from anywhere with secure mobile and web access.',
  },
  {
    icon: Settings,
    title: 'System Integration',
    desc: 'Compatible with all major smart home ecosystems and protocols.',
  },
];

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: React.ElementType;
  delay?: number;
}

export function FeatureCard({ title, desc, icon: Icon, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="glass-card hover:bg-white/20 group cursor-pointer"
      whileHover={{ y: -10, scale: 1.02 }}
    >
      <div className="flex items-start gap-4 mb-4">
        <motion.div 
          className="w-16 h-16 bg-gradient-to-r from-cyan-400/20 to-pink-500/20 border-2 border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0 group-hover:border-cyan-400/50 group-hover:shadow-glow"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Icon className="w-8 h-8 text-cyan-300 group-hover:text-cyan-200" />
        </motion.div>
        <div>
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent group-hover:scale-x-105 transition-transform">
            {title}
          </h3>
          <p className="text-white/70 leading-relaxed">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesGrid() {
  return (
    <div className="feature-grid">
      {features.map((feature, idx) => (
        <FeatureCard
          key={feature.title}
          {...feature}
          delay={idx * 0.1}
        />
      ))}
    </div>
  );
}

