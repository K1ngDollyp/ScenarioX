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
          <p className="text-xs text-slate-500 mt-1">{activeModel ? activeModel.name : "No active models created"}</p>
        </div>

        <div className="glass-panel p-5 glow-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Tested Scenarios</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <GitFork className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{models.length > 0 ? "1 Scenario" : "0 Scenarios"}</p>
          <p className="text-xs text-slate-500 mt-1">{models.length > 0 ? "Price raise & elasticity" : "Create a model to build scenarios"}</p>
        </div>

        <div className="glass-panel p-5 glow-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Executed Simulations</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <PlaySquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{models.length > 0 ? "1 Run" : "0 Runs"}</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Complete Audit Logs</span>
          </p>
        </div>

        <div className="glass-panel p-5 glow-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Latest Scenario Profit</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">{models.length > 0 ? "₦584,000" : "₦0"}</p>
          <p className="text-xs text-slate-500 mt-1 font-mono">{models.length > 0 ? "+16.8% vs Baseline (+₦84k)" : "No runs evaluated"}</p>
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
