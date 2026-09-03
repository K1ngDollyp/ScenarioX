"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Building2, Plus, Sparkles, ArrowRight } from "lucide-react";

export default function BusinessModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Default seed model for immediate demonstration
    const seedModel = {
      id: "seed-restaurant-001",
      name: "Standard Restaurant Baseline",
      business_type: "restaurant",
      currency: "NGN",
      description: "600 customers/month @ ₦2,500 avg order, ₦1.0M expenses.",
      created_at: new Date().toISOString(),
      variables: [
        { variable_name: "customers_per_month", display_name: "Customers", value: 600, unit: "customers/month" },
        { variable_name: "average_order_value", display_name: "Avg Order Value", value: 2500, unit: "NGN/order" },
        { variable_name: "inventory_cost", display_name: "Inventory Cost", value: 500000, unit: "NGN/month" },
        { variable_name: "salary_cost", display_name: "Salary Cost", value: 250000, unit: "NGN/month" },
        { variable_name: "rent", display_name: "Rent", value: 100000, unit: "NGN/month" },
        { variable_name: "utilities", display_name: "Utilities", value: 50000, unit: "NGN/month" },
        { variable_name: "marketing", display_name: "Marketing", value: 100000, unit: "NGN/month" },
      ]
    };

    api.getModels()
      .then((data) => setModels(data.length > 0 ? data : [seedModel]))
      .catch(() => setModels([seedModel]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Models</h1>
          <p className="text-slate-400 text-sm">Manage baseline parameters and financial variables.</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/models/create-ai"
            className="py-2.5 px-4 rounded-lg bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-medium text-xs transition shadow-md flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Natural Language</span>
          </Link>
          <Link
            href="/dashboard/models/create"
            className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition border border-slate-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Entry</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-8 text-center text-slate-500 text-sm">Loading business models...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {models.map((model) => (
            <div key={model.id} className="glass-panel p-6 glow-hover space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">{model.business_type}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{model.name}</h3>
                  <p className="text-slate-400 text-xs mt-1">{model.description}</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500">{model.variables.length} Variables Configured</span>
                <Link
                  href={`/dashboard/models/${model.id}`}
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <span>Overview & Simulation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
