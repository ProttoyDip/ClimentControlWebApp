import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { FeaturesGrid } from '../components/FeatureCard';
import { SustainabilityStats } from '../components/SustainabilityStats';
// Footer inline - no separate component needed


export function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <Navbar />
      <Hero />
      
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="eyebrow mb-6">Smart Features</div>
            <h2 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-slate-900 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
              Intelligent Automation
            </h2>
            <p className="text-xl text-slate-800 max-w-3xl mx-auto leading-relaxed">
              Our AI system detects occupancy, optimizes climate, and saves energy automatically.
            </p>
          </div>
          
          <FeaturesGrid />
        </div>
      </section>
      
      <SustainabilityStats />
      
      {/* Footer placeholder */}
      <footer className="py-12 bg-black/50 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-white/60">
            © 2024 ClimateControl. All rights reserved. Built with AI & Love.
          </p>
        </div>
      </footer>
    </div>
  );
}

