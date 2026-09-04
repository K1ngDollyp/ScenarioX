"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Save, Edit3 } from "lucide-react";

export default function AIModelCreationPage() {
  const router = useRouter();
  const [description, setDescription] = useState(
    "I run a restaurant with about 600 customers per month. My average order is ₦2,500. Food costs me around ₦500,000 monthly, salaries are ₦250,000, rent is ₦100,000, utilities are ₦50,000 and I spend ₦100,000 on marketing."
  );
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [modelName, setModelName] = useState("My Restaurant Business Model");
  const [saving, setSaving] = useState(false);

  const handleParse = async () => {
    setParsing(true);
    try {
      const res = await api.parseModel(description);
      setParsedResult(res);
    } catch (err: any) {
      alert(err.message || "Failed to parse model description");
    } finally {
      setParsing(false);
    }
  };

  const handleVariableChange = (idx: number, field: string, val: any) => {
    if (!parsedResult) return;
    const updatedVars = [...parsedResult.extracted_variables];
    updatedVars[idx] = { ...updatedVars[idx], [field]: val };
    setParsedResult({ ...parsedResult, extracted_variables: updatedVars });
  };

  const handleConfirmAndSave = async () => {
    if (!parsedResult) return;
    setSaving(true);
    try {
      const payload = {
        name: modelName,
        business_type: parsedResult.business_type || "restaurant",
        currency: "NGN",
        description: description,
        variables: parsedResult.extracted_variables.map((v: any) => {
          const isQuantity = v.variable_name.includes('customer') || (v.unit && v.unit.includes('customer')) || v.unit.includes('unit');
          return {
            variable_name: v.variable_name,
            display_name: v.display_name,
            category: v.category || "revenue",
            value: parseFloat(v.value),
            unit: v.unit || "unit",
            period: v.period || "month",
            currency: isQuantity ? "N/A" : (v.currency || "NGN"),
            source: "ai_extracted",
          };
        }),
      };
      await api.createModel(payload);
      router.push("/dashboard/models");
    } catch (err: any) {
      alert(err.message || "Failed to save business model");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Natural Language Assistant</h1>
        <p className="text-slate-400 text-sm">
          Describe your business in plain text. ScenarioX will extract your financial parameters into structured math variables.
        </p>
      </div>

      {/* Input Box */}
      <div className="glass-panel p-6 space-y-4">
        <label className="block text-xs font-semibold text-slate-300">Describe Your Business Model</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
          placeholder="e.g. I run a SaaS app with 200 subscribers paying $50/mo. Hosting costs $500, marketing $1000..."
        />

        <div className="flex justify-end">
          <button
            onClick={handleParse}
            disabled={parsing}
            className="py-2.5 px-6 rounded-lg bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-medium text-sm transition shadow-lg shadow-brand-600/20 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{parsing ? "Extracting Parameters..." : "Extract Business Variables"}</span>
          </button>
        </div>
      </div>

      {/* Extracted Variables Preview */}
      {parsedResult && (
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Model Title</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold text-base focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Business Category:</span>
                <span className="font-semibold text-brand-400 uppercase">{parsedResult.business_type}</span>
              </div>
            </div>

            {/* Missing Parameters Warning */}
            {parsedResult.missing_variables && parsedResult.missing_variables.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-semibold">Suggested Optional Parameter Detected:</p>
                  <p className="text-amber-300/80">
                    Missing optional parameters: {parsedResult.missing_variables.join(", ")}. You can add or edit variables below.
                  </p>
                </div>
              </div>
            )}

            {/* Variables Editable Table */}
            <div className="space-y-3">
              <h3 className="font-bold text-white text-sm">Extracted Business Variables</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Variable</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Value</th>
                      <th className="p-3">Unit</th>
                      <th className="p-3">Currency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {parsedResult.extracted_variables.map((v: any, idx: number) => {
                      const isQuantity = v.variable_name.includes('customer') || (v.unit && v.unit.includes('customer'));
                      return (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="p-3 font-semibold text-white">{v.display_name}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                v.category === "revenue"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-rose-500/10 text-rose-400"
                              }`}
                            >
                              {v.category}
                            </span>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={v.value}
                              onChange={(e) => handleVariableChange(idx, "value", parseFloat(e.target.value) || 0)}
                              className="w-28 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white font-mono"
                            />
                          </td>
                          <td className="p-3 text-slate-400 font-mono">{v.unit}</td>
                          <td className="p-3 text-slate-400 font-mono">{isQuantity ? 'N/A' : (v.currency || 'NGN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={handleConfirmAndSave}
                disabled={saving}
                className="py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving ? "Saving Model..." : "Confirm & Save Model"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
