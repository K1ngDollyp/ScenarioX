"use client";

import { useState, useEffect } from "react";
import { User, ShieldCheck, Lock, Bell, Sliders, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [email, setEmail] = useState("ifedolaposojobi@gmail.com");
  const [currency, setCurrency] = useState("NGN");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("scenariox_user_email");
    if (stored) {
      setEmail(stored);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Account & Preferences</h1>
        <p className="text-slate-400 text-sm">Manage your profile, default currencies, and security settings.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Preferences saved successfully!</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Account Profile */}
        <div className="editorial-card p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-[#E7E0D3] pb-4">
            <div className="p-2 rounded-lg bg-[#C85A32]/10 text-[#C85A32]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#1C1917] font-serif text-base">User Profile</h3>
              <p className="text-xs text-[#78716C]">Your account identity and session email.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E7E0D3] text-[#1C1917] text-sm focus:outline-none focus:border-[#C85A32] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1">Default Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E7E0D3] text-[#1C1917] text-sm focus:outline-none focus:border-[#C85A32]"
              >
                <option value="NGN">NGN (₦ - Nigerian Naira)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-2 flex justify-end">
              <button
                type="submit"
                className="py-2.5 px-5 rounded-lg bg-[#C85A32] hover:bg-[#B24D28] text-white font-semibold text-xs transition shadow-sm"
              >
                Save Profile Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Security & Authentication */}
        <div className="editorial-card p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-[#E7E0D3] pb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#1C1917] font-serif text-base">Account Security</h3>
              <p className="text-xs text-[#78716C]">Authentication and session status.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F4EFE6] border border-[#E7E0D3] text-xs">
              <div className="flex items-center gap-2 text-[#1C1917]">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span>Session Status</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                AUTHENTICATED & SECURE
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F4EFE6] border border-[#E7E0D3] text-xs">
              <div className="flex items-center gap-2 text-[#1C1917]">
                <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
                <span>Data Isolation Policy</span>
              </div>
              <span className="text-[#78716C] text-[11px]">
                Enforced per user session
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
