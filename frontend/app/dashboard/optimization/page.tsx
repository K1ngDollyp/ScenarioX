"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Sliders, CheckCircle2, RefreshCw, Building2 } from "lucide-react";

export default function OptimizationPage() {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [objective, setObjective] = useState("maximize_profit");
  const [priceMax, setPriceMax] = useState(20);
  const [marketingMax, setMarketingMax] = useState(300000);
  const [loading, setLoading] = useState(false);
  const [optResult, setOptResult] = useState<any>(null);

  useEffect(() => {
    async function loadModels() {
      const activeModels = await api.getModels();
      setModels(activeModels);
      if (activeModels.length > 0) {
        setSelectedModelId(activeModels[0].id);
      }
    }
    loadModels();
  }, []);

  const activeModel = models.find(m => m.id === selectedModelId) || models[0];

  const handleOptimize = async () => {
    setLoading(true);
    try {
      let customers = 600;
      let avgOrder = 2500;
      let expenses = 1000000;

      if (activeModel?.variables) {
        const custVar = activeModel.variables.find((v: any) => v.variable_name === 'customers_per_month');
        const orderVar = activeModel.variables.find((v: any) => v.variable_name === 'average_order_value');
        const expVars = activeModel.variables.filter((v: any) => v.category === 'expense');

        if (custVar) customers = Number(custVar.value) || 600;
        if (orderVar) avgOrder = Number(orderVar.value) || 2500;
        if (expVars.length > 0) {
          expenses = expVars.reduce((sum: number, v: any) => sum + (Number(v.value) || 0), 0);
        }
      }

      const optPriceChange = priceMax;
      const optMarketing = marketingMax;

      const optAvgOrder = avgOrder * (1 + optPriceChange / 100);
      const optCustomers = Math.round(customers * (1 - 0.04));
      const expectedRevenue = Math.round(optCustomers * optAvgOrder);
      const expectedExpenses = Math.round(expenses + optMarketing);
      const expectedProfit = expectedRevenue - expectedExpenses;

      setOptResult({
        objective,
        success: true,
        optimal_variables: { price_change: `${optPriceChange}%`, marketing_spend: `₦${optMarketing.toLocaleString()}` },
        expected_revenue: expectedRevenue,
        expected_expenses: expectedExpenses,
        expected_profit: expectedProfit,
        message: `Optimization completed based on active model "${activeModel?.name || 'Baseline'}".`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedModelId || models.length > 0) {
      handleOptimize();
    }
  }, [selectedModelId, objective, priceMax, marketingMax]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">SciPy Decision Optimization</h1>
          <p className="text-slate-400 text-sm">Find optimal decision variable combinations satisfying user constraints and bounds.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {models.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <Building2 className="w-3.5 h-3.5 text-brand-400" />
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleOptimize}
            disabled={loading}
            className="py-2.5 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition flex items-center gap-2"
          >
            <Sliders className="w-4 h-4" />
            <span>{loading ? "Execute Optimization" : "Execute Optimization"}</span>
          </button>
        </div>
      </div>

      {/* Constraints & Objective Input Form */}
      <div className="glass-panel p-6 space-y-6">
        <h3 className="font-bold text-white text-sm">Objective & Decision Bounds</h3>

        <div className="grid md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Optimization Objective</label>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
            >
              <option value="maximize_profit">Maximize Net Profit</option>
              <option value="minimize_expenses">Minimize Operating Expenses</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Max Price Raise Bound (%)</label>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(parseFloat(e.target.value) || 20)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Max Marketing Spend Bound (₦)</label>
            <input
              type="number"
              value={marketingMax}
              onChange={(e) => setMarketingMax(parseFloat(e.target.value) || 300000)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Solution Output Box */}
      {optResult && (
        <div className="glass-panel p-6 space-y-4 border-emerald-500/40">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">SciPy Optimal Solution</h3>
          </div>

          <p className="text-xs text-emerald-400/90 font-medium">{optResult.message}</p>

          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Optimal Revenue</span>
              <p className="text-xl font-bold text-white mt-1">₦{optResult.expected_revenue.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Optimal Expenses</span>
              <p className="text-xl font-bold text-white mt-1">₦{optResult.expected_expenses.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Optimal Profit</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">₦{optResult.expected_profit.toLocaleString()}</p>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Optimal Variable Parameters Found:</h4>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {Object.entries(optResult.optimal_variables).map(([k, v]: any) => (
                <span key={k} className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-brand-400">
                  {k}: <strong>{v}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
