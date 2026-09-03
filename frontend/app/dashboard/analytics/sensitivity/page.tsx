"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { BarChart3, RefreshCw } from "lucide-react";

export default function SensitivityPage() {
  const [perturbation, setPerturbation] = useState(10);
  const [loading, setLoading] = useState(false);
  const [sensitivityList, setSensitivityList] = useState<any[]>([]);

  const runSensitivity = async () => {
    setLoading(true);
    try {
      const res = await api.runSensitivity("seed-restaurant-001", { perturbation_pct: perturbation });
      setSensitivityList(res);
    } catch (err: any) {
      // Mock fallback
      setSensitivityList([
        { rank: 1, variable_name: "customers_per_month", display_name: "Customers per Month", baseline_value: 600, profit_at_plus_10: 584000, profit_at_minus_10: 416000, profit_swing: 168000, percentage_impact: 33.6 },
        { rank: 2, variable_name: "average_order_value", display_name: "Average Order Value", baseline_value: 2500, profit_at_plus_10: 584000, profit_at_minus_10: 416000, profit_swing: 168000, percentage_impact: 33.6 },
        { rank: 3, variable_name: "inventory_cost", display_name: "Inventory Cost", baseline_value: 500000, profit_at_plus_10: 450000, profit_at_minus_10: 550000, profit_swing: 100000, percentage_impact: 20.0 },
        { rank: 4, variable_name: "salary_cost", display_name: "Salary Cost", baseline_value: 250000, profit_at_plus_10: 475000, profit_at_minus_10: 525000, profit_swing: 50000, percentage_impact: 10.0 },
        { rank: 5, variable_name: "rent", display_name: "Rent", baseline_value: 100000, profit_at_plus_10: 490000, profit_at_minus_10: 510000, profit_swing: 20000, percentage_impact: 4.0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSensitivity();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sensitivity Analysis</h1>
          <p className="text-slate-400 text-sm">Rank variable influence on net profit via systematic perturbation testing.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">Perturbation:</span>
            <span className="text-white font-mono">±{perturbation}%</span>
          </div>
          <button
            onClick={runSensitivity}
            disabled={loading}
            className="py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs transition flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Re-analyze</span>
          </button>
        </div>
      </div>

      {/* Ranked Table */}
      <div className="glass-panel p-6 overflow-x-auto">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-400" />
          <span>Ranked Variable Impact Drivers (±{perturbation}% Perturbation)</span>
        </h3>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-3 font-semibold">Rank</th>
              <th className="pb-3 font-semibold">Variable</th>
              <th className="pb-3 font-semibold">Baseline Value</th>
              <th className="pb-3 font-semibold">Profit at +10%</th>
              <th className="pb-3 font-semibold">Profit at -10%</th>
              <th className="pb-3 font-semibold">Profit Swing</th>
              <th className="pb-3 font-semibold">% Profit Influence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sensitivityList.map((item) => (
              <tr key={item.rank} className="hover:bg-slate-900/40">
                <td className="py-3 font-bold text-brand-400 font-mono">#{item.rank}</td>
                <td className="py-3 font-medium text-slate-200">{item.display_name}</td>
                <td className="py-3 font-mono text-slate-400">₦{item.baseline_value.toLocaleString()}</td>
                <td className="py-3 font-mono text-emerald-400">₦{item.profit_at_plus_10.toLocaleString()}</td>
                <td className="py-3 font-mono text-rose-400">₦{item.profit_at_minus_10.toLocaleString()}</td>
                <td className="py-3 font-mono font-bold text-white">₦{item.profit_swing.toLocaleString()}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-500 h-full rounded-full"
                        style={{ width: `${Math.min(item.percentage_impact * 2, 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-brand-400 font-bold">{item.percentage_impact}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
