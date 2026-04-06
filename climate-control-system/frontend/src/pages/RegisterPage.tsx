import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("Facility Operator");
  const [email, setEmail] = useState("operator@climate.local");
  const [password, setPassword] = useState("operator1234");
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await register(name, email, password);
      setStatus("Registration complete. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
    } catch {
      setStatus("Registration failed. Try another email.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <section className="glass-card gradient-border w-full max-w-md p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Onboard Operator</p>
        <h1 className="mt-2 text-2xl font-semibold">Create Account</h1>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label className="block text-sm">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              required
              className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900/40 px-3 py-2 outline-none focus:border-cyan-300/50"
            />
          </label>

          <label className="block text-sm">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900/40 px-3 py-2 outline-none focus:border-cyan-300/50"
            />
          </label>

          <label className="block text-sm">
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900/40 px-3 py-2 outline-none focus:border-cyan-300/50"
            />
          </label>

          {status ? <p className="text-sm text-cyan-200">{status}</p> : null}

          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>

        <p className="mt-4 text-sm text-subtle">
          Have an account? <Link className="text-cyan-300" to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
