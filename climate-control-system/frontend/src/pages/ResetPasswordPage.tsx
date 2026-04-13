import { Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PublicNavbar } from "../components/layout/PublicNavbar";
import { Button } from "../components/ui/Button";
import { Toast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";

export function ResetPasswordPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token, password);
      setMessage(result);
      setTimeout(() => navigate("/login"), 1200);
    } catch {
      setError("Reset token is invalid or expired.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <PublicNavbar />
      {message ? <Toast message={message} tone="success" onClose={() => setMessage(null)} /> : null}
      {error ? <Toast message={error} tone="error" onClose={() => setError(null)} /> : null}
      <section className="mx-auto mt-10 w-full max-w-md px-4">
      <div className="glass-card gradient-border p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Account Recovery</p>
        <h1 className="mt-2 text-2xl font-semibold">Reset Password</h1>
        <p className="mt-2 text-sm text-subtle">Choose a new secure password for your account.</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div className="relative">
            <input
              className="field-input pr-10"
              placeholder="New password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

          <div className="relative">
            <input
              className="field-input pr-10"
              placeholder="Confirm new password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Password"}
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
