import { useState, useEffect, useCallback } from 'react';

export interface ClimateData {
  temperature: number;
  humidity: number;
  presenceDetected: boolean;
  mode: 'active' | 'eco';
  energySavings: number;
  carbonReduction: number;
}

export function useMockClimateData() {
  const [data, setData] = useState<ClimateData>({
    temperature: 22.5,
    humidity: 50,
    presenceDetected: true,
    mode: 'active',
    energySavings: 25,
    carbonReduction: 18,
  });

  // Simulate sensor changes every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        let newTemp = prev.temperature + (Math.random() - 0.5) * 1.5;
        let newHum = prev.humidity + (Math.random() - 0.5) * 3;
        let presence = Math.random() > 0.3; // 70% chance present

        // Logic: presence -> active (22-24C, 40-60%), no -> eco (slow ramp down)
        if (presence) {
          newTemp = Math.max(22, Math.min(24, newTemp));
          newHum = Math.max(40, Math.min(60, newHum));
          return {
            ...prev,
            temperature: newTemp,
            humidity: newHum,
            presenceDetected: true,
            mode: 'active',
            energySavings: 25 + Math.random() * 10,
            carbonReduction: 18 + Math.random() * 5,
          };
        } else {
          newTemp *= 0.98; // slow cool down
          newHum *= 0.99;
          return {
            ...prev,
            temperature: newTemp,
            humidity: newHum,
            presenceDetected: false,
            mode: 'eco',
            energySavings: 35 + Math.random() * 15,
            carbonReduction: 22 + Math.random() * 8,
          };
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const togglePresence = useCallback(() => {
    setData(prev => ({
      ...prev,
      presenceDetected: !prev.presenceDetected,
      mode: !prev.presenceDetected ? 'active' : 'eco',
    }));
  }, []);

  const setTargetTemp = useCallback((target: number) => {
    setData(prev => ({ ...prev, temperature: target }));
  }, []);

  const setTargetHum = useCallback((target: number) => {
    setData(prev => ({ ...prev, humidity: target }));
  }, []);

  return {
    data,
    togglePresence,
    setTargetTemp,
    setTargetHum,
  };
}

