"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { PlaySquare, Sparkles, TrendingUp, CheckCircle2, Info, Building2 } from "lucide-react";

export default function SimulationsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [elasticity, setElasticity] = useState(-0.4);
  const [priceChange, setPriceChange] = useState(10);
  const [running, setRunning] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [aiExplanation, setAiExplanation] = useState<any>(null);

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

  const handleRunSimulation = async () => {
    setRunning(true);
    try {
      // Calculate dynamic baseline from active model variables
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

      const baselineRevenue = customers * avgOrder;
      const baselineProfit = baselineRevenue - expenses;
      const baselineMargin = baselineRevenue > 0 ? (baselineProfit / baselineRevenue) * 100 : 0;

      // Calculate Scenario with Demand Elasticity: %ΔQ = elasticity * %ΔP
      const newAvgOrder = avgOrder * (1 + priceChange / 100);
      const customerPctChange = elasticity * (priceChange / 100);
      const newCustomers = Math.round(customers * (1 + customerPctChange));
      const scenarioRevenue = newCustomers * newAvgOrder;
      const scenarioExpenses = expenses;
      const scenarioProfit = scenarioRevenue - scenarioExpenses;
      const scenarioMargin = scenarioRevenue > 0 ? (scenarioProfit / scenarioRevenue) * 100 : 0;

      const profitChange = scenarioProfit - baselineProfit;
      const profitChangePct = baselineProfit !== 0 ? (profitChange / Math.abs(baselineProfit)) * 100 : 0;

      const calculatedResult = {
        model_name: activeModel?.name || "Baseline Model",
        baseline: { customers, avg_order: avgOrder, revenue: baselineRevenue, expenses, profit: baselineProfit, profit_margin: baselineMargin },
        scenario: { customers: newCustomers, avg_order: newAvgOrder, revenue: scenarioRevenue, expenses: scenarioExpenses, profit: scenarioProfit, profit_margin: scenarioMargin },
        comparison: { profit_change: profitChange, profit_change_percentage: profitChangePct, revenue_change: scenarioRevenue - baselineRevenue, expense_change: 0 }
      };

      setSimResult(calculatedResult);

      // Generate AI explanation for dynamic results
      const explanation = await api.explainResults(calculatedResult).catch(() => ({
        summary: `The scenario results in a net profit change of ${profitChange >= 0 ? '+' : ''}₦${profitChange.toLocaleString()} (${profitChangePct >= 0 ? '+' : ''}${profitChangePct.toFixed(1)}%).`,
        what_happened: `Net monthly profit changed from ₦${baselineProfit.toLocaleString()} to ₦${scenarioProfit.toLocaleString()}.`,
        why_it_happened: `A ${priceChange}% price change adjusted order value to ₦${newAvgOrder.toLocaleString()} while demand elasticity (${elasticity}) adjusted customer volume to ${newCustomers} customers.`,
        main_risks: "Competitor pricing reactions or sudden changes in customer price sensitivity.",
        most_sensitive_variable: "Average Order Value & Price Elasticity",
        practical_takeaway: "Maintaining service quality will preserve customer retention during pricing adjustments."
      }));

      setAiExplanation(explanation);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (selectedModelId || models.length > 0) {
      handleRunSimulation();
    }
  }, [selectedModelId, elasticity, priceChange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Simulation</h1>
          <p className="text-slate-400 text-sm">Evaluate price changes, demand elasticity, and profit impacts on your business model.</p>
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

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">Price Change (%):</span>
            <input
              type="number"
              value={priceChange}
              onChange={(e) => setPriceChange(parseFloat(e.target.value) || 0)}
              className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-white font-mono"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">Demand Elasticity:</span>
            <input
              type="number"
              step="0.1"
              value={elasticity}
              onChange={(e) => setElasticity(parseFloat(e.target.value) || -0.4)}
              className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-white font-mono"
            />
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={running}
            className="py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs transition flex items-center gap-2 shadow-md"
          >
            <PlaySquare className="w-4 h-4" />
            <span>{running ? "Simulating..." : "Run Simulation"}</span>
          </button>
        </div>
      </div>

      {simResult && (
        <div className="space-y-6">
          {/* Numerical Results Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Baseline Box */}
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Baseline Model</span>
                <span className="text-xs text-slate-400 font-mono">{simResult.model_name}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Monthly Revenue:</span>
                  <span className="font-mono font-bold text-white">₦{Math.round(simResult.baseline.revenue).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Operating Expenses:</span>
                  <span className="font-mono font-bold text-white">₦{Math.round(simResult.baseline.expenses).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-800">
                  <span className="text-slate-300 font-semibold">Net Profit:</span>
                  <span className={`font-mono font-extrabold ${simResult.baseline.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ₦{Math.round(simResult.baseline.profit).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Scenario Box */}
            <div className="glass-panel p-6 space-y-4 border-brand-500/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                  {priceChange >= 0 ? `+${priceChange}%` : `${priceChange}%`} Price Scenario
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${simResult.comparison.profit_change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {simResult.comparison.profit_change >= 0 ? '+' : ''}{simResult.comparison.profit_change_percentage.toFixed(1)}% Profit
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Scenario Revenue:</span>
                  <span className="font-mono font-bold text-white">₦{Math.round(simResult.scenario.revenue).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Scenario Expenses:</span>
                  <span className="font-mono font-bold text-white">₦{Math.round(simResult.scenario.expenses).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-800">
                  <span className="text-slate-300 font-semibold">Scenario Net Profit:</span>
                  <span className={`font-mono font-extrabold ${simResult.scenario.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ₦{Math.round(simResult.scenario.profit).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Explanation Module */}
          {aiExplanation && (
            <div className="glass-panel p-6 space-y-4 border-indigo-500/30">
              <div className="flex items-center gap-2 text-indigo-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Executive Insights Summary</h3>
              </div>
              <p className="text-xs text-slate-400">
                Automated executive summary of simulation results and key takeaways.
              </p>

              <div className="grid md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-slate-200 block mb-1">What Happened</span>
                  <p className="text-slate-400">{aiExplanation.what_happened}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-slate-200 block mb-1">Why It Happened</span>
                  <p className="text-slate-400">{aiExplanation.why_it_happened}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-amber-400 block mb-1">Main Risks</span>
                  <p className="text-slate-400">{aiExplanation.main_risks}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-bold text-emerald-400 block mb-1">Practical Takeaway</span>
                  <p className="text-slate-400">{aiExplanation.practical_takeaway}</p>
                </div>
              </div>
            </div>
          )}

          {/* Methodology & Assumptions */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Info className="w-4 h-4 text-brand-400" /> Assumptions & Methodology
            </span>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li>Baseline Revenue = {simResult.baseline.customers} Customers × ₦{simResult.baseline.avg_order.toLocaleString()} Avg Order = ₦{Math.round(simResult.baseline.revenue).toLocaleString()}</li>
              <li>Price Elasticity ({elasticity}): {priceChange}% price change → {simResult.scenario.customers} customers @ ₦{Math.round(simResult.scenario.avg_order).toLocaleString()} avg order = ₦{Math.round(simResult.scenario.revenue).toLocaleString()}</li>
              <li>Calculated by financial simulation engine</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
