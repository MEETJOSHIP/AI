# AegisAI — Enterprise Operations Copilot

> AI-powered, unified security & infrastructure command center — Executive Dashboard prototype.

Built for **Odoo x KSV Hackathon 2026**.

---

## 🖥️ Overview

AegisAI is a concept for a unified enterprise operations platform — bringing SOC, NOC, CloudOps, DevSecOps, and AI-driven insights into a single command center, inspired by tools like Microsoft Defender, Splunk, CrowdStrike, and Datadog.

This repository contains the **Executive Command Center** module: a fully functional, animated dashboard UI demonstrating the core visual and interaction design for the platform.

## ⚠️ Project Status

This is a **hackathon prototype**, not a production system.

| Layer | Status |
|---|---|
| Frontend UI (this repo) | ✅ Fully functional |
| Data shown on screen | 🎭 Simulated (mock data, randomized in-browser) |
| Backend / Database | 🚧 Not yet built — see [Roadmap](#-roadmap) |
| Cloud / security integrations | 🚧 Not yet built |

All metrics, alerts, and incidents are generated client-side for demo purposes and reset on page refresh. No real infrastructure, cloud account, or security tooling is connected.

## ✨ Features (this module)

- **Live KPI cards** — Security Score, Infrastructure/Network/Cloud Health with animated trend indicators
- **Animated 3D threat globe** — rotating point-sphere rendered on `<canvas>`, with pulsing attack arcs between simulated threat nodes
- **Live Alerts feed** — auto-updating alert stream with real relative timestamps
- **Active Incidents breakdown** — severity-classified incident counts
- **AI Recommendations panel**
- **Traffic Overview chart** — live-scrolling area chart (Recharts)
- **Core Modules Overview** — preview grid of the planned platform (SOC, NOC, CloudOps, DevSecOps, AI Copilot, Digital Twin, Incidents, Analytics, Reports, Attack Simulator)
- Dark, cyberpunk-inspired UI with an indigo/cyan accent system

## 🛠️ Tech Stack

**Frontend**
- React 18
- Vite
- Tailwind CSS v4
- Recharts
- Lucide React (icons)

**Planned backend** *(not yet implemented — see Roadmap)*
- FastAPI
- SQLAlchemy + PostgreSQL
- JWT Authentication / RBAC

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/<your-username>/aegis-dashboard.git
cd aegis-dashboard
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
aegis-dashboard/
├── src/
│   ├── App.jsx        # Main dashboard (Executive Command Center)
│   ├── index.css       # Tailwind entry point
│   └── main.jsx        # React entry point
├── vite.config.js      # Vite + Tailwind plugin config
└── package.json
```

## 🗺️ Roadmap

This dashboard is Phase 1 of a larger planned platform:

- [x] **Phase 1** — Executive Dashboard UI (this repo)
- [ ] **Phase 2** — Real authentication (JWT/RBAC) + PostgreSQL-backed data models
- [ ] **Phase 3** — SOC module: threat detection, MITRE ATT&CK mapping, case management
- [ ] **Phase 4** — NOC module: device/network monitoring, topology map
- [ ] **Phase 5** — CloudOps + DevSecOps: cloud resource monitoring, vulnerability & secrets scanning
- [ ] **Phase 6** — AI Copilot: conversational assistant for ops/security queries
- [ ] **Phase 7** — Analytics, Reports, and interactive Digital Twin (React Flow)

## 📸 Screenshots

_Add screenshots or a short demo GIF of the dashboard here._

## 👤 Author

**Meet Joshi**
B.E. Information Technology, Kadi Sarva Vishwavidyalaya

## 📄 License

This project is provided for educational and hackathon demonstration purposes.
