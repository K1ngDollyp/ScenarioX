import Link from "next/link";
import { ShieldCheck, ArrowRight, Compass, Scale, BarChart2, Layers } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917] flex flex-col justify-between selection:bg-[#c85a32]/20 selection:text-[#1c1917]">
      {/* Editorial Top Navigation */}
      <nav className="max-w-7xl mx-auto w-full px-8 py-6 flex items-center justify-between border-b border-[#e4dcd0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#c85a32] flex items-center justify-center font-serif font-bold text-white text-lg shadow-sm">
            SX
          </div>
          <div>
            <span className="font-serif text-xl font-bold text-[#1c1917] tracking-tight">ScenarioX</span>
            <span className="text-[10px] text-[#78716c] block tracking-widest uppercase font-mono">Financial Studio</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <Link href="/login" className="text-[#57534e] hover:text-[#1c1917] font-medium transition">
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="py-2.5 px-5 rounded-xl bg-[#c85a32] hover:bg-[#b04a25] text-white font-semibold transition shadow-sm"
          >
            Open Studio
          </Link>
        </div>
      </nav>

      {/* Main Editorial Body */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24 flex-1 space-y-20">
        {/* Asymmetrical Hero Section */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Narrative - 7 Columns */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full tag-terracotta text-xs font-medium">
              <Compass className="w-4 h-4 text-[#c85a32]" />
              <span>Real Business Math • Zero Hallucinated Formulas</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-serif font-bold text-[#1c1917] leading-[1.1] tracking-tight">
              Test business decisions <br />
              <span className="italic font-normal text-[#c85a32]">before you spend real money.</span>
            </h1>

            <p className="text-[#57534e] text-base sm:text-lg leading-relaxed max-w-xl">
              What happens if you raise menu prices by 15% or double your rent? ScenarioX models price elasticity, overhead increases, and Monte Carlo risk with verified Python math—so you never make a financial move in the dark.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/dashboard/models/create-ai"
                className="py-3.5 px-7 rounded-xl bg-[#c85a32] hover:bg-[#b04a25] text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                <span>Describe Your Business</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="py-3.5 px-7 rounded-xl bg-[#f4efe6] hover:bg-[#eae3d5] text-[#1c1917] border border-[#e4dcd0] font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <span>Explore Live Studio</span>
              </Link>
            </div>
          </div>

          {/* Right Overlapping Showcase Card - 5 Columns */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -top-4 -left-4 w-full h-full rounded-2xl bg-[#c85a32]/10 border border-[#c85a32]/20 transform -rotate-1 pointer-events-none" />
            
            <div className="editorial-card p-7 space-y-5 relative z-10">
              <div className="flex items-center justify-between border-b border-[#e7e0d3] pb-4">
                <span className="text-[11px] font-mono font-bold text-[#2d6a4f] uppercase tracking-wider">Restaurant Model Baseline</span>
                <span className="px-2.5 py-0.5 rounded-full tag-sage text-[10px] font-mono font-bold">LIVE</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#78716c]">Monthly Revenue (2,000 orders)</span>
                  <span className="font-mono font-bold text-[#1c1917]">₦20,000,000</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#78716c]">Food, Rent & Operating Expenses</span>
                  <span className="font-mono text-[#57534e]">₦9,250,000</span>
                </div>
                <div className="p-3 rounded-xl bg-[#faf8f5] border border-[#e7e0d3] flex justify-between items-center">
                  <span className="text-xs font-semibold text-[#1c1917]">Baseline Monthly Profit</span>
                  <span className="font-mono text-lg font-bold text-[#2d6a4f]">₦10,750,000</span>
                </div>
              </div>

              <div className="p-3 rounded-xl tag-terracotta text-[11px] italic">
                "What if rent jumps by 50% next quarter? ScenarioX tests demand shift & exact net profit drop."
              </div>
            </div>
          </div>
        </div>

        {/* Asymmetrical 2-Column Feature & Assurance Breakdown */}
        <div className="grid md:grid-cols-2 gap-8 pt-8">
          <div className="editorial-card p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl tag-terracotta flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1c1917]">Price Elasticity & Custom Scenarios</h3>
            <p className="text-[#57534e] text-sm leading-relaxed">
              When prices go up, demand drops. Generic spreadsheets ignore this elasticity. ScenarioX factors in customer retention curves so your price changes accurately reflect real consumer behavior.
            </p>
          </div>

          <div className="editorial-card p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl tag-sage flex items-center justify-center">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1c1917]">1,000-Month Monte Carlo Simulations</h3>
            <p className="text-[#57534e] text-sm leading-relaxed">
              Never gamble on single-line best-case estimates. Run thousands of statistical iterations across sales variations and cost surges to calculate exact probability of profitability.
            </p>
          </div>
        </div>

        {/* Human Guarantee Banner */}
        <div className="editorial-card p-8 border-l-4 border-l-[#c85a32] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-[#2d6a4f] text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Strict Mathematical Integrity</span>
            </div>
            <h4 className="text-lg font-serif font-bold text-[#1c1917]">How we ensure 100% accuracy</h4>
            <p className="text-[#57534e] text-xs leading-relaxed">
              Large language models are fantastic for writing and understanding text, but notoriously bad at math. That's why ScenarioX uses AI strictly to organize your input—while 100% of your financial calculations are computed by deterministic Python code.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="py-3 px-6 rounded-xl bg-[#f4efe6] hover:bg-[#eae3d5] border border-[#e4dcd0] text-[#1c1917] font-semibold text-xs whitespace-nowrap transition"
          >
            Launch Baseline Studio
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e4dcd0] py-8 text-center text-xs text-[#78716c] font-mono">
        © 2026 ScenarioX • Bespoke Financial Simulation Studio • Verified Python Mathematics
      </footer>
    </div>
  );
}


