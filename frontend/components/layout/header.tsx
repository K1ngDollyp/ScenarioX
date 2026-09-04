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
    <header className="h-16 bg-[#0a0e17]/90 backdrop-blur-md border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2.5 text-xs">
        <span className="text-stone-400 font-medium">ScenarioX</span>
        <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
        <span className="font-serif font-bold text-white tracking-wide text-sm">{title}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#81b29a]/15 border border-[#81b29a]/30 text-[#81b29a] text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Calculated via Verified Python Math</span>
        </div>

        <button className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-[#161f33] transition">
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="w-8 h-8 rounded-xl bg-[#c85a32] flex items-center justify-center text-white font-bold text-xs font-mono shadow-sm">
            {initials}
          </div>
          <div className="hidden md:block text-xs">
            <p className="font-semibold text-stone-200 leading-tight">Authenticated User</p>
            <p className="text-[11px] text-stone-400 font-mono">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-xl bg-[#161f33] hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 transition ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

