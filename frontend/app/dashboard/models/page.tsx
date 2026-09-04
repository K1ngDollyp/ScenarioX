"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Building2, Plus, Sparkles, ArrowRight, Edit3, Trash2, Check, X } from "lucide-react";

export default function BusinessModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModel, setEditingModel] = useState<any | null>(null);

  const loadModels = () => {
    setLoading(true);
    api.getModels()
      .then((data) => setModels(data))
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await api.deleteModel(id);
      loadModels();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingModel) return;
    await api.updateModel(editingModel.id, editingModel);
    setEditingModel(null);
    loadModels();
  };

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
      ) : models.length === 0 ? (
        <div className="glass-panel p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Business Models Created Yet</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
              You haven't created any business models. Describe your business in plain English using the AI Assistant or build one manually.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/dashboard/models/create-ai"
              className="py-2.5 px-5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-lg shadow-brand-600/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Model via AI</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {models.map((model) => (
            <div key={model.id} className="glass-panel p-6 glow-hover space-y-4 relative">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">{model.business_type}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{model.name}</h3>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">{model.description}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingModel({ ...model })}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Edit Business Model"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(model.id, model.name)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 transition"
                    title="Delete Business Model"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500">{model.variables?.length || 0} Variables Configured</span>
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

      {/* Edit Model Dialog */}
      {editingModel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 space-y-4 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Edit Business Model</h3>
              <button onClick={() => setEditingModel(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Model Name</label>
                <input
                  type="text"
                  value={editingModel.name}
                  onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Business Category / Type</label>
                <input
                  type="text"
                  value={editingModel.business_type}
                  onChange={(e) => setEditingModel({ ...editingModel, business_type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingModel.description}
                  onChange={(e) => setEditingModel({ ...editingModel, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingModel(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

