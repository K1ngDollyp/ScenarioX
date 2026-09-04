"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Building2, GitFork, PlaySquare, Sparkles, TrendingUp, ArrowUpRight, CheckCircle2, Plus } from "lucide-react";

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

  // Dynamically compute active model baseline profit
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

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/40 border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Analytics & Decision Platform</span>
            <h1 className="text-2xl font-bold text-white mt-1">ScenarioX Executive Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Simulate financial decisions and forecast business performance in real time.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/models/create-ai"
              className="py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition shadow-lg shadow-brand-600/30 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Model Assistant</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 glow-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Active Business Models</span>
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{models.length} {models.length === 1 ? 'Model' : 'Models'}</p>
          <p className="text-xs text-slate-500 mt-1 truncate">{activeModel ? activeModel.name : "No active models created"}</p>
        </div>

        <div className="glass-panel p-5 glow-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Monthly Revenue</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <GitFork className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">₦{activeRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{models.length > 0 ? "Baseline Gross Revenue" : "Create a model"}</p>
        </div>

        <div className="glass-panel p-5 glow-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Total Operating Expenses</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <PlaySquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">₦{activeExpenses.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Monthly Overhead</span>
          </p>
        </div>

        <div className="glass-panel p-5 glow-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Baseline Monthly Net Profit</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-extrabold ${activeProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ₦{activeProfit.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-mono">{activeRevenue > 0 ? `${((activeProfit / activeRevenue) * 100).toFixed(1)}% Profit Margin` : "No model data"}</p>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Active Business Overview</h2>
            <Link href="/dashboard/models" className="text-xs text-brand-400 hover:underline font-medium">
              View All Models →
            </Link>
          </div>

          {activeModel ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-white text-base">{activeModel.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{activeModel.description || "Baseline business model parameters."}</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Configured Variables</span>
                  <p className="text-xl font-bold text-white mt-1">
                    {activeModel.variables ? activeModel.variables.length : 0} variables
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Currency</span>
                  <p className="text-xl font-bold text-white mt-1 uppercase">
                    {activeModel.currency || "NGN"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Business Type</span>
                  <p className="text-xl font-bold text-white mt-1 uppercase">
                    {activeModel.business_type || "General"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-4">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">No Business Models Added Yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Create your first business model using our AI assistant or manual variable entry to unlock simulations.
                </p>
              </div>
              <Link
                href="/dashboard/models/create-ai"
                className="inline-flex items-center gap-2 py-2 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs transition shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Create Business Model</span>
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-3">
            <Link
              href="/dashboard/simulations"
              className="py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md"
            >
              <span>Run Simulation</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/dashboard/simulations/monte-carlo"
              className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <span>Monte Carlo Risk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/dashboard/analytics/sensitivity"
              className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <span>Sensitivity Analysis</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Core Capabilities Widget */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="font-bold text-base text-white">Platform Highlights</h3>
          
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-brand-400 block mb-0.5">1. Financial Precision</span>
              <p className="text-slate-400">Calculations are executed with exact mathematical vector models.</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-brand-400 block mb-0.5">2. Complete Audit Trace</span>
              <p className="text-slate-400">Simulation outputs record input variables for complete auditability.</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-brand-400 block mb-0.5">3. Smart AI Guidance</span>
              <p className="text-slate-400">Natural language assistant extracts variables and explains profit drivers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
