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
  Sparkles,
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
    <aside className="w-64 bg-[#050914] border-r border-white/5 flex flex-col justify-between hidden md:flex min-h-screen sticky top-0 h-screen z-40">
      <div className="p-5">
        {/* Brand Header */}
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-brand-500 to-purple-600 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            SX
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              ScenarioX
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Financial Intelligence</p>
          </div>
        </Link>

        {/* Quick AI Action */}
        <Link
          href="/dashboard/models/create-ai"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 mb-6 rounded-xl bg-gradient-to-r from-indigo-600 via-brand-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Model Assistant</span>
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-5 border-t border-white/5 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs font-semibold transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-500 text-center font-mono">
          <span>Engine v1.0 • Verified</span>
        </div>
      </div>
    </aside>
  );
}
