"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      // 1. Register user strictly in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      const userObj = data?.user;
      if (userObj) {
        // 2. Add row to database users table
        try {
          await supabase
            .from("users")
            .insert([{ id: userObj.id, email: userObj.email }]);
        } catch {
          // Ignore if trigger handles it
        }

        // 3. Log straight into dashboard
        const token = data?.session?.access_token || "auth-session-active";
        localStorage.setItem("scenariox_user_email", email);
        localStorage.setItem("scenariox_auth_token", token);
        
        router.push("/dashboard");
      } else {
        setErrorMsg("Unable to create user account. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 text-[#1C1917]">
      <div className="editorial-card max-w-md w-full p-8 shadow-sm border border-[#E7E0D3]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#C85A32] flex items-center justify-center font-serif text-white font-bold text-lg shadow-sm">
            SX
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#1C1917]">Create ScenarioX Account</h2>
            <p className="text-xs text-[#78716C]">Financial Modeling & Simulation</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 mb-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#C85A32]" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#44403C] mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E7E0D3] text-[#1C1917] text-sm focus:outline-none focus:border-[#C85A32]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#44403C] mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white border border-[#E7E0D3] text-[#1C1917] text-sm focus:outline-none focus:border-[#C85A32]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#C85A32] hover:bg-[#B24D28] text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
          >
            <span>{loading ? "Creating Account..." : "Create Account & Continue"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#E7E0D3] text-center text-xs text-[#78716C]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#C85A32] hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
