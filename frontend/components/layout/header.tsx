"use client";

import Link from "next/link";
import { User, Bell, ShieldCheck, ChevronRight } from "lucide-react";

export function Header({ title = "Dashboard" }: { title?: string }) {
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400">ScenarioX</span>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <span className="font-semibold text-slate-100">{title}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Supabase Auth & RLS Active</span>
        </div>

        <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-400 font-bold text-xs">
            SX
          </div>
          <div className="hidden md:block text-xs">
            <p className="font-medium text-slate-200">Owner User</p>
            <p className="text-slate-500">demo@scenariox.ai</p>
          </div>
        </div>
      </div>
    </header>
  );
}
