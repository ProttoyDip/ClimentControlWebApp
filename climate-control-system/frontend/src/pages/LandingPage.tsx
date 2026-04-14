import { Contact } from "../components/landing/Contact";
import { Features } from "../components/landing/Features";
import { Footer } from "../components/landing/Footer";
import { Hero } from "../components/landing/Hero";
import { HowItWorks } from "../components/landing/HowItWorks";
import { LivePreview } from "../components/landing/LivePreview";
import { Navbar } from "../components/landing/Navbar";
import { useAuth } from "../context/AuthContext";
import { useLandingTelemetry } from "../hooks/useLandingTelemetry";

export function LandingPage() {
  const { accessToken } = useAuth();
  const primaryCtaTo = accessToken ? "/dashboard" : "/register";
  const telemetry = useLandingTelemetry();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(37,99,235,0.2),transparent_30%),linear-gradient(180deg,var(--bg-soft),var(--bg))] text-[color:var(--text)]">
      <Navbar primaryCtaTo={primaryCtaTo} />
      <Hero primaryCtaTo={primaryCtaTo} telemetry={telemetry} />
      <Features />
      <HowItWorks />
      <LivePreview telemetry={telemetry} />
      <Contact />
      <Footer />
    </main>
  );
}
