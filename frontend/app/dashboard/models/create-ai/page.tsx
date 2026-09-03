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
        variables: parsedResult.extracted_variables.map((v: any) => ({
          variable_name: v.variable_name,
          display_name: v.display_name,
          category: v.category || "revenue",
          value: parseFloat(v.value),
          unit: v.unit || "unit",
          period: v.period || "month",
          currency: v.currency || "NGN",
          source: "ai_extracted",
        })),
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
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">AI Natural Language Assistant</span>
        <h1 className="text-2xl font-bold text-white mt-1">Describe Your Business Model</h1>
        <p className="text-slate-400 text-sm">
          Enter a plain-language description. The AI extracts parameters into explicit variables with units for user review before confirmation.
        </p>
      </div>

      {/* Prompt Area */}
      <div className="glass-panel p-6 space-y-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500"
          placeholder="Describe customer counts, order prices, food inventory costs, salaries, rent, utilities..."
        />

        <button
          onClick={handleParse}
          disabled={parsing || !description.trim()}
          className="py-3 px-6 rounded-lg bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {parsing ? (
            <span>Extracting Parameters...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Extract Business Variables</span>
            </>
          )}
        </button>
      </div>

      {/* Extracted Review & Confirmation Modal / Section */}
      {parsedResult && (
        <div className="glass-panel p-6 space-y-6 border-brand-500/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Extracted Business Variables</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review and edit every value before creating your business model.
              </p>
            </div>

            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-semibold"
            />
          </div>

          {/* Missing Fields Warning */}
          {parsedResult.missing_variables && parsedResult.missing_variables.length > 0 && (
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Missing Recommended Fields: </span>
                <span>{parsedResult.missing_variables.join(", ")}</span>
              </div>
            </div>
          )}

          {/* Variables Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 font-semibold">Variable</th>
                  <th className="pb-2 font-semibold">Category</th>
                  <th className="pb-2 font-semibold">Value</th>
                  <th className="pb-2 font-semibold">Unit</th>
                  <th className="pb-2 font-semibold">Currency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {parsedResult.extracted_variables.map((v: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-2.5 font-medium text-slate-200">{v.display_name || v.variable_name}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">{v.category}</span>
                    </td>
                    <td className="py-2.5">
                      <input
                        type="number"
                        value={v.value}
                        onChange={(e) => handleVariableChange(idx, "value", e.target.value)}
                        className="w-28 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-brand-500"
                      />
                    </td>
                    <td className="py-2.5 text-slate-400 font-mono">{v.unit}</td>
                    <td className="py-2.5 text-slate-400 font-mono">{v.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleConfirmAndSave}
              disabled={saving}
              className="py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Confirm & Save Model</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
