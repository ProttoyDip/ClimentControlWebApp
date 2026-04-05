import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <main className="auth-layout">
      <section className="auth-card">
        <p className="eyebrow">Onboard Operator</p>
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" required />
          </label>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>
          {status ? <p className="info-message">{status}</p> : null}
          <button type="submit">Register</button>
        </form>
        <p>
          Have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
