"use client";

import Link from "next/link";
import { GitFork, ArrowLeft } from "lucide-react";

export default function ScenarioComparisonPage() {
  const comparisonData = [
    { metric: "Customers / Month", unit: "customers", baseline: 600, scenario1: 576, scenario2: 660, scenario3: 600 },
    { metric: "Avg Order Value", unit: "NGN/order", baseline: 2500, scenario1: 2750, scenario2: 2500, scenario3: 2500 },
    { metric: "Monthly Revenue", unit: "NGN", baseline: 1500000, scenario1: 1584000, scenario2: 1650000, scenario3: 1500000 },
    { metric: "Total Expenses", unit: "NGN", baseline: 1000000, scenario1: 1000000, scenario2: 1020000, scenario3: 950000 },
    { metric: "Net Monthly Profit", unit: "NGN", baseline: 500000, scenario1: 584000, scenario2: 630000, scenario3: 550000 },
    { metric: "Profit Margin", unit: "%", baseline: "33.33%", scenario1: "36.87%", scenario2: "38.18%", scenario3: "36.67%" },
    { metric: "Profit Delta vs Baseline", unit: "NGN", baseline: "₦0", scenario1: "+₦84,000", scenario2: "+₦130,000", scenario3: "+₦50,000" },
    { metric: "Profit Percentage Change", unit: "%", baseline: "0.0%", scenario1: "+16.8%", scenario2: "+26.0%", scenario3: "+10.0%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/scenarios" className="text-xs text-brand-400 hover:underline flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Scenarios
          </Link>
          <h1 className="text-2xl font-bold text-white">Scenario Comparison Matrix</h1>
          <p className="text-slate-400 text-sm">Side-by-side mathematical comparison of baseline against tested scenario variations.</p>
        </div>
      </div>

      <div className="glass-panel p-6 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-300">
              <th className="pb-3 font-semibold w-48">Financial Metric</th>
              <th className="pb-3 font-semibold text-slate-400">Unit</th>
              <th className="pb-3 font-semibold text-slate-300">Baseline Model</th>
              <th className="pb-3 font-semibold text-emerald-400">Price +10% (Elasticity -0.4)</th>
              <th className="pb-3 font-semibold text-indigo-400">Marketing +20% Push</th>
              <th className="pb-3 font-semibold text-amber-400">Inventory Cost -10%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {comparisonData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-900/40">
                <td className="py-3 font-medium text-slate-200">{row.metric}</td>
                <td className="py-3 font-mono text-slate-500">{row.unit}</td>
                <td className="py-3 font-mono text-slate-300">
                  {typeof row.baseline === "number" ? `₦${row.baseline.toLocaleString()}` : row.baseline}
                </td>
                <td className="py-3 font-mono font-bold text-emerald-400">
                  {typeof row.scenario1 === "number" ? `₦${row.scenario1.toLocaleString()}` : row.scenario1}
                </td>
                <td className="py-3 font-mono font-bold text-indigo-400">
                  {typeof row.scenario2 === "number" ? `₦${row.scenario2.toLocaleString()}` : row.scenario2}
                </td>
                <td className="py-3 font-mono font-bold text-amber-400">
                  {typeof row.scenario3 === "number" ? `₦${row.scenario3.toLocaleString()}` : row.scenario3}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
