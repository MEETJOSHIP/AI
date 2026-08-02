import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="text-lg font-semibold text-slate-100">
            AEGIS<span className="text-indigo-400">AI</span>
          </div>
          <div className="text-xs uppercase tracking-widest text-slate-500 mt-1">
            Executive Command Center
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/60 border border-slate-800 rounded-lg p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            Sign in to continue
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="text-xs text-red-400">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded py-2.5 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-600 mt-4">
          Simulated dashboard data loads regardless of login — this only unlocks live backend data.
        </p>
      </div>
    </div>
  );
}