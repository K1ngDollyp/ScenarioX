"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  GitFork,
  PlaySquare,
  TrendingUp,
  BarChart3,
  Sliders,
  History,
  Settings,
  PlusCircle,
  Zap,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("scenariox_auth_token");
    localStorage.removeItem("scenariox_user_email");
    router.push("/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Business Models", href: "/dashboard/models", icon: Building2 },
    { name: "Scenarios", href: "/dashboard/scenarios", icon: GitFork },
    { name: "Simulations", href: "/dashboard/simulations", icon: PlaySquare },
    { name: "Monte Carlo Risk", href: "/dashboard/simulations/monte-carlo", icon: TrendingUp },
    { name: "Sensitivity Analysis", href: "/dashboard/analytics/sensitivity", icon: BarChart3 },
    { name: "Forecasting", href: "/dashboard/analytics/forecasting", icon: Zap },
    { name: "Optimization", href: "/dashboard/optimization", icon: Sliders },
    { name: "History", href: "/dashboard/history", icon: History },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0a0e17] border-r border-white/10 flex flex-col justify-between hidden md:flex min-h-screen sticky top-0 h-screen z-40">
      <div className="p-5">
        {/* Brand Header */}
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-[#c85a32] flex items-center justify-center font-extrabold text-white text-base shadow-md group-hover:bg-[#e07a5f] transition-colors">
            SX
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-white group-hover:text-[#e07a5f] transition-colors">
              ScenarioX
            </h1>
            <p className="text-[11px] text-stone-400 font-medium tracking-wide">Financial Studio</p>
          </div>
        </Link>

        {/* Quick New Model Action */}
        <Link
          href="/dashboard/models/create-ai"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 mb-6 rounded-xl bg-[#c85a32] hover:bg-[#b04b27] text-white font-semibold text-xs transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Business Model</span>
        </Link>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#161f33] text-white border-l-2 border-[#c85a32] font-semibold"
                    : "text-stone-400 hover:text-stone-100 hover:bg-[#121929]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#e07a5f]" : "text-stone-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-5 border-t border-white/10 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#121929] hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 text-stone-400 hover:text-rose-400 text-xs font-medium transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

        <div className="p-3 rounded-xl bg-[#070a12] border border-white/5 text-[11px] text-stone-500 text-center font-mono">
          <span>Python Math Engine • Verified</span>
        </div>
      </div>
    </aside>
  );
}

