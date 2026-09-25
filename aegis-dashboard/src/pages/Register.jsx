import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, UserPlus } from "lucide-react";
import { registerUser } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "soc_analyst", label: "SOC Analyst" },
  { value: "noc_engineer", label: "NOC Engineer" },
  { value: "cloud_engineer", label: "Cloud Engineer" },
  { value: "manager", label: "Manager" },
];

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("soc_analyst");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser({
        email,
        password,
        full_name: fullName,
        role,
      });
      setSuccess(true);

      const loggedIn = await login(email, password);
      if (loggedIn) {
        navigate("/", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
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
            Create Account
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/60 border border-slate-800 rounded-lg p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
            Register a new user
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 block">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500"
              placeholder="Jane Doe"
            />
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
              minLength={6}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 block">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="text-xs text-red-400">{error}</div>}
          {success && !error && (
            <div className="text-xs text-emerald-400">Account created — signing you in...</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded py-2.5 transition-colors"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}