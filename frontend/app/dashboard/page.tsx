"use client";

import Link from "next/link";
import { Building2, GitFork, PlaySquare, Sparkles, TrendingUp, ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/40 border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Analytics & Decision Platform</span>
            <h1 className="text-2xl font-bold text-white mt-1">ScenarioX Executive Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Simulate decision parameters before execution. Un-hallucinated mathematical engine active.
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
          <p className="text-2xl font-extrabold text-white">1 Model</p>
          <p className="text-xs text-slate-500 mt-1">Restaurant Financial Baseline</p>
        </div>

        <div className="glass-panel p-5 glow-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Tested Scenarios</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <GitFork className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">4 Scenarios</p>
          <p className="text-xs text-slate-500 mt-1">Price raise, Marketing, Cost reduction</p>
        </div>

        <div className="glass-panel p-5 glow-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Executed Simulations</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <PlaySquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">1,000 Runs</p>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Immutable Snapshots
          </p>
        </div>

        <div className="glass-panel p-5 glow-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Latest Scenario Profit</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">₦584,000</p>
          <p className="text-xs text-emerald-400 mt-1">+16.8% vs Baseline (+₦84k)</p>
        </div>
      </div>

      {/* Quick Action Modules */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Model Card */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Active Restaurant Model</h3>
            <Link href="/dashboard/models/create" className="text-xs text-brand-400 hover:underline">
              Edit Variables
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400">Baseline Customers</span>
              <p className="text-xl font-bold text-white mt-1">600 / month</p>
              <span className="text-xs text-slate-500">Unit: customers/month</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400">Avg Order Value</span>
              <p className="text-xl font-bold text-white mt-1">₦2,500</p>
              <span className="text-xs text-slate-500">Unit: NGN/order</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400">Operating Expenses</span>
              <p className="text-xl font-bold text-white mt-1">₦1,000,000</p>
              <span className="text-xs text-slate-500">Inventory + Salary + Rent</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/dashboard/simulations"
              className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <span>Deterministic Simulation</span>
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

        {/* Core Principles Widget */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="font-bold text-base text-white">Engine Principles</h3>
          
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-brand-400 block mb-0.5">1. Strictly Un-hallucinated</span>
              <p className="text-slate-400">Math calculations are performed exclusively by pure Python/NumPy logic.</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-brand-400 block mb-0.5">2. Immutable Snapshots</span>
              <p className="text-slate-400">Simulation outputs store exact input snapshots for full reproducibility.</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-brand-400 block mb-0.5">3. AI Reasoning Layer</span>
              <p className="text-slate-400">AI assists in variable extraction and output explanation without touching numbers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
