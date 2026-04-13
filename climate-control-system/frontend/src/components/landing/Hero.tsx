import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

interface HeroProps {
  primaryCtaTo: string;
}

export function Hero({ primaryCtaTo }: HeroProps) {
  return (
    <section id="home" className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pb-20 pt-16 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.18),transparent_26%),radial-gradient(circle_at_85%_15%,rgba(99,102,241,0.2),transparent_30%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-6"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--primary-a)]">
          <Sparkles size={14} />
          IoT Powered Premium Platform
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
          Smart Climate Control for Modern Living
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-subtle md:text-lg">
          Monitor and control your room temperature and humidity in real-time using IoT. Built for precision comfort, automation, and energy-aware living.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link to={primaryCtaTo} aria-label="Get started">
            <Button className="inline-flex items-center gap-2 !rounded-2xl !px-6 !py-3 text-base">
              Get Started
              <ArrowRight size={16} />
            </Button>
          </Link>
          <a href="#features" aria-label="Learn more about features">
            <Button variant="ghost" className="!rounded-2xl !px-6 !py-3 text-base">Learn More</Button>
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        className="relative"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="glass-card gradient-border rounded-3xl p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm font-medium">Climate Command Center</p>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-300">Live</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-subtle">Temperature</p>
              <p className="mt-2 text-3xl font-semibold">22.8°C</p>
              <p className="text-xs text-cyan-300">Stable zone</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-subtle">Humidity</p>
              <p className="mt-2 text-3xl font-semibold">46%</p>
              <p className="text-xs text-cyan-300">Balanced</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
              <p className="text-xs text-subtle">Automation Policy</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  animate={{ width: ["58%", "74%", "66%"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <p className="mt-2 text-xs text-subtle">Adaptive cooling running with predictive thresholds</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
