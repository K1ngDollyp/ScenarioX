"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { PlaySquare, Sparkles, TrendingUp, CheckCircle2, Info, Building2, GitFork } from "lucide-react";

export default function SimulationsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("default_price");
  const [elasticity, setElasticity] = useState(-0.4);
  const [priceChange, setPriceChange] = useState(10);
  const [running, setRunning] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [aiExplanation, setAiExplanation] = useState<any>(null);

  useEffect(() => {
    async function loadModelsAndScenarios() {
      const activeModels = await api.getModels();
      setModels(activeModels);
      if (activeModels.length > 0) {
        const firstModelId = activeModels[0].id;
        setSelectedModelId(firstModelId);
        const modelScenarios = await api.getScenarios(firstModelId);
        setScenarios(modelScenarios);

        // Read scenario_id from URL query string if present
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const qScenId = urlParams.get('scenario_id');
          if (qScenId) {
            setSelectedScenarioId(qScenId);
          }
        }
      }
    }
    loadModelsAndScenarios();
  }, []);

  const handleModelSelect = async (modelId: string) => {
    setSelectedModelId(modelId);
    const modelScenarios = await api.getScenarios(modelId);
    setScenarios(modelScenarios);
    setSelectedScenarioId("default_price");
  };

  const activeModel = models.find(m => m.id === selectedModelId) || models[0];
  const activeScenario = scenarios.find(s => s.id === selectedScenarioId);

  const handleRunSimulation = async () => {
    setRunning(true);
    try {
      // 1. Calculate Baseline metrics
      let customers = 600;
      let avgOrder = 2500;
      let expenses = 0;
      const expenseMap: Record<string, number> = {};

      if (activeModel?.variables) {
        const custVar = activeModel.variables.find((v: any) => v.variable_name === 'customers_per_month');
        const orderVar = activeModel.variables.find((v: any) => v.variable_name === 'average_order_value');

        if (custVar) customers = Number(custVar.value) || 600;
        if (orderVar) avgOrder = Number(orderVar.value) || 2500;

        activeModel.variables.forEach((v: any) => {
          if (v.category === 'expense' && v.variable_name !== 'customers_per_month' && v.variable_name !== 'average_order_value') {
            const val = Number(v.value) || 0;
            expenseMap[v.variable_name] = val;
            expenses += val;
          }
        });
      }

      if (expenses === 0) expenses = 1000000;

      const baselineRevenue = customers * avgOrder;
      const baselineProfit = baselineRevenue - expenses;
      const baselineMargin = baselineRevenue > 0 ? (baselineProfit / baselineRevenue) * 100 : 0;

      // 2. Compute Scenario modifications based on selected scenario
      let scenarioCustomers = customers;
      let scenarioAvgOrder = avgOrder;
      let scenarioExpenses = expenses;
      let activePriceChange = priceChange;
      let scenarioTitle = `${priceChange >= 0 ? '+' : ''}${priceChange}% Price Scenario`;

      if (selectedScenarioId !== "default_price" && activeScenario) {
        scenarioTitle = activeScenario.name;
        const changes = activeScenario.changes || [];
        activePriceChange = 0; // Default price change to 0 for custom scenarios unless price_change is explicitly present
        
        // Process scenario changes
        changes.forEach((c: any) => {
          const varName = c.variable_name;
          const changeVal = Number(c.change_value) || 0;
          const type = c.change_type || "percentage";

          if (varName === "price_change") {
            activePriceChange = changeVal;
          } else if (expenseMap[varName] !== undefined || varName === 'rent' || varName === 'salary_cost' || varName === 'marketing' || varName === 'inventory_cost' || varName === 'utilities') {
            const oldVal = expenseMap[varName] || (varName === 'rent' ? 100000 : varName === 'salary_cost' ? 250000 : 100000);
            let diff = 0;
            if (type === "percentage") {
              diff = oldVal * (changeVal / 100);
            } else if (type === "absolute") {
              diff = changeVal;
            } else if (type === "multiplier") {
              diff = oldVal * (changeVal - 1);
            }
            scenarioExpenses += diff;
          }
        });
      }

      const demandPctChange = (activePriceChange * elasticity) / 100;
      scenarioCustomers = Math.round(customers * (1 + demandPctChange));
      scenarioAvgOrder = avgOrder * (1 + (activePriceChange / 100));

      const scenarioRevenue = scenarioCustomers * scenarioAvgOrder;
      const scenarioProfit = scenarioRevenue - scenarioExpenses;
      const scenarioMargin = scenarioRevenue > 0 ? (scenarioProfit / scenarioRevenue) * 100 : 0;

      const profitChange = scenarioProfit - baselineProfit;
      const profitChangePct = baselineProfit !== 0 ? (profitChange / Math.abs(baselineProfit)) * 100 : 0;

      const calcRes = {
        model_name: activeModel?.name || "Standard Model",
        scenario_title: scenarioTitle,
        baseline: {
          customers,
          avg_order: avgOrder,
          revenue: baselineRevenue,
          expenses: expenses,
          profit: baselineProfit,
          profit_margin: baselineMargin,
        },
        scenario: {
          customers: scenarioCustomers,
          avg_order: scenarioAvgOrder,
          revenue: scenarioRevenue,
          expenses: scenarioExpenses,
          profit: scenarioProfit,
          profit_margin: scenarioMargin,
        },
        comparison: {
          profit_change: profitChange,
          profit_change_percentage: profitChangePct,
        }
      };

      setSimResult(calcRes);

      const exp = {
        what_happened: `Running "${scenarioTitle}" results in monthly profit of ₦${Math.round(scenarioProfit).toLocaleString()} compared to baseline ₦${Math.round(baselineProfit).toLocaleString()}.`,
        why_it_happened: `Price adjustment of ${activePriceChange}% shifted customer volume by ${(demandPctChange * 100).toFixed(1)}% due to demand elasticity (${elasticity}).`,
        main_risks: profitChange < 0 ? "Profit drop due to customer volume reduction exceeding price gain." : "Risk of higher operational stress if customer volume expands rapidly.",
        practical_takeaway: profitChange >= 0 ? "Positive financial outcome under verified elasticity parameters." : "Consider offset reduction in overhead before implementing price raise."
      };
      setAiExplanation(exp);
    } catch (err: any) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (selectedModelId || models.length > 0) {
      handleRunSimulation();
    }
  }, [selectedModelId, selectedScenarioId, elasticity, priceChange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1c1917]">Financial Simulation</h1>
          <p className="text-[#57534e] text-sm">Evaluate custom scenarios, price changes, and profit impacts on your business model.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {models.length > 0 && (
            <div className="flex items-center gap-2 bg-[#ffffff] px-3 py-2 rounded-xl border border-[#e7e0d3] text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#c85a32]" />
              <select
                value={selectedModelId}
                onChange={(e) => handleModelSelect(e.target.value)}
                className="bg-transparent text-[#1c1917] font-medium focus:outline-none"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#ffffff] text-[#1c1917]">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 bg-[#ffffff] px-3 py-2 rounded-xl border border-[#e7e0d3] text-xs">
            <GitFork className="w-3.5 h-3.5 text-[#c85a32]" />
            <select
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
              className="bg-transparent text-[#1c1917] font-medium focus:outline-none"
            >
              <option value="default_price" className="bg-[#ffffff] text-[#1c1917]">Price Change Slider</option>
              {scenarios.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#ffffff] text-[#1c1917]">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {selectedScenarioId === "default_price" && (
            <div className="flex items-center gap-2 bg-[#ffffff] px-3 py-2 rounded-xl border border-[#e7e0d3] text-xs">
              <span className="text-[#57534e] font-semibold">Price Change (%):</span>
              <input
                type="number"
                value={priceChange}
                onChange={(e) => setPriceChange(parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-0.5 rounded-lg bg-[#faf8f5] border border-[#e7e0d3] text-[#1c1917] font-mono"
              />
            </div>
          )}

          <div className="flex items-center gap-2 bg-[#ffffff] px-3 py-2 rounded-xl border border-[#e7e0d3] text-xs">
            <span className="text-[#57534e] font-semibold">Demand Elasticity:</span>
            <input
              type="number"
              step="0.1"
              value={elasticity}
              onChange={(e) => setElasticity(parseFloat(e.target.value) || -0.4)}
              className="w-16 px-2 py-0.5 rounded-lg bg-[#faf8f5] border border-[#e7e0d3] text-[#1c1917] font-mono"
            />
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={running}
            className="py-2.5 px-4 rounded-xl bg-[#c85a32] hover:bg-[#b04a25] text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm"
          >
            <PlaySquare className="w-4 h-4" />
            <span>{running ? "Simulating..." : "Run Simulation"}</span>
          </button>
        </div>
      </div>

      {simResult && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="editorial-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#78716c] uppercase tracking-wider">Baseline Model</span>
                <span className="text-xs text-[#78716c] font-mono">{simResult.model_name}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#57534e]">Monthly Revenue:</span>
                  <span className="font-mono font-bold text-[#1c1917]">₦{Math.round(simResult.baseline.revenue).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#57534e]">Total Operating Expenses:</span>
                  <span className="font-mono font-bold text-[#1c1917]">₦{Math.round(simResult.baseline.expenses).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-[#e7e0d3]">
                  <span className="text-[#1c1917] font-semibold">Net Profit:</span>
                  <span className={`font-mono font-extrabold ${simResult.baseline.profit >= 0 ? 'text-[#2d6a4f]' : 'text-[#c85a32]'}`}>
                    ₦{Math.round(simResult.baseline.profit).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="editorial-card p-6 space-y-4 border-[#c85a32]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#c85a32] uppercase tracking-wider">
                  {simResult.scenario_title || `${priceChange >= 0 ? '+' : ''}${priceChange}% Price Scenario`}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${simResult.comparison.profit_change >= 0 ? 'tag-sage' : 'tag-terracotta'}`}>
                  {simResult.comparison.profit_change >= 0 ? '+' : ''}{simResult.comparison.profit_change_percentage.toFixed(1)}% Profit
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#57534e]">Scenario Revenue:</span>
                  <span className="font-mono font-bold text-[#1c1917]">₦{Math.round(simResult.scenario.revenue).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#57534e]">Scenario Expenses:</span>
                  <span className="font-mono font-bold text-[#1c1917]">₦{Math.round(simResult.scenario.expenses).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-[#e7e0d3]">
                  <span className="text-[#1c1917] font-semibold">Scenario Net Profit:</span>
                  <span className={`font-mono font-extrabold ${simResult.scenario.profit >= 0 ? 'text-[#2d6a4f]' : 'text-[#c85a32]'}`}>
                    ₦{Math.round(simResult.scenario.profit).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {aiExplanation && (
            <div className="editorial-card p-6 space-y-4 border-[#c85a32]/30">
              <div className="flex items-center gap-2 text-[#c85a32]">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-serif font-bold text-[#1c1917] text-base">Executive Insights Summary</h3>
              </div>
              <p className="text-xs text-[#57534e]">
                Automated executive summary of simulation results and key takeaways.
              </p>

              <div className="grid md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e7e0d3]">
                  <span className="font-bold text-[#1c1917] block mb-1">What Happened</span>
                  <p className="text-[#57534e]">{aiExplanation.what_happened}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e7e0d3]">
                  <span className="font-bold text-[#1c1917] block mb-1">Why It Happened</span>
                  <p className="text-[#57534e]">{aiExplanation.why_it_happened}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e7e0d3]">
                  <span className="font-bold text-[#c85a32] block mb-1">Main Risks</span>
                  <p className="text-[#57534e]">{aiExplanation.main_risks}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e7e0d3]">
                  <span className="font-bold text-[#2d6a4f] block mb-1">Practical Takeaway</span>
                  <p className="text-[#57534e]">{aiExplanation.practical_takeaway}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#f4efe6] border border-[#e4dcd0] text-xs space-y-2">
            <span className="font-semibold text-[#1c1917] flex items-center gap-1">
              <Info className="w-4 h-4 text-[#c85a32]" /> Assumptions & Methodology
            </span>
            <ul className="list-disc list-inside text-[#57534e] space-y-1">
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
