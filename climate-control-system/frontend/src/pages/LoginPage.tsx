import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@climate.local");
  const [password, setPassword] = useState("admin1234");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setError(null);
      await login(email, password);
      navigate("/");
    } catch {
      setError("Invalid credentials or backend unavailable");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <section className="glass-card gradient-border w-full max-w-md p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Secure Access</p>
        <h1 className="mt-2 text-2xl font-semibold">Login to Climate Console</h1>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
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

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>

        <p className="mt-4 text-sm text-subtle">
          Need an account? <Link className="text-cyan-300" to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}
