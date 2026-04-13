import { Link } from "react-router-dom";
import { PublicNavbar } from "../components/layout/PublicNavbar";
import { Button } from "../components/ui/Button";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(37,99,235,0.2),transparent_30%),linear-gradient(180deg,var(--bg-soft),var(--bg))] text-[color:var(--text)]">
      <PublicNavbar />

      <section id="home" className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 pt-20 md:grid-cols-2 md:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-subtle">Smart IoT Platform</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">Smart Climate Control</h1>
          <p className="mt-4 text-base text-subtle">
            Monitor room temperature and humidity in real-time, control devices remotely, and automate your climate strategy with confidence.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/login"><Button className="px-5">Login</Button></Link>
            <Link to="/register"><Button variant="ghost" className="px-5">Register</Button></Link>
          </div>
        </div>
        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-lg font-semibold">Live Benefits</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="text-subtle">Real-time telemetry from ESP devices</li>
            <li className="text-subtle">Instant control commands with feedback</li>
            <li className="text-subtle">Centralized monitoring dashboard</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 md:px-6">
        <h3 className="text-2xl font-semibold">Features</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="glass-card rounded-2xl p-5">
            <h4 className="font-semibold">Real-time Monitoring</h4>
            <p className="mt-2 text-sm text-subtle">Track temperature, humidity, and status continuously.</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h4 className="font-semibold">Device Control</h4>
            <p className="mt-2 text-sm text-subtle">Toggle AC and fan operations securely from anywhere.</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h4 className="font-semibold">Automation</h4>
            <p className="mt-2 text-sm text-subtle">Use threshold rules to reduce manual intervention.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 md:px-6">
        <h3 className="text-2xl font-semibold">How It Works</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="glass-card rounded-2xl p-5 text-sm text-subtle">ESP Device reads room data.</div>
          <div className="glass-card rounded-2xl p-5 text-sm text-subtle">Backend validates and stores telemetry.</div>
          <div className="glass-card rounded-2xl p-5 text-sm text-subtle">Dashboard visualizes and controls devices.</div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-2xl font-semibold">Contact</h3>
          <p className="mt-2 text-sm text-subtle">Need help with deployment or operations? We are here to support your setup.</p>
          <Link to="/contact" className="mt-4 inline-block text-sm text-cyan-300">Go to Contact Page</Link>
        </div>
      </section>

      <footer className="border-t border-[color:var(--border)] py-6 text-center text-xs text-subtle">
        © {new Date().getFullYear()} Smart Climate Control. All rights reserved.
      </footer>
    </main>
  );
}
