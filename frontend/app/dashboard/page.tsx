"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Building2, GitFork, PlaySquare, Sparkles, TrendingUp, ArrowUpRight, CheckCircle2, Plus, Zap, ArrowRight, Shield } from "lucide-react";

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

  const marginPct = activeRevenue > 0 ? ((activeProfit / activeRevenue) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-8 border border-white/10 bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-slate-950 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Real-Time Business Intelligence</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              Executive Financial Control Center
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Simulate strategic business choices, analyze financial sensitivity, and forecast growth with mathematical precision.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/models/create-ai"
              className="py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-brand-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Assistant</span>
            </Link>
            <Link
              href="/dashboard/simulations"
              className="py-3 px-5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition flex items-center gap-2"
            >
              <PlaySquare className="w-4 h-4 text-emerald-400" />
              <span>Run Simulation</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="glass-panel p-5 glow-hover relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <Building2 className="w-16 h-16 text-indigo-400" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Active Business Models</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">{models.length}</p>
          <p className="text-xs text-slate-400 mt-2 truncate font-medium">
            {activeModel ? activeModel.name : "No models configured"}
          </p>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-5 glow-hover relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <GitFork className="w-16 h-16 text-cyan-400" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Gross Revenue</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <GitFork className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight font-mono">₦{activeRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Monthly recurring baseline</p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-5 glow-hover relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <PlaySquare className="w-16 h-16 text-rose-400" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Operating Expenses</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <PlaySquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight font-mono">₦{activeExpenses.toLocaleString()}</p>
          <p className="text-xs text-rose-400/90 mt-2 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-rose-400" />
            <span>Overhead costs included</span>
          </p>
        </div>

        {/* Card 4 */}
        <div className="glass-panel p-5 glow-hover relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <TrendingUp className="w-16 h-16 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Baseline Net Profit</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-3xl font-extrabold tracking-tight font-mono ${activeProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ₦{activeProfit.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-400/90 mt-2 font-mono font-semibold">{marginPct}% Profit Margin</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Active Model & Actions */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Active Business Profile</h2>
              <p className="text-xs text-slate-400 mt-0.5">Primary model parameters used across simulations.</p>
            </div>
            <Link href="/dashboard/models" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
              <span>Manage Models</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeModel ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-400">{activeModel.business_type}</span>
                  <span className="text-xs text-slate-500 font-mono">ID: {activeModel.id}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{activeModel.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{activeModel.description || "Baseline business model parameters."}</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 block mb-1">Parameters</span>
                  <p className="text-lg font-bold text-white">
                    {activeModel.variables ? activeModel.variables.length : 0} configured
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 block mb-1">Currency</span>
                  <p className="text-lg font-bold text-indigo-400 uppercase font-mono">
                    {activeModel.currency || "NGN"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 block mb-1">Category</span>
                  <p className="text-lg font-bold text-emerald-400 uppercase">
                    {activeModel.business_type || "General"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Business Models Created</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Create your business model to run financial simulations and risk analysis.
                </p>
              </div>
              <Link
                href="/dashboard/models/create-ai"
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create Model</span>
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-3">
            <Link
              href="/dashboard/simulations"
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <PlaySquare className="w-4 h-4 text-white" />
              <span>Simulate Scenarios</span>
            </Link>

            <Link
              href="/dashboard/simulations/monte-carlo"
              className="py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Monte Carlo Risk</span>
            </Link>

            <Link
              href="/dashboard/analytics/sensitivity"
              className="py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Sensitivity Drivers</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Platform Capabilities */}
        <div className="glass-panel p-6 space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-white tracking-tight mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Core Engine Architecture</span>
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <span className="font-bold text-indigo-300 block">1. Mathematical Vector Engine</span>
                <p className="text-slate-400 leading-relaxed">
                  Financial calculations are evaluated by deterministic Python mathematical models.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <span className="font-bold text-emerald-400 block">2. Complete Parameter Audit</span>
                <p className="text-slate-400 leading-relaxed">
                  Every simulation records input variable states for financial auditability.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <span className="font-bold text-cyan-400 block">3. Intelligent Natural Language</span>
                <p className="text-slate-400 leading-relaxed">
                  AI extracts financial variables from plain English business descriptions.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-500 font-mono">ScenarioX Engine v1.0 • Secure Session</span>
          </div>
        </div>
      </div>
    </div>
  );
}

