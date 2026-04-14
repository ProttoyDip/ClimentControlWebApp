import { motion } from 'framer-motion';
import { Thermometer, Droplets, UserCheck, UserX, Zap } from 'lucide-react';
import { useMockClimateData, ClimateData } from '../hooks/useMockClimate';
import { useState } from 'react';

interface ClimatePanelProps {
  data: ClimateData;
  togglePresence: () => void;
  setTargetTemp: (temp: number) => void;
  setTargetHum: (hum: number) => void;
}

export function ClimatePanel({ data, togglePresence, setTargetTemp, setTargetHum }: ClimatePanelProps) {
  const [tempValue, setTempValue] = useState(22);
  const [humValue, setHumValue] = useState(50);

  const handleTempChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setTempValue(value);
    setTargetTemp(value);
  };

  const handleHumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setHumValue(value);
    setTargetHum(value);
  };

  return (
    <motion.div 
      className="glass-card p-8 max-w-md w-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="eyebrow mb-6 flex items-center gap-2 justify-center">
        <Zap className="w-5 h-5" />
        Live Climate Control
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="text-center">
          <div className="metric-value">{data.temperature.toFixed(1)}°C</div>
          <div className="text-white/60 text-sm mt-2 uppercase tracking-wider flex items-center justify-center gap-1">
            <Thermometer size={16} />
            Temperature
          </div>
        </div>
        <div className="text-center">
          <div className="metric-value">{data.humidity.toFixed(0)}%</div>
          <div className="text-white/60 text-sm mt-2 uppercase tracking-wider flex items-center justify-center gap-1">
            <Droplets size={16} />
            Humidity
          </div>
        </div>
      </div>

      {/* Presence Toggle */}
      <motion.div 
        className="glass-card p-6 mb-6"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold">Presence Detection</span>
          <motion.button
            onClick={togglePresence}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              data.presenceDetected 
                ? 'bg-green-500/20 border border-green-500/40 text-green-300 shadow-glow-green' 
                : 'bg-gray-500/20 border border-gray-500/40 text-gray-300'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {data.presenceDetected ? <UserCheck size={20} /> : <UserX size={20} />}
          </motion.button>
        </div>
        <div className={`text-center py-2 px-4 rounded-xl text-sm font-medium ${
          data.mode === 'active' 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
            : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
        }`}>
          {data.mode.toUpperCase()} MODE
        </div>
      </motion.div>

      {/* Controls */}
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-3 text-white/80 flex items-center gap-2">
            <Thermometer size={18} />
            Target Temperature
          </label>
          <div className="flex items-center gap-4">
<div className="flex items-center gap-4 w-full">
              <div className="w-2 h-2 bg-linear-to-r from-cyan-400 to-pink-500 rounded-full shadow-glow animate-pulse" />
              <div className="flex-1 h-2 bg-white/20 rounded-full">
                <div 
                  className="h-2 bg-linear-to-r from-cyan-400 to-pink-500 rounded-full shadow-lg" 
                  style={{ width: `${((tempValue - 18) / 10 * 100)}%` }}
                />
              </div>
              <span className="text-xl font-bold text-white min-w-15">{tempValue}°C</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-3 text-white/80 flex items-center gap-2">
            <Droplets size={18} />
            Target Humidity
          </label>
          <div className="flex items-center gap-4 w-full">
            <div className="w-2 h-2 bg-linear-to-r from-blue-400 to-indigo-500 rounded-full shadow-glow animate-pulse" />
            <div className="flex-1 h-2 bg-white/20 rounded-full">
              <div 
                className="h-2 bg-linear-to-r from-blue-400 to-indigo-500 rounded-full shadow-lg" 
                style={{ width: `${((humValue - 30) / 40 * 100)}%` }}
              />
            </div>
            <span className="text-xl font-bold text-white min-w-15">{humValue}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
