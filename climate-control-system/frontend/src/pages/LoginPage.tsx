import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, ShieldCheck, ThermometerSun, Waves } from "lucide-react";
import { Navbar } from "../components/landing/Navbar";
import { Button } from "../components/ui/Button";
import { Toast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@climate.local");
  const [password, setPassword] = useState("admin1234");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials or backend unavailable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {error ? <Toast message={error} tone="error" onClose={() => setError(null)} /> : null}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.18),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.3),transparent_48%)]" />
      <Navbar primaryCtaTo="/register" />
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card gradient-border w-full max-w-lg overflow-hidden p-0"
        >
          <div className="border-b border-white/10 bg-white/5 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-subtle">Secure Access</p>
            <h1 className="mt-2 text-3xl font-semibold">Login to Climate Console</h1>
            <p className="mt-2 text-sm text-subtle">Access real-time room intelligence, device controls, and analytics.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-6 md:p-7">
            <label className="block text-sm">
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="field-input"
              />
            </label>

            <label className="block text-sm">
              Password
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  className="field-input pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-cyan-300 hover:text-cyan-200">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 py-3 text-base">
              {loading ? "Signing in..." : "Enter dashboard"}
              <ArrowRight size={16} />
            </Button>
          </form>

          <div className="grid gap-3 border-t border-white/10 px-6 py-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <ThermometerSun size={16} className="text-cyan-300" />
              <p className="mt-2 text-xs text-subtle">Live temperature control</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <Waves size={16} className="text-sky-300" />
              <p className="mt-2 text-xs text-subtle">Humidity intelligence</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <ShieldCheck size={16} className="text-emerald-300" />
              <p className="mt-2 text-xs text-subtle">Protected operator session</p>
            </div>
          </div>

          <p className="px-6 pb-6 text-sm text-subtle">
            Need an account? <Link className="text-cyan-300 transition hover:text-cyan-200" to="/register">Create one</Link>
          </p>
        </motion.div>
      </section>

      <section className="hidden items-center justify-center p-8 lg:flex">
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="max-w-xl space-y-6">
          <p className="text-xs uppercase tracking-[0.28em] text-subtle">Premium IoT SaaS</p>
          <h2 className="text-5xl font-semibold leading-tight">A polished control room for the connected climate system.</h2>
          <p className="max-w-lg text-base text-subtle">
            Monitor room conditions, automate HVAC devices, and keep operators aligned with a dashboard that feels like a modern SaaS product.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Realtime telemetry with Socket.IO",
              "Glassmorphism cards and dark mode",
              "Device controls with optimistic feedback",
              "Mobile-first responsive shell"
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100 backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </section>
      </div>
    </main>
  );
}
