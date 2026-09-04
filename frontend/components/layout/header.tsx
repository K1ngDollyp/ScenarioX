"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, ShieldCheck, ChevronRight, LogOut } from "lucide-react";

export function Header({ title = "Dashboard" }: { title?: string }) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("ifedolaposojobi@gmail.com");

  useEffect(() => {
    const stored = localStorage.getItem("scenariox_user_email");
    if (stored) {
      setUserEmail(stored);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("scenariox_auth_token");
    localStorage.removeItem("scenariox_user_email");
    router.push("/login");
  };

  const initials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : "IF";

  return (
    <header className="h-16 bg-[#080d1a]/80 backdrop-blur-xl border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xl">
      <div className="flex items-center gap-2.5 text-xs">
        <span className="text-slate-400 font-medium">ScenarioX</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="font-bold text-white tracking-wide">{title}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secure Session Active</span>
        </div>

        <button className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition">
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-indigo-300 font-bold text-xs font-mono">
              {initials}
            </div>
          </div>
          <div className="hidden md:block text-xs">
            <p className="font-semibold text-slate-200 leading-tight">Authenticated User</p>
            <p className="text-[11px] text-slate-400 font-mono">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
