"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { api } from "@/lib/api-client";
import { Building2, GitFork, PlaySquare, ArrowRight, TrendingUp } from "lucide-react";

export default function ModelOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed model fallback
    const seedModel = {
      id: resolvedParams.id,
      name: "Standard Restaurant Baseline",
      business_type: "restaurant",
      currency: "NGN",
      description: "600 customers/month @ ₦2,500 avg order, ₦1.0M operating expenses.",
      created_at: new Date().toISOString(),
      variables: [
        { variable_name: "customers_per_month", display_name: "Customers per Month", category: "revenue", value: 600, unit: "customers/month", currency: "NGN" },
        { variable_name: "average_order_value", display_name: "Average Order Value", category: "revenue", value: 2500, unit: "NGN/order", currency: "NGN" },
        { variable_name: "inventory_cost", display_name: "Inventory Cost", category: "expense", value: 500000, unit: "NGN/month", currency: "NGN" },
        { variable_name: "salary_cost", display_name: "Salary Cost", category: "expense", value: 250000, unit: "NGN/month", currency: "NGN" },
        { variable_name: "rent", display_name: "Rent", category: "expense", value: 100000, unit: "NGN/month", currency: "NGN" },
        { variable_name: "utilities", display_name: "Utilities", category: "expense", value: 50000, unit: "NGN/month", currency: "NGN" },
        { variable_name: "marketing", display_name: "Marketing", category: "expense", value: 100000, unit: "NGN/month", currency: "NGN" },
      ]
    };

    api.getModel(resolvedParams.id)
      .then((data) => setModel(data))
      .catch(() => setModel(seedModel))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return <div className="glass-panel p-8 text-center text-slate-500">Loading model overview...</div>;
  }

  // Calculate baseline preview
  const varsMap: Record<string, number> = {};
  model?.variables?.forEach((v: any) => { varsMap[v.variable_name] = v.value; });

  const revenue = (varsMap["customers_per_month"] || 0) * (varsMap["average_order_value"] || 0);
  const expenses = (varsMap["inventory_cost"] || 0) + (varsMap["salary_cost"] || 0) + (varsMap["rent"] || 0) + (varsMap["utilities"] || 0) + (varsMap["marketing"] || 0);
  const profit = revenue - expenses;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">{model.business_type}</span>
          <h1 className="text-2xl font-bold text-white mt-0.5">{model.name}</h1>
          <p className="text-slate-400 text-sm">{model.description}</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/scenarios"
            className="py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs transition shadow-md flex items-center gap-2"
          >
            <GitFork className="w-4 h-4" />
            <span>Create Scenario</span>
          </Link>
          <Link
            href="/dashboard/simulations"
            className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition border border-slate-700 flex items-center gap-2"
          >
            <PlaySquare className="w-4 h-4" />
            <span>Run Deterministic Simulation</span>
          </Link>
        </div>
      </div>

      {/* Baseline Financial KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5">
          <span className="text-xs font-medium text-slate-400">Baseline Revenue</span>
          <p className="text-2xl font-extrabold text-white mt-1">₦{revenue.toLocaleString()}</p>
          <span className="text-xs text-slate-500">600 customers × ₦2,500</span>
        </div>

        <div className="glass-panel p-5">
          <span className="text-xs font-medium text-slate-400">Total Expenses</span>
          <p className="text-2xl font-extrabold text-white mt-1">₦{expenses.toLocaleString()}</p>
          <span className="text-xs text-slate-500">Inventory + Salaries + Rent</span>
        </div>

        <div className="glass-panel p-5">
          <span className="text-xs font-medium text-slate-400">Baseline Net Profit</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">₦{profit.toLocaleString()}</p>
          <span className="text-xs text-slate-500">Revenue - Expenses</span>
        </div>

        <div className="glass-panel p-5">
          <span className="text-xs font-medium text-slate-400">Profit Margin</span>
          <p className="text-2xl font-extrabold text-brand-400 mt-1">{margin.toFixed(2)}%</p>
          <span className="text-xs text-slate-500">Margin ratio</span>
        </div>
      </div>

      {/* Configured Variables Table */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Configured Variables & Metadata</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2 font-semibold">Variable Name</th>
                <th className="pb-2 font-semibold">Display Label</th>
                <th className="pb-2 font-semibold">Category</th>
                <th className="pb-2 font-semibold">Value</th>
                <th className="pb-2 font-semibold">Unit</th>
                <th className="pb-2 font-semibold">Currency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {model.variables.map((v: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="py-2.5 font-mono text-brand-400">{v.variable_name}</td>
                  <td className="py-2.5 font-medium text-slate-200">{v.display_name}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${v.category === 'revenue' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {v.category}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono font-bold text-white">
                    {v.currency === 'NGN' ? `₦${v.value.toLocaleString()}` : v.value}
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">{v.unit}</td>
                  <td className="py-2.5 font-mono text-slate-400">{v.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
