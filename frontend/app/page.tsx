import Link from "next/link";
import { Sparkles, ShieldCheck, TrendingUp, ArrowRight, PlaySquare, BarChart3, Sliders } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Nav */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/20">
            SX
          </div>
          <span className="font-bold text-xl text-white tracking-tight">ScenarioX</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium transition">
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="py-2.5 px-5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition shadow-lg shadow-brand-600/30"
          >
            Launch Platform
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-brand-400 text-xs font-medium mb-8">
          <ShieldCheck className="w-4 h-4 text-brand-500" />
          <span>The AI interprets. The mathematics calculates.</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Simulate Decisions. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-blue-400 to-indigo-400">
            Understand Outcomes.
          </span>
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Test financial decisions numerically before acting. Run deterministic elasticity models, Monte Carlo risk simulations, sensitivity rankings, and SciPy optimization—guaranteed by an un-hallucinated mathematical engine.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href="/dashboard/models/create-ai"
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-semibold text-base transition shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>AI Natural Language Builder</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-base transition flex items-center justify-center gap-2"
          >
            <span>Explore Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 w-full text-left">
          <div className="glass-panel p-6 glow-hover">
            <PlaySquare className="w-8 h-8 text-brand-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Deterministic Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Model price elasticity (-0.4 for restaurants), food costs, rent, salaries, and marketing with exact formula math.
            </p>
          </div>

          <div className="glass-panel p-6 glow-hover">
            <TrendingUp className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Monte Carlo Risk</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Run 1,000 to 10,000 statistical iterations across triangular, normal, and uniform distributions with reproducible seeds.
            </p>
          </div>

          <div className="glass-panel p-6 glow-hover">
            <Sliders className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">SciPy Optimization</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Maximize profit or minimize operating expenses subject to user bounds and strict mathematical constraints.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        © 2026 ScenarioX: An AI-Powered Scenario Simulation and Decision Support Platform.
      </footer>
    </div>
  );
}
