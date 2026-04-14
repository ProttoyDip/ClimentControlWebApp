import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
// neonBtn class used directly

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-24 pb-20 px-6">
      <div className="text-center max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="eyebrow mb-6 animate-pulse"
        >
          AI-Powered Climate Intelligence
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-bold bg-linear-to-r from-slate-900 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 leading-tight"
        >
          Intelligent
          <br />
          <span className="bg-linear-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">Climate Control</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-slate-800 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Transform your home with AI-driven temperature, humidity control and energy optimization. 
          Presence-aware automation that thinks ahead.
        </motion.p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.button 
            className="neon-btn text-lg px-10 py-6 min-w-50! shadow-2xl shadow-cyan-500/25 hover:shadow-glow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play size={24} className="ml-2" />
            Get Started
          </motion.button>
          
          <motion.button 
            className="flex items-center gap-3 px-8 py-6 text-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Watch Demo
            <ArrowRight size={24} />
          </motion.button>
        </div>

        {/* Live Mock Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="glass-card mt-20 p-8 max-w-2xl mx-auto animate-float"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="metric-value">23.2°C</div>
              <div className="text-white/60 text-sm uppercase tracking-wider">Temperature</div>
            </div>
            <div className="text-center">
              <div className="metric-value">47%</div>
              <div className="text-white/60 text-sm uppercase tracking-wider">Humidity</div>
            </div>
            <div className="text-center">
              <div className="w-full h-3 bg-white/10 rounded-full">
                <div className="h-3 bg-linear-to-r from-green-400 to-emerald-500 rounded-full w-3/4" />
              </div>
              <div className="eyebrow mt-2">Active Mode</div>
            </div>
            <div className="text-center">
              <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 text-sm font-medium">
                Presence Detected
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

