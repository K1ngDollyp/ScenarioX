"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { BarChart3, RefreshCw, Building2 } from "lucide-react";

export default function SensitivityPage() {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [perturbation, setPerturbation] = useState(10);
  const [loading, setLoading] = useState(false);
  const [sensitivityList, setSensitivityList] = useState<any[]>([]);

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

  const runSensitivity = async () => {
    setLoading(true);
    try {
      if (!activeModel?.variables || activeModel.variables.length === 0) return;

      const vars = activeModel.variables;
      let customers = 600;
      let avgOrder = 2500;
      const expenseMap: Record<string, number> = {};
      let totalExpenses = 0;

      const custVar = vars.find((v: any) => v.variable_name === 'customers_per_month');
      const orderVar = vars.find((v: any) => v.variable_name === 'average_order_value');
      if (custVar) customers = Number(custVar.value) || 600;
      if (orderVar) avgOrder = Number(orderVar.value) || 2500;

      vars.forEach((v: any) => {
        if (v.category === 'expense' && v.variable_name !== 'customers_per_month' && v.variable_name !== 'average_order_value') {
          const val = Number(v.value) || 0;
          expenseMap[v.variable_name] = val;
          totalExpenses += val;
        }
      });

      if (totalExpenses === 0) totalExpenses = 1000000;
      const baselineRevenue = customers * avgOrder;
      const baselineProfit = baselineRevenue - totalExpenses;

      const results: any[] = [];

      vars.forEach((v: any) => {
        const val = Number(v.value) || 0;
        let profitPlus = baselineProfit;
        let profitMinus = baselineProfit;

        if (v.variable_name === 'customers_per_month') {
          const plusVal = val * (1 + perturbation / 100);
          const minusVal = val * (1 - perturbation / 100);
          profitPlus = (plusVal * avgOrder) - totalExpenses;
          profitMinus = (minusVal * avgOrder) - totalExpenses;
        } else if (v.variable_name === 'average_order_value') {
          const plusVal = val * (1 + perturbation / 100);
          const minusVal = val * (1 - perturbation / 100);
          profitPlus = (customers * plusVal) - totalExpenses;
          profitMinus = (customers * minusVal) - totalExpenses;
        } else if (v.category === 'expense') {
          const delta = val * (perturbation / 100);
          profitPlus = baselineRevenue - (totalExpenses + delta);
          profitMinus = baselineRevenue - (totalExpenses - delta);
        }

        const swing = Math.abs(profitPlus - profitMinus);
        results.push({
          variable_name: v.variable_name,
          display_name: v.display_name,
          baseline_value: val,
          profit_at_plus_10: Math.round(profitPlus),
          profit_at_minus_10: Math.round(profitMinus),
          profit_swing: Math.round(swing),
        });
      });

      // Calculate percentage impact relative to total swing
      const totalSwingSum = results.reduce((sum, item) => sum + item.profit_swing, 0) || 1;
      results.forEach(r => {
        r.percentage_impact = Number(((r.profit_swing / totalSwingSum) * 100).toFixed(1));
      });

      // Sort by impact rank descending
      results.sort((a, b) => b.profit_swing - a.profit_swing);
      results.forEach((r, idx) => r.rank = idx + 1);

      setSensitivityList(results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedModelId || models.length > 0) {
      runSensitivity();
    }
  }, [selectedModelId, perturbation]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1c1917]">Sensitivity Analysis</h1>
          <p className="text-[#57534e] text-sm">Rank variable influence on net profit via systematic perturbation testing.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {models.length > 0 && (
            <div className="flex items-center gap-2 bg-[#ffffff] px-3 py-2 rounded-xl border border-[#e7e0d3] text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#c85a32]" />
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
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
            <span className="text-[#57534e] font-semibold">Perturbation:</span>
            <span className="text-[#1c1917] font-mono">±{perturbation}%</span>
          </div>
          <button
            onClick={runSensitivity}
            disabled={loading}
            className="py-2.5 px-4 rounded-xl bg-[#c85a32] hover:bg-[#b04a25] text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Re-analyze</span>
          </button>
        </div>
      </div>

      {/* Ranked Table */}
      <div className="editorial-card p-6 overflow-x-auto">
        <h3 className="text-base font-serif font-bold text-[#1c1917] mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#c85a32]" />
          <span>Ranked Variable Impact Drivers (±{perturbation}% Perturbation)</span>
        </h3>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#e7e0d3] text-[#78716c]">
              <th className="pb-3 font-semibold">Rank</th>
              <th className="pb-3 font-semibold">Variable</th>
              <th className="pb-3 font-semibold">Baseline Value</th>
              <th className="pb-3 font-semibold">Profit at +10%</th>
              <th className="pb-3 font-semibold">Profit at -10%</th>
              <th className="pb-3 font-semibold">Profit Swing</th>
              <th className="pb-3 font-semibold">% Profit Influence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e7e0d3]">
            {sensitivityList.map((item) => (
              <tr key={item.rank} className="hover:bg-[#faf8f5]">
                <td className="py-3 font-bold text-[#c85a32] font-mono">#{item.rank}</td>
                <td className="py-3 font-medium text-[#1c1917]">{item.display_name}</td>
                <td className="py-3 font-mono text-[#57534e]">₦{item.baseline_value.toLocaleString()}</td>
                <td className="py-3 font-mono text-[#2d6a4f]">₦{item.profit_at_plus_10.toLocaleString()}</td>
                <td className="py-3 font-mono text-rose-600">₦{item.profit_at_minus_10.toLocaleString()}</td>
                <td className="py-3 font-mono font-bold text-[#1c1917]">₦{item.profit_swing.toLocaleString()}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-[#eae3d5] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#c85a32] h-full rounded-full"
                        style={{ width: `${Math.min(item.percentage_impact * 2, 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-[#c85a32] font-bold">{item.percentage_impact}%</span>
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

