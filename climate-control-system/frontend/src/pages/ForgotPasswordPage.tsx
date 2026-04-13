import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/landing/Navbar";
import { Button } from "../components/ui/Button";
import { Toast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await forgotPassword(email);
      setMessage(result);
    } catch {
      setError("Could not process reset request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar primaryCtaTo="/register" />
      {message ? <Toast message={message} tone="success" onClose={() => setMessage(null)} /> : null}
      {error ? <Toast message={error} tone="error" onClose={() => setError(null)} /> : null}
      <section className="mx-auto mt-10 w-full max-w-md px-4">
        <div className="glass-card gradient-border p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-subtle">Account Recovery</p>
          <h1 className="mt-2 text-2xl font-semibold">Forgot Password</h1>
          <p className="mt-2 text-sm text-subtle">Enter your email to receive a reset link.</p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <input
              className="field-input"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-subtle">
            Back to <Link to="/login" className="text-cyan-300">Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
