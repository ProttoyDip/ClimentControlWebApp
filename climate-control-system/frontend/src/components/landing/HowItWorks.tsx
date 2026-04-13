import { motion } from "framer-motion";
import { CloudCog, LayoutDashboard, Microchip } from "lucide-react";

const steps = [
  {
    title: "ESP Collects Data",
    description: "Microcontroller sensors capture temperature and humidity signals in real-time.",
    icon: Microchip
  },
  {
    title: "Backend Processes",
    description: "The API validates, stores, and analyzes telemetry to derive smart actions.",
    icon: CloudCog
  },
  {
    title: "User Controls Dashboard",
    description: "Operators monitor metrics and control devices instantly from the web dashboard.",
    icon: LayoutDashboard
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8"
      >
        <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--primary-a)]">How It Works</p>
        <h2 className="mt-2 text-3xl font-semibold md:text-4xl">From Sensor Signal to Climate Action</h2>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: index * 0.08 }}
            className="relative"
          >
            <article className="glass-card rounded-2xl p-5">
              <div className="inline-flex rounded-xl border border-cyan-300/25 bg-cyan-400/10 p-2.5 text-[color:var(--primary-a)]">
                <step.icon size={18} />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--primary-a)]">Step {index + 1}</p>
              <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-subtle">{step.description}</p>
            </article>

            {index < steps.length - 1 ? (
              <div className="pointer-events-none absolute right-[-10px] top-1/2 hidden h-px w-5 bg-cyan-300/40 md:block" />
            ) : null}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
