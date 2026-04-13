import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { PublicNavbar } from "../components/layout/PublicNavbar";
import { Button } from "../components/ui/Button";

export function ContactPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="min-h-screen">
      <PublicNavbar />
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-12 md:px-6">
        <Link to="/" className="text-sm text-cyan-300">← Back to Home</Link>
        <section className="glass-card rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-subtle">Contact</p>
          <h1 className="mt-2 text-3xl font-semibold">Get in touch</h1>
          <p className="mt-2 text-sm text-subtle">Share your question and our team will respond soon.</p>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <input className="field-input" placeholder="Your name" required />
            <input className="field-input" type="email" placeholder="Your email" required />
            <textarea className="field-input min-h-32" placeholder="How can we help?" required />
            <Button type="submit" className="px-5">Send message</Button>
          </form>

          {sent ? <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">Message sent successfully.</p> : null}
        </section>
      </div>
    </main>
  );
}
