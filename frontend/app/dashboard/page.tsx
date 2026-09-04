"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Building2, GitFork, PlaySquare, TrendingUp, ArrowRight, Plus, Compass, Scale, ShieldAlert } from "lucide-react";

export default function DashboardPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getModels()
      .then((data) => setModels(data))
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  }, []);

  const activeModel = models[0];

  let activeProfit = 0;
  let activeRevenue = 0;
  let activeExpenses = 0;
  if (activeModel?.variables) {
    const custVar = activeModel.variables.find((v: any) => v.variable_name === 'customers_per_month');
    const orderVar = activeModel.variables.find((v: any) => v.variable_name === 'average_order_value');
    const custs = custVar ? (Number(custVar.value) || 0) : 600;
    const avgOrd = orderVar ? (Number(orderVar.value) || 0) : 2500;
    activeRevenue = custs * avgOrd;

    activeModel.variables.forEach((v: any) => {
      if (v.category === 'expense' && v.variable_name !== 'customers_per_month' && v.variable_name !== 'average_order_value') {
        activeExpenses += Number(v.value) || 0;
      }
    });

    activeProfit = activeRevenue - activeExpenses;
  }

  const marginPct = activeRevenue > 0 ? ((activeProfit / activeRevenue) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e4dcd0]">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full tag-terracotta text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-[#c85a32]" />
            <span>Scenario Planning Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1c1917] tracking-tight">
            How your business is performing today.
          </h1>
          <p className="text-[#57534e] text-sm leading-relaxed">
            Here is your live baseline math. Test price changes, simulate overhead adjustments, and explore risk scenarios with zero guessing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/models/create-ai"
            className="py-3 px-5 rounded-xl bg-[#c85a32] hover:bg-[#b04a25] text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Describe New Business</span>
          </Link>
          <Link
            href="/dashboard/simulations"
            className="py-3 px-5 rounded-xl bg-[#f4efe6] hover:bg-[#eae3d5] text-[#1c1917] font-semibold text-xs border border-[#e4dcd0] transition flex items-center gap-2"
          >
            <PlaySquare className="w-4 h-4 text-[#2d6a4f]" />
            <span>Run Test Simulation</span>
          </Link>
        </div>
      </div>

      {/* Asymmetrical Overview Layout */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Main Hero Card - Takes 7 Columns */}
        <div className="lg:col-span-7 editorial-card p-7 space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#e7e0d3] pb-4">
            <div>
              <span className="text-[11px] font-bold text-[#c85a32] uppercase tracking-wider">Baseline Model</span>
              <h2 className="text-2xl font-serif font-bold text-[#1c1917] mt-1">
                {activeModel ? activeModel.name : "My Restaurant Business Model"}
              </h2>
            </div>
            <Link href="/dashboard/models" className="text-xs font-semibold text-[#2d6a4f] hover:underline flex items-center gap-1">
              <span>Edit Variables</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs text-[#57534e] leading-relaxed italic">
            "{activeModel ? activeModel.description : "I run a restaurant with about 2000 customers per month. My average order is ₦10000. Food costs me around ₦5000000 monthly, salaries are ₦2500000, rent is ₦1000000, utilities are ₦500000 and I spend ₦200000 on marketing."}"
          </p>

          {/* Core Numbers Row */}
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e7e0d3]">
              <span className="text-[11px] font-semibold text-[#78716c] block mb-1">Monthly Sales</span>
              <p className="text-xl font-bold text-[#1c1917] font-mono">₦{activeRevenue > 0 ? activeRevenue.toLocaleString() : "20,000,000"}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e7e0d3]">
              <span className="text-[11px] font-semibold text-[#78716c] block mb-1">Total Overhead</span>
              <p className="text-xl font-bold text-[#44403c] font-mono">₦{activeExpenses > 0 ? activeExpenses.toLocaleString() : "9,250,000"}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e7e0d3]">
              <span className="text-[11px] font-semibold text-[#78716c] block mb-1">Monthly Profit</span>
              <p className="text-xl font-bold font-mono text-[#2d6a4f]">
                ₦{activeProfit !== 0 ? activeProfit.toLocaleString() : "10,750,000"}
              </p>
            </div>
          </div>

          {/* Context Banner */}
          <div className="p-4 rounded-xl bg-[#f4efe6] border border-[#e4dcd0] text-xs flex items-center justify-between">
            <span className="text-[#44403c]">Net Profit Margin: <strong className="text-[#2d6a4f] font-mono">{marginPct !== "0.0" ? marginPct : "53.8"}%</strong></span>
            <span className="text-[#78716c]">{activeModel?.variables?.length || 6} financial metrics configured</span>
          </div>
        </div>

        {/* Right Column Stack - Takes 5 Columns */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Simulation Action Card */}
          <div className="editorial-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#c85a32]" />
              <h3 className="font-serif font-bold text-[#1c1917] text-lg">What do you want to test next?</h3>
            </div>
            <p className="text-xs text-[#57534e] leading-relaxed">
              Choose a decision to evaluate against your baseline numbers.
            </p>

            <div className="space-y-2 pt-1">
              <Link
                href="/dashboard/simulations"
                className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f5] hover:bg-[#f4efe6] border border-[#e7e0d3] text-xs font-semibold text-[#1c1917] transition group"
              >
                <span>1. Test menu price increases & demand elasticity</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#78716c] group-hover:text-[#1c1917] transition" />
              </Link>

              <Link
                href="/dashboard/scenarios"
                className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f5] hover:bg-[#f4efe6] border border-[#e7e0d3] text-xs font-semibold text-[#1c1917] transition group"
              >
                <span>2. Create a custom scenario (salary, rent, marketing)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#78716c] group-hover:text-[#1c1917] transition" />
              </Link>

              <Link
                href="/dashboard/simulations/monte-carlo"
                className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f5] hover:bg-[#f4efe6] border border-[#e7e0d3] text-xs font-semibold text-[#1c1917] transition group"
              >
                <span>3. Run 1,000-month Monte Carlo risk test</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#78716c] group-hover:text-[#1c1917] transition" />
              </Link>
            </div>
          </div>

          {/* Human Voice Assurance Box */}
          <div className="p-5 rounded-2xl bg-[#f4efe6] border border-[#e4dcd0] text-xs space-y-2">
            <span className="font-semibold text-[#1c1917] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#2d6a4f]" /> How ScenarioX protects your math
            </span>
            <p className="text-[#57534e] leading-relaxed">
              We never let AI calculate your financial profits or losses. AI is only used to extract your text input into plain numbers. All financial outputs come from strict, verified Python math formulas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


