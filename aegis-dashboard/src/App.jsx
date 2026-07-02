import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Shield, Search, Bell, Settings, TrendingUp, TrendingDown,
  Radio, AlertTriangle, ShieldAlert, Cloud, Network, Cpu,
  ChevronRight, Circle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ---------- Mock data ----------

const KPIS = [
  { label: "Security Score", value: 83, suffix: "/100", trend: 6, color: "text-indigo-400", bar: "bg-indigo-500" },
  { label: "Infrastructure Health", value: 92, suffix: "%", trend: 6, color: "text-emerald-400", bar: "bg-emerald-500" },
  { label: "Network Health", value: 95, suffix: "%", trend: 7, color: "text-emerald-400", bar: "bg-emerald-500" },
  { label: "Cloud Health", value: 82, suffix: "%", trend: 4, color: "text-cyan-400", bar: "bg-cyan-500" },
];

const INCIDENTS = [
  { label: "Critical", count: 12, color: "bg-red-500", text: "text-red-400" },
  { label: "High", count: 23, color: "bg-amber-500", text: "text-amber-400" },
  { label: "Medium", count: 38, color: "bg-cyan-500", text: "text-cyan-400" },
  { label: "Low", count: 14, color: "bg-slate-500", text: "text-slate-400" },
];

const RECOMMENDATIONS = [
  "Isolate infected host 192.168.1.45",
  "Block IOC 198.51.100.15",
  "Patch CVE-2024-3094",
  "Review AWS S3 bucket policy",
  "Enable MFA for privileged accounts",
];

const ALERT_POOL = [
  { text: "Malware detected on WS-114", sev: "critical" },
  { text: "Brute force attempt \u2014 VPN gateway", sev: "critical" },
  { text: "Unusual outbound network traffic", sev: "high" },
  { text: "Privileged login from new device", sev: "high" },
  { text: "Cloud storage misconfiguration found", sev: "medium" },
  { text: "New IOC ingested: 198.51.100.x/24", sev: "medium" },
  { text: "TLS certificate nearing expiry", sev: "low" },
  { text: "Anomalous DNS query volume", sev: "high" },
  { text: "Failed MFA challenge \u2014 admin acct", sev: "critical" },
  { text: "Suspicious lateral movement flagged", sev: "critical" },
];

const SEV_STYLE = {
  critical: { dot: "bg-red-500", text: "text-red-400" },
  high: { dot: "bg-amber-500", text: "text-amber-400" },
  medium: { dot: "bg-cyan-500", text: "text-cyan-400" },
  low: { dot: "bg-slate-500", text: "text-slate-400" },
};

