import { motion } from "framer-motion";
import { Activity, Thermometer, Waves } from "lucide-react";
import { useEffect, useState } from "react";

export function LivePreview() {
  const [temperature, setTemperature] = useState(22.8);
  const [humidity, setHumidity] = useState(46);

  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature((value) => Number((value + (Math.random() - 0.5) * 0.6).toFixed(1)));
      setHumidity((value) => Number((value + (Math.random() - 0.5) * 1.2).toFixed(1)));
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8"
      >
        <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--primary-a)]">Live Preview</p>
        <h2 className="mt-2 text-3xl font-semibold md:text-4xl">A Dashboard Built for Real-Time Decisions</h2>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold">Operations Snapshot</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-300">
              <Activity size={12} />
              Active
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-subtle">Room Temperature</p>
              <p className="mt-2 inline-flex items-center gap-2 text-3xl font-semibold">
                <Thermometer size={18} className="text-cyan-300" />
                {temperature.toFixed(1)}°C
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-subtle">Humidity</p>
              <p className="mt-2 inline-flex items-center gap-2 text-3xl font-semibold">
                <Waves size={18} className="text-cyan-300" />
                {humidity.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-subtle">Energy efficiency score</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                animate={{ width: ["74%", "82%", "78%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.12 }}
          className="glass-card rounded-2xl p-6"
        >
          <p className="text-sm font-semibold">Live Device Timeline</p>
          <div className="mt-4 space-y-3">
            {["Sensor stream synchronized", "Predictive cooling engaged", "AC policy optimized"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-subtle">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                <span>{item}</span>
                <span className="ml-auto text-xs text-cyan-200">+{index + 1}m</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
