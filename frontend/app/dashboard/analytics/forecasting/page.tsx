"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { Zap, Upload, Plus, LineChart, AlertCircle } from "lucide-react";
import { LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ForecastingPage() {
  const [metric, setMetric] = useState("profit");
  const [horizon, setHorizon] = useState(6);
  const [historical, setHistorical] = useState<any[]>([
    { period: "2026-01", customers: 520, revenue: 1300000, expenses: 900000, profit: 400000 },
    { period: "2026-02", customers: 550, revenue: 1380000, expenses: 920000, profit: 460000 },
    { period: "2026-03", customers: 570, revenue: 1420000, expenses: 940000, profit: 480000 },
  ]);
  const [loading, setLoading] = useState(false);
  const [forecastRes, setForecastRes] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddDataPoint = () => {
    const last = historical[historical.length - 1];
    setHistorical([
      ...historical,
      { period: `2026-0${historical.length + 1}`, customers: (last?.customers || 500) + 20, revenue: (last?.revenue || 1000000) + 50000, expenses: (last?.expenses || 800000) + 10000, profit: (last?.profit || 200000) + 40000 }
    ]);
  };

  const handleRunForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.runForecast("seed-restaurant-001", {
        metric,
        horizon,
        historical_data: historical
      });
      setForecastRes(res);
    } catch (err: any) {
      setError(err.message || "Failed to generate forecast.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Historical Time-Series Forecasting</h1>
          <p className="text-slate-400 text-sm">Linear regression trend forecasting with MAE/RMSE evaluation metrics and confidence bounds.</p>
        </div>

        <button
          onClick={handleRunForecast}
          disabled={loading || historical.length < 3}
          className="py-2.5 px-5 rounded-lg bg-zap-600 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs transition flex items-center gap-2 disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          <span>{loading ? "Forecasting..." : "Run Time-Series Forecast"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Historical Data Entry Box */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Historical Time-Series Ingestion</h3>
            <button
              onClick={handleAddDataPoint}
              className="py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-white flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Month</span>
            </button>
          </div>

          <div className="space-y-2">
            {historical.map((hp, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={hp.period}
                    onChange={(e) => {
                      const copy = [...historical];
                      copy[idx].period = e.target.value;
                      setHistorical(copy);
                    }}
                    className="w-24 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-white"
                  />
                  <span className="text-slate-500">Period #{idx + 1}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Revenue</label>
                    <input
                      type="number"
                      value={hp.revenue}
                      onChange={(e) => {
                        const copy = [...historical];
                        copy[idx].revenue = parseFloat(e.target.value) || 0;
                        copy[idx].profit = copy[idx].revenue - copy[idx].expenses;
                        setHistorical(copy);
                      }}
                      className="w-full px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Profit</label>
                    <input
                      type="number"
                      value={hp.profit}
                      onChange={(e) => {
                        const copy = [...historical];
                        copy[idx].profit = parseFloat(e.target.value) || 0;
                        setHistorical(copy);
                      }}
                      className="w-full px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forecast Output Chart & Evaluation Box */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <LineChart className="w-5 h-5 text-blue-400" />
              <span>Projected Forecast Trend & Bounds</span>
            </h3>

            {forecastRes && (
              <div className="flex gap-3 text-xs font-mono">
                <span className="text-slate-400">MAE: <strong className="text-white">₦{forecastRes.mae}</strong></span>
                <span className="text-slate-400">RMSE: <strong className="text-white">₦{forecastRes.rmse}</strong></span>
              </div>
            )}
          </div>

          {forecastRes ? (
            <div className="space-y-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={forecastRes.predictions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="period" stroke="#64748b" />
                    <YAxis stroke="#64748b" tickFormatter={(val) => `₦${(val/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
                    <Line type="monotone" dataKey="predicted_value" stroke="#3b82f6" strokeWidth={3} name="Predicted Profit" />
                    <Line type="monotone" dataKey="upper_bound" stroke="#10b981" strokeDasharray="5 5" name="Upper 95% Bound" />
                    <Line type="monotone" dataKey="lower_bound" stroke="#ef4444" strokeDasharray="5 5" name="Lower 95% Bound" />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2 font-semibold">Forecast Period</th>
                      <th className="pb-2 font-semibold">Predicted Profit</th>
                      <th className="pb-2 font-semibold">Lower Bound (95%)</th>
                      <th className="pb-2 font-semibold">Upper Bound (95%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {forecastRes.predictions.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2.5 font-medium text-slate-200">{p.period}</td>
                        <td className="py-2.5 font-mono font-bold text-blue-400">₦{p.predicted_value.toLocaleString()}</td>
                        <td className="py-2.5 font-mono text-rose-400">₦{p.lower_bound.toLocaleString()}</td>
                        <td className="py-2.5 font-mono text-emerald-400">₦{p.upper_bound.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
              <Zap className="w-8 h-8 text-slate-600 mb-2" />
              <span>Click "Run Time-Series Forecast" to project future outcomes.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