function timeAgo(ts, now) {
  const s = Math.max(1, Math.round((now - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return `${h}h ago`;
}

function makeTraffic() {
  const out = [];
  for (let i = 0; i < 24; i++) {
    out.push({ t: `${String(i).padStart(2, "0")}:00`, v: 40 + Math.random() * 45 });
  }
  return out;
}

// ---------- Threat globe (canvas) ----------

function ThreatGlobe() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const angleRef = useRef(0);
  const arcsRef = useRef([]);
  const rafRef = useRef(null);
  const lastSpawnRef = useRef(0);

  const points = useMemo(() => {
    const N = 460;
    const pts = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      pts.push({ x, y, z, threat: Math.random() < 0.035 });
    }
    return pts;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function frame(ts) {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.36;

      ctx.clearRect(0, 0, w, h);

      angleRef.current += 0.0016;
      const cosA = Math.cos(angleRef.current);
      const sinA = Math.sin(angleRef.current);

      // subtle grid rings
      ctx.strokeStyle = "rgba(99,102,241,0.10)";
      ctx.lineWidth = 1;
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (R * r) / 3 + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      const projected = points.map((p) => {
        const rx = p.x * cosA - p.z * sinA;
        const rz = p.x * sinA + p.z * cosA;
        return {
          sx: cx + rx * R,
          sy: cy + p.y * R,
          depth: rz,
          threat: p.threat,
        };
      });

      projected.sort((a, b) => a.depth - b.depth);

      const threatScreenPts = [];

      projected.forEach((p) => {
        const front = (p.depth + 1) / 2; // 0..1
        const alpha = 0.15 + front * 0.55;
        const size = p.threat ? 2.4 : 1.15 + front * 0.9;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2);
        if (p.threat && front > 0.3) {
          ctx.fillStyle = `rgba(248,113,113,${alpha})`;
          threatScreenPts.push(p);
        } else {
          ctx.fillStyle = `rgba(129,140,248,${alpha})`;
        }
        ctx.fill();
      });

      // spawn new attack arcs occasionally
      if (ts - lastSpawnRef.current > 1400 && threatScreenPts.length > 1) {
        lastSpawnRef.current = ts;
        const a = threatScreenPts[Math.floor(Math.random() * threatScreenPts.length)];
        const b = threatScreenPts[Math.floor(Math.random() * threatScreenPts.length)];
        if (a !== b) {
          arcsRef.current.push({ from: a, to: b, start: ts, dur: 1100 });
        }
      }
      arcsRef.current = arcsRef.current.filter((arc) => ts - arc.start < arc.dur);

      arcsRef.current.forEach((arc) => {
        const p = Math.min(1, (ts - arc.start) / arc.dur);
        const midx = (arc.from.sx + arc.to.sx) / 2;
        const midy = (arc.from.sy + arc.to.sy) / 2 - 26;

        // faint full path
        ctx.beginPath();
        ctx.moveTo(arc.from.sx, arc.from.sy);
        ctx.quadraticCurveTo(midx, midy, arc.to.sx, arc.to.sy);
        ctx.strokeStyle = "rgba(248,113,113,0.18)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // traveling pulse
        const t = p;
        const qx = (1 - t) * (1 - t) * arc.from.sx + 2 * (1 - t) * t * midx + t * t * arc.to.sx;
        const qy = (1 - t) * (1 - t) * arc.from.sy + 2 * (1 - t) * t * midy + t * t * arc.to.sy;
        ctx.beginPath();
        ctx.arc(qx, qy, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(248,113,113,0.9)";
        ctx.shadowColor = "rgba(248,113,113,0.8)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [points]);

  return (
    <div ref={wrapRef} className="relative w-full h-full">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}

// ---------- Main dashboard ----------

export default function ExecutiveCommandCenter() {
  const [now, setNow] = useState(Date.now());
  const [alerts, setAlerts] = useState(() =>
    Array.from({ length: 5 }).map((_, i) => {
      const a = ALERT_POOL[i % ALERT_POOL.length];
      return { id: `${Date.now()}-${i}`, ...a, ts: Date.now() - i * 90000 };
    })
  );
  const [traffic, setTraffic] = useState(makeTraffic);
  const [liveCount, setLiveCount] = useState(87);

  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      const pick = ALERT_POOL[Math.floor(Math.random() * ALERT_POOL.length)];
      setAlerts((prev) => [
        { id: `${Date.now()}-${Math.random()}`, ...pick, ts: Date.now() },
        ...prev.slice(0, 5),
      ]);
      setLiveCount((c) => c + (Math.random() < 0.6 ? 1 : 0));
    }, 4200);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setTraffic((prev) => {
        const next = prev.slice(1);
        const hour = (parseInt(next[next.length - 1].t) + 1) % 24;
        next.push({ t: `${String(hour).padStart(2, "0")}:00`, v: 40 + Math.random() * 45 });
        return next;
      });
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      {/* Header */}
      <header className="relative border-b border-slate-800/80 bg-slate-950/90 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center">
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-slate-100">AEGIS<span className="text-indigo-400">AI</span></div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Executive Command Center</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 w-72">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">Search anything...</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
            <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" />
            {new Date(now).toLocaleTimeString()}
          </div>
          <Bell className="w-4 h-4 text-slate-500" />
          <Settings className="w-4 h-4 text-slate-500" />
        </div>
      </header>

      <main className="relative p-5 space-y-5 max-w-[1400px] mx-auto">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIS.map((k) => (
            <div key={k.label} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">{k.label}</div>
              <div className="flex items-end justify-between">
                <div className={`text-3xl font-mono font-semibold ${k.color}`}>
                  {k.value}<span className="text-base text-slate-500">{k.suffix}</span>
                </div>
                <div className="flex items-center gap-0.5 text-emerald-400 text-xs font-mono">
                  <TrendingUp className="w-3.5 h-3.5" />{k.trend}%
                </div>
              </div>
              <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${k.bar}`} style={{ width: `${k.value}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Map + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-slate-200">Live Global Threat Map</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-400 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live
              </div>
            </div>
            <div className="h-72 relative">
              <ThreatGlobe />
              <div className="absolute top-2 right-2 text-right space-y-1 text-[11px] font-mono">
                <div className="text-slate-500">Attack Sources <span className="text-slate-200">67</span></div>
                <div className="text-slate-500">Targeted Regions <span className="text-slate-200">13</span></div>
                <div className="text-slate-500">Live Incidents <span className="text-indigo-400">{liveCount}</span></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-slate-200">Live Alerts</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
            <div className="space-y-2.5 overflow-hidden">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-start gap-2 pb-2.5 border-b border-slate-800/70 last:border-0">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${SEV_STYLE[a.sev].dot}`} />
                  <div className="min-w-0">
                    <div className="text-xs text-slate-300 truncate">{a.text}</div>
                    <div className="text-[10px] font-mono text-slate-600">{timeAgo(a.ts, now)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incidents / Recommendations / Traffic */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-slate-200">Active Incidents</span>
            </div>
            <div className="space-y-2.5">
              {INCIDENTS.map((i) => (
                <div key={i.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className={`w-1.5 h-1.5 rounded-full ${i.color}`} />
                    {i.label}
                  </div>
                  <span className={`font-mono ${i.text}`}>{i.count}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-500">Total</span>
                <span className="font-mono text-slate-200">
                  {INCIDENTS.reduce((s, i) => s + i.count, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-slate-200">AI Recommendations</span>
            </div>
            <div className="space-y-2.5">
              {RECOMMENDATIONS.map((r) => (
                <div key={r} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="mt-1 w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0" />
                  {r}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-slate-200">Traffic Overview</span>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={traffic} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#64748b" }} interval={5} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, fontSize: 11 }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Area type="monotone" dataKey="v" stroke="#818cf8" strokeWidth={1.5} fill="url(#trafficFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}