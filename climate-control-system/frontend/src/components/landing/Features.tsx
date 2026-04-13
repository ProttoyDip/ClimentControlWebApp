import { motion } from "framer-motion";
import { Activity, Bot, Cpu, Leaf, Radio, SlidersHorizontal } from "lucide-react";

const featureCards = [
  {
    title: "Real-time Monitoring",
    description: "Get second-by-second visibility into room temperature and humidity from connected ESP devices.",
    icon: Activity
  },
  {
    title: "Remote Device Control",
    description: "Adjust fan and AC states instantly from any browser with secure role-based access.",
    icon: SlidersHorizontal
  },
  {
    title: "Smart Automation",
    description: "Trigger adaptive climate responses automatically using threshold and prediction rules.",
    icon: Bot
  },
  {
    title: "Energy Efficiency",
    description: "Reduce unnecessary HVAC usage with data-driven schedules and occupancy-aware behavior.",
    icon: Leaf
  },
  {
    title: "IoT Integration",
    description: "Bridge telemetry and control over MQTT and REST for reliable edge-to-cloud operations.",
    icon: Radio
  },
  {
    title: "Scalable Architecture",
    description: "Built on modern frontend and backend services designed for multi-room deployment.",
    icon: Cpu
  }
];

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8"
      >
        <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--primary-a)]">Features</p>
        <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Everything You Need for Intelligent Climate Control</h2>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featureCards.map((card, index) => (
          <motion.article
            key={card.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: index * 0.06 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="glass-card group rounded-2xl p-5"
          >
            <div className="inline-flex rounded-xl border border-cyan-300/25 bg-cyan-400/10 p-2.5 text-[color:var(--primary-a)] transition group-hover:scale-110">
              <card.icon size={18} />
            </div>
            <h3 className="mt-4 text-xl font-semibold">{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-subtle">{card.description}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
