import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

interface AnalyticsSummary {
  averageTemperature: number;
  averageHumidity: number;
  estimatedEnergyKwh: number;
}

interface PredictionData {
  forecast: {
    next2hTemperature: number;
    next2hHumidity: number;
    projectedEnergySpike: boolean;
  } | null;
  recommendation: string;
}

export function AdminPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [summaryRes, predictionRes] = await Promise.all([
          api.get("/analytics/summary?period=day"),
          api.get("/analytics/prediction")
        ]);

        if (!mounted) return;
        setSummary(summaryRes.data.data as AnalyticsSummary);
        setPrediction(predictionRes.data.data as PredictionData);
        setError(null);
      } catch {
        if (!mounted) return;
        setError("Failed to load admin analytics");
      }
    };

    void fetchData();
    const timer = setInterval(() => {
      void fetchData();
    }, 30_000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <header className="glass-card rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-subtle">Admin Console</p>
        <h1 className="mt-2 text-2xl font-semibold">Climate Control Analytics</h1>
        <p className="mt-1 text-sm text-subtle">Automation rules, predictive insights, and system-level control.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-sm text-cyan-300">
          Back to dashboard
        </Link>
      </header>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <section className="grid gap-3 md:grid-cols-3">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-subtle">Average Temperature</p>
          <p className="mt-2 text-2xl font-semibold">{summary?.averageTemperature ?? "--"} C</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-subtle">Average Humidity</p>
          <p className="mt-2 text-2xl font-semibold">{summary?.averageHumidity ?? "--"} %</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-subtle">Estimated Energy</p>
          <p className="mt-2 text-2xl font-semibold">{summary?.estimatedEnergyKwh ?? "--"} kWh</p>
        </div>
      </section>

      <section className="glass-card rounded-2xl p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-subtle">AI Forecast (2 hours)</p>
        <p className="mt-2 text-sm">
          Temperature: <strong>{prediction?.forecast?.next2hTemperature ?? "--"} C</strong> | Humidity:{" "}
          <strong>{prediction?.forecast?.next2hHumidity ?? "--"} %</strong>
        </p>
        <p className="mt-2 text-sm text-subtle">{prediction?.recommendation ?? "No recommendation yet."}</p>
      </section>
    </main>
  );
}
