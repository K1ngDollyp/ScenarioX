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
    <header className="h-16 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e4dcd0] px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2.5 text-xs">
        <span className="text-[#78716c] font-medium">ScenarioX</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#a8a29e]" />
        <span className="font-serif font-bold text-[#1c1917] tracking-wide text-sm">{title}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full tag-sage text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Calculated via Verified Python Math</span>
        </div>

        <button className="p-2 text-[#78716c] hover:text-[#1c1917] rounded-xl hover:bg-[#eae3d5] transition">
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-[#e4dcd0]">
          <div className="w-8 h-8 rounded-xl bg-[#c85a32] flex items-center justify-center text-white font-bold text-xs font-mono shadow-sm">
            {initials}
          </div>
          <div className="hidden md:block text-xs">
            <p className="font-semibold text-[#1c1917] leading-tight">Authenticated User</p>
            <p className="text-[11px] text-[#78716c] font-mono">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-xl bg-[#eae3d5] hover:bg-rose-100 text-[#57534e] hover:text-rose-600 transition ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}


