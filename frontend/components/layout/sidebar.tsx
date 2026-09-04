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
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex min-h-screen">
      <div className="p-4">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/20">
            SX
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white">ScenarioX</h1>
            <p className="text-xs text-slate-400">Simulate. Understand.</p>
          </div>
        </Link>

        {/* Quick AI Action */}
        <Link
          href="/dashboard/models/create-ai"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 mb-6 rounded-lg bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-medium text-sm transition shadow-md shadow-brand-600/20"
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-500/10 text-brand-500 border-l-2 border-brand-500 pl-2.5"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-500" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-950 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs font-semibold transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
          <p className="text-slate-300 font-semibold mb-1">Financial Intelligence</p>
          <p className="text-slate-500 leading-relaxed">Simulate revenue, expenses, and risk with confidence.</p>
        </div>
      </div>
    </aside>
  );
}
