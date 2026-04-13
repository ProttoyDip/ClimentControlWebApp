import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { Button } from "../ui/Button";

interface ContactState {
  name: string;
  email: string;
  message: string;
}

const initialState: ContactState = {
  name: "",
  email: "",
  message: ""
};

export function Contact() {
  const [form, setForm] = useState<ContactState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please complete all fields before submitting.");
      setSuccess(false);
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!isValidEmail) {
      setError("Please enter a valid email address.");
      setSuccess(false);
      return;
    }

    setError(null);
    setSuccess(true);
    setForm(initialState);
  }

  return (
    <section id="contact" className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8">
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="glass-card rounded-2xl p-6"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--primary-a)]">Contact</p>
          <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Talk to Our Climate Team</h2>
          <p className="mt-3 text-sm leading-relaxed text-subtle md:text-base">
            Need deployment guidance or want a custom climate automation setup? Send us a message and we will respond quickly.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-6"
        >
          <div className="grid gap-4">
            <label className="text-sm">
              Name
              <input
                className="field-input"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Your name"
                aria-label="Name"
              />
            </label>
            <label className="text-sm">
              Email
              <input
                className="field-input"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="you@example.com"
                aria-label="Email"
                type="email"
              />
            </label>
            <label className="text-sm">
              Message
              <textarea
                className="field-input min-h-32"
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                placeholder="Tell us what you need"
                aria-label="Message"
              />
            </label>
            <Button type="submit" className="!rounded-2xl !py-3">Submit</Button>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p>
          ) : null}
          {success ? (
            <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
              Message sent successfully. We will contact you soon.
            </p>
          ) : null}
        </motion.form>
      </div>
    </section>
  );
}
