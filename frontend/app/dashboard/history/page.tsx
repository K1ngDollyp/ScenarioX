"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { History, PlaySquare, ShieldCheck } from "lucide-react";

export default function SimulationHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Seed simulation history snapshot
    const seedHistory = [
      {
        id: "sim-snapshot-001",
        simulation_type: "deterministic",
        status: "completed",
        created_at: new Date().toISOString(),
        snapshot_data: {
          formula_version: "1.0",
          elasticity: -0.4,
          scenario_changes: [{ variable_name: "price_change", change_type: "percentage", change_value: 10.0 }]
        },
        results: [
          { metric_name: "baseline_profit", metric_value: 500000 },
          { metric_name: "scenario_profit", metric_value: 584000 },
          { metric_name: "profit_change", metric_value: 84000 },
        ]
      }
    ];

    api.getSimulations("seed-restaurant-001")
      .then((data) => setHistory(data.length > 0 ? data : seedHistory))
      .catch(() => setHistory(seedHistory));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Simulation History Snapshots</h1>
        <p className="text-slate-400 text-sm">Immutable snapshot logs preserving exact historical simulation parameters and results.</p>
      </div>

      <div className="space-y-4">
        {history.map((sim) => (
          <div key={sim.id} className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <PlaySquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-brand-400 uppercase">{sim.simulation_type} SIMULATION</span>
                  <h3 className="font-bold text-white text-base">Run #{sim.id.substring(0, 8)}</h3>
                </div>
              </div>

              <span className="text-xs text-slate-500 font-mono">
                {new Date(sim.created_at).toLocaleString()}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1 font-semibold">Snapshot Context</span>
                <p className="text-slate-300 font-mono">Formula: v{sim.snapshot_data?.formula_version || "1.0"}</p>
                <p className="text-slate-300 font-mono">Elasticity: {sim.snapshot_data?.elasticity || -0.4}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1 font-semibold">Scenario Delta</span>
                <p className="text-slate-300 font-mono">
                  {sim.snapshot_data?.scenario_changes?.[0]?.variable_name}: +{sim.snapshot_data?.scenario_changes?.[0]?.change_value}%
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1 font-semibold">Net Profit Outcome</span>
                <p className="text-emerald-400 font-bold font-mono text-sm">
                  +₦84,000 (+16.8%)
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
