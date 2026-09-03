"use client";

import { Settings, ShieldCheck, Key, Database, Server } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Settings & Connections</h1>
        <p className="text-slate-400 text-sm">Manage database configuration, Supabase authentication keys, and AI provider integration.</p>
      </div>

      <div className="space-y-4">
        {/* Security & RLS Status */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Supabase Auth & RLS Status</h3>
              <p className="text-xs text-slate-400">Row Level Security (RLS) policies enabled across 10 core tables.</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-mono">
            STATUS: ACTIVE (JWT Bearer Token verification required on backend dependencies)
          </div>
        </div>

        {/* Database Connection */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">PostgreSQL Connection</h3>
              <p className="text-xs text-slate-400">SQLAlchemy 2.x Async Engine + asyncpg driver</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
            postgresql+asyncpg://postgres:*****@localhost:5432/scenariox
          </div>
        </div>

        {/* AI Provider Config */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">AI Reasoning Layer</h3>
              <p className="text-xs text-slate-400">Provider Abstraction (Gemini / OpenAI / Fallback Heuristic)</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
            AI_PROVIDER=gemini | AI_MODEL=gemini-1.5-pro | AI_ISOLATION_FALLBACK=ENABLED
          </div>
        </div>
      </div>
    </div>
  );
}
