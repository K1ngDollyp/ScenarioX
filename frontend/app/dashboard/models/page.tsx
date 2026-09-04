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
          <h1 className="text-2xl font-serif font-bold text-[#1c1917]">Business Models</h1>
          <p className="text-[#57534e] text-sm">Manage baseline parameters and financial variables.</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/models/create-ai"
            className="py-2.5 px-4 rounded-xl bg-[#c85a32] hover:bg-[#b04a25] text-white font-semibold text-xs transition shadow-sm flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Natural Language</span>
          </Link>
          <Link
            href="/dashboard/models/create"
            className="py-2.5 px-4 rounded-xl bg-[#f4efe6] hover:bg-[#eae3d5] text-[#1c1917] font-semibold text-xs transition border border-[#e4dcd0] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Entry</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="editorial-card p-8 text-center text-[#78716c] text-sm">Loading business models...</div>
      ) : models.length === 0 ? (
        <div className="editorial-card p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl tag-terracotta flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-[#1c1917]">No Business Models Created Yet</h3>
            <p className="text-[#57534e] text-xs mt-1 max-w-md mx-auto">
              You haven't created any business models. Describe your business in plain English using the AI Assistant or build one manually.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/dashboard/models/create-ai"
              className="py-2.5 px-5 rounded-xl bg-[#c85a32] hover:bg-[#b04a25] text-white font-semibold text-xs transition shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Model via AI</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {models.map((model) => (
            <div key={model.id} className="editorial-card p-6 space-y-4 relative">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#c85a32] uppercase tracking-wider">{model.business_type}</span>
                  <h3 className="text-lg font-serif font-bold text-[#1c1917] mt-0.5">{model.name}</h3>
                  <p className="text-[#57534e] text-xs mt-1 line-clamp-2">{model.description}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingModel({ ...model })}
                    className="p-1.5 rounded-lg text-[#78716c] hover:text-[#1c1917] hover:bg-[#f4efe6] transition"
                    title="Edit Model"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(model.id, model.name)}
                    className="p-1.5 rounded-lg text-[#78716c] hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Model"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-[#e7e0d3] pt-4 flex items-center justify-between text-xs">
                <span className="text-[#78716c] font-medium">{model.variables?.length || 0} Variables Configured</span>
                <Link
                  href={`/dashboard/models/${model.id}`}
                  className="font-semibold text-[#2d6a4f] hover:underline flex items-center gap-1"
                >
                  <span>Overview & Simulation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Model Modal */}
      {editingModel && (
        <div className="fixed inset-0 z-50 bg-[#1c1917]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="editorial-card max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-[#1c1917]">Edit Business Model</h3>
              <button onClick={() => setEditingModel(null)} className="text-[#78716c] hover:text-[#1c1917]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#57534e] font-medium mb-1">Model Name</label>
                <input
                  type="text"
                  value={editingModel.name}
                  onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#ffffff] border border-[#e7e0d3] text-[#1c1917] focus:outline-none focus:border-[#c85a32]"
                />
              </div>

              <div>
                <label className="block text-[#57534e] font-medium mb-1">Description</label>
                <textarea
                  value={editingModel.description}
                  onChange={(e) => setEditingModel({ ...editingModel, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#ffffff] border border-[#e7e0d3] text-[#1c1917] focus:outline-none focus:border-[#c85a32] h-20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingModel(null)}
                className="py-2 px-4 rounded-xl bg-[#f4efe6] text-[#1c1917] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="py-2 px-4 rounded-xl bg-[#c85a32] hover:bg-[#b04a25] text-white text-xs font-semibold flex items-center gap-1.5"
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
