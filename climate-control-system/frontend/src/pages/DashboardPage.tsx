import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { MetricCard } from '../components/MetricCard';
import { ClimatePanel } from '../components/ClimatePanel';
import { useMockClimateData, ClimateData } from '../hooks/useMockClimate';
import { motion } from 'framer-motion';

export function DashboardPage() {
  const { data, togglePresence, setTargetTemp, setTargetHum } = useMockClimateData();
  const [devices, setDevices] = useState(5); // Mock online devices

  const avgTemp = data.temperature.toFixed(1);
  const avgHum = data.humidity.toFixed(1);
  const onlineCount = `${devices}/8`;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div 
          className="eyebrow mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Climate Control Dashboard
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          <MetricCard 
            title="Temperature" 
            value={`${avgTemp}°C`} 
            subtitle="Live Average"
            className="lg:col-span-1"
          />
          <MetricCard 
            title="Humidity" 
            value={`${avgHum}%`} 
            subtitle="Optimal Range"
            className="lg:col-span-1"
          />
          <MetricCard 
            title="Devices" 
            value={onlineCount} 
            subtitle="Connected"
            className="lg:col-span-1"
          />
          <MetricCard 
            title={data.mode.toUpperCase()} 
            value={data.presenceDetected ? 'Active' : 'Eco'}
            subtitle="System Mode"
            className="lg:col-span-1"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ClimatePanel 
            data={data} 
            togglePresence={togglePresence}
            setTargetTemp={setTargetTemp}
            setTargetHum={setTargetHum}
          />

          <div className="space-y-6">
            <motion.div 
              className="glass-card p-8"
              whileHover={{ scale: 1.01 }}
            >
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Device Controls
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'AC Unit', status: true },
                  { label: 'Heater', status: false },
                  { label: 'Humidifier', status: true },
                  { label: 'Fan', status: true },
                ].map((device, idx) => (
                  <motion.button
                    key={device.label}
                    className={`p-4 rounded-xl transition-all ${
                      device.status 
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30' 
                        : 'bg-gray-500/20 border border-gray-500/40 text-gray-300 hover:bg-gray-500/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {device.label}
                    <span className="ml-2">{device.status ? 'ON' : 'OFF'}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="glass-card p-8"
              whileHover={{ scale: 1.01 }}
            >
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Energy Stats
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-bold text-emerald-400">{data.energySavings.toFixed(0)}%</div>
                  <div className="text-white/60 text-sm mt-1">Energy Saved</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">{data.carbonReduction.toFixed(0)}kg</div>
                  <div className="text-white/60 text-sm mt-1">CO2 Reduced</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

