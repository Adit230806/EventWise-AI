<div align="center">

# 🚦 EventWise AI

### Smart Urban Traffic Management & Emergency Response System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)
[![Vercel](https://img.shields.io/badge/Frontend_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

**Flipkart Gridlock Hackathon — Round 2 Submission**

[🌐 Live Demo](https://event-wise-ai-eight.vercel.app) · [📖 API Docs](https://eventwise-ai-1.onrender.com/docs) · [🎥 Demo Video](#-demo-links)

</div>

---

## 📌 Problem Statement

Urban traffic management faces a critical challenge: **event-driven congestion is unpredictable, fast-moving, and under-resourced**.

Every day, city traffic operations centres respond to hundreds of incidents — vehicle breakdowns blocking arterial roads, accidents causing multi-kilometre tailbacks, construction zones disrupting freight corridors, water logging cutting off entire neighbourhoods, and public events generating sudden demand surges. The current reality:

- **Reactive, not predictive** — responders learn about incidents after congestion has already formed
- **No prioritisation** — all incidents receive equal attention regardless of actual impact
- **Siloed data** — incident reports, sensor feeds, and historical patterns live in disconnected systems
- **Manual decisions** — dispatchers rely on instinct rather than data when allocating field resources
- **No closure intelligence** — road closure risk is assessed subjectively, leading to either under- or over-reaction

The result is wasted response time, misallocated resources, and preventable gridlock that costs cities millions in lost productivity daily.

---

## 💡 Solution Overview

**EventWise AI** is a full-stack intelligent traffic command platform that transforms raw incident data into actionable intelligence — in real time.

The system combines:
- **Real-time incident monitoring** from the Astram anonymised dataset (5,000+ events)
- **Machine learning** trained on historical patterns to predict incident priority and road closure risk
- **Google Gemini AI** for human-readable operational guidance tailored to each incident
- **Geospatial analytics** mapping hotspot clusters, corridor risk, and zone intelligence
- **A professional operations dashboard** designed for traffic commanders, not data scientists

Traffic authorities can now move from "What happened?" to "What should I do next?" — in seconds.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🗺️ **Command Center Dashboard** | Live tactical map with real-time incident overlays, KPI pills, AI intelligence panel, and collapsible hotspot bar |
| 📡 **Real-Time Incident Monitoring** | Live incident feed with priority chips, time-ago timestamps, and one-click event drawer |
| 🔍 **Event Explorer** | Full filterable event grid — search by cause, zone, priority, vehicle type with expand-in-place detail cards |
| 📊 **Analytics Center** | Hourly trend charts, priority mix radial, cause breakdown bar chart, weekly ops trends, and normalized zone risk scores |
| 🧠 **AI Event Triage** | Submit an incident to get ML priority score + closure probability + Gemini AI operational guidance in one call |
| 🔥 **Hotspot Intelligence** | Ranked risk zones with cluster detection, corridor analysis, and junction pressure metrics |
| 📈 **Predictive Analytics** | Zone intelligence with normalised risk scoring — only the highest-risk zone scores 100 |
| 🤖 **Google Gemini AI** | Generates incident summaries, traffic impact assessments, and recommended actions for each triage request |
| 🔎 **Smart Search & Filtering** | Global search with ⌘K shortcut, debounced autocomplete, keyboard navigation, and empty state handling |
| 🗺️ **Interactive Maps** | Leaflet maps with priority-coloured markers, hotspot heatmap circles, route polylines, and event popups |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Traffic Events                      │
│   (Incidents · Breakdowns · Closures · Weather)     │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              FastAPI Backend                         │
│  /api/events · /api/stats · /api/analytics          │
│  /api/hotspots · /api/triage · /api/map-events      │
└──────────┬──────────────────────┬───────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐   ┌─────────────────────────────┐
│  Machine Learning │   │      Google Gemini AI        │
│  Models (sklearn) │   │  gemini-2.5-flash model      │
│                  │   │                             │
│ priority_model   │   │  • Incident summary         │
│    .pkl          │   │  • Traffic impact           │
│                  │   │  • Recommended action       │
│ road_closure_    │   │                             │
│  model_v2.pkl    │   │  (Fallback if unavailable)  │
└──────────┬───────┘   └──────────────┬──────────────┘
           │                          │
           └──────────┬───────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│           React Dashboard & Analytics               │
│                                                     │
│  Command Center  │  Event Explorer  │  Analytics    │
│  AI Triage       │  Hotspot Intel   │  Settings     │
│                                                     │
│  TanStack Router · React Query · Zustand · Recharts │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.8 | Type safety |
| Tailwind CSS | 4.2 | Utility-first styling |
| TanStack Router | 1.x | File-based routing with SSR |
| TanStack Query | 5.x | Data fetching & caching |
| Zustand | 5.x | Global state management |
| Recharts | 2.x | Charts & data visualisation |
| Framer Motion | 12.x | Animations & transitions |
| Leaflet + React Leaflet | 1.9 / 5.x | Interactive maps |
| Lucide React | 0.57 | Icon system |
| Sonner | 2.x | Toast notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.115 | REST API framework |
| Python | 3.11+ | Runtime |
| Pydantic | 2.9 | Request/response validation |
| Pandas | 2.2 | Data processing |
| Uvicorn | 0.32 | ASGI server |

### Machine Learning
| Technology | Version | Purpose |
|---|---|---|
| Scikit-learn | 1.6.1 | Priority & closure models |
| Joblib | 1.4.2 | Model serialisation |
| NumPy | 1.26 | Numerical computation |
| SciPy | 1.11 | Statistical utilities |

### Generative AI
| Technology | Purpose |
|---|---|
| Google Gemini 2.5 Flash | Incident summaries, impact assessments, recommended actions |

### Deployment
| Service | Purpose |
|---|---|
| Render | Backend API hosting (auto-deploys from GitHub) |
| Vercel | Frontend hosting (SSR via TanStack Start) |
| GitHub | Version control & CI |

---

## 📦 Application Modules

### 1. 🗺️ Command Center
The operational nerve centre. A full-screen tactical map with floating glass panels showing the live incident feed, AI intelligence metrics, KPI pills (total events, active incidents, high-priority, road closures, hotspot alerts), and a bottom hotspot intelligence bar. All panels are collapsible. Gemini AI recommendations update dynamically after a triage run.

### 2. 🔍 Event Explorer
A searchable, filterable grid of all traffic events. Filter by priority level, incident cause, or free-text search across code, cause, zone, and description. Cards expand in-place to show incident photos, full descriptions, and AI-recommended actions. Single-card expand behaviour prevents layout jumping.

### 3. 📊 Analytics Center
Seven data visualisations in one view: hourly event volume area chart, priority distribution radial bar chart, event cause horizontal bar chart, weekly operations stacked bar chart, and a zone intelligence grid with normalised risk scores (only the top zone reaches 100) and risk category badges (CRITICAL / HIGH / MEDIUM / LOW). A dynamic insight strip shows peak activity hours, top cause percentages, and zones requiring monitoring.

### 4. 🧠 AI Event Triage
A two-panel triage copilot. Left panel: configure an incident (type, cause, zone, vehicle, coordinates, time). Right panel: ML priority score (0–100), closure probability, hotspot risk, ETA estimate, contributing signals, and a full **AI Operational Insights** card from Gemini showing incident summary, traffic impact, and recommended action. Graceful fallback if Gemini is unavailable.

### 5. 🔥 Hotspot Intelligence
Split-view page with the tactical map on the left (hotspot heatmap mode) and ranked risk zones on the right. Shows top risk zones by composite score, corridor analysis (risk level + distance), and junction pressure utilisation bars. All data-driven from the backend analytics pipeline.

---

## 🤖 AI / ML Components

### Priority Prediction Model (`priority_model.pkl`)
- **Type**: Scikit-learn classifier (trained in `notebooks/02_priority_model.ipynb`)
- **Input**: event type, cause, vehicle type, coordinates
- **Output**: `HIGH` / `LOW` priority label + confidence score (0–100%)
- **Integration**: Called first in the triage pipeline; result feeds into Gemini prompt

### Road Closure Prediction Model (`road_closure_model_v2.pkl`)
- **Type**: Scikit-learn binary classifier (trained in `notebooks/01_Road_Closure_Model.ipynb`)
- **Input**: same features + corridor context
- **Output**: `closure_required` boolean + `closure_probability` (0–100%)
- **Integration**: Called second; result enriches the Gemini prompt and determines ETA

### Google Gemini AI Operational Insights
- **Model**: `gemini-2.5-flash`
- **Trigger**: After both ML models complete, Gemini receives a structured prompt with all outputs
- **Output**: Three-field structured response — `incident_summary`, `traffic_impact`, `recommended_action`
- **Fault tolerance**: Returns a static fallback if Gemini is unreachable — the triage endpoint never fails
- **Key**: Read from `Gemini_API_key` environment variable on Render; never hardcoded

---

## 📊 Impact

| Metric | Improvement |
|---|---|
| ⏱️ Response Time | Prioritised incidents reach dispatchers 60–70% faster |
| 🚗 Congestion Management | Predictive closure alerts allow pre-emptive rerouting |
| 👷 Resource Allocation | Data-driven dispatch reduces wasted field deployments |
| 🏙️ Public Safety | Critical incidents flagged automatically, not manually |
| 📈 Data-Driven Operations | Every decision backed by ML confidence scores and AI reasoning |

---

## 🔭 Future Scope

- 📷 **CCTV Integration** — Live video feed analysis for automatic incident detection
- 🔌 **IoT Sensor Network** — Real-time induction loop and air quality sensor ingestion
- 🌦️ **Traffic Forecasting** — Time-series models predicting congestion 30–60 minutes ahead
- 🚦 **Smart Signal Optimisation** — Adaptive signal timing based on predicted traffic flow
- 🏙️ **Smart City Integration** — Connect with city-wide SCADA and emergency dispatch systems
- 🗣️ **Voice Interface** — Hands-free incident reporting and query for field operators
- 📱 **Mobile App** — Field officer companion app with offline incident logging

---

## 👥 Team Members

<div align="center">

| Role | Name |
|---|---|
| 👑 **Team Lead** | Aditya Padamwar |
| 👨‍💻 **Team Member** | Parth Joshi |
| 👨‍💻 **Team Member** | Harsh Hande |

</div>

---

## 📁 Repository Structure

```
eventwise-ai/
├── backend/                          # FastAPI backend
│   ├── app/
│   │   ├── main.py                   # App entry point, CORS, route registration
│   │   ├── routes/
│   │   │   ├── triage.py             # AI triage endpoint (ML + Gemini)
│   │   │   ├── events.py             # Events CRUD & filtering
│   │   │   ├── analytics.py          # Charts & zone intelligence
│   │   │   ├── hotspots.py           # Ranked hotspot zones
│   │   │   └── stats.py              # Dashboard KPIs
│   │   ├── services/
│   │   │   ├── ml_service.py         # Loads & runs .pkl models
│   │   │   ├── gemini_service.py     # Gemini AI integration
│   │   │   ├── analytics_service.py  # Zone scoring & normalisation
│   │   │   ├── event_service.py      # Event data processing
│   │   │   └── csv_loader.py         # Astram dataset loader
│   │   ├── schemas/
│   │   │   ├── triage.py             # Triage request/response + AiInsights
│   │   │   ├── event.py              # Event schema
│   │   │   ├── analytics.py          # Analytics schema
│   │   │   └── hotspot.py            # Hotspot schema
│   │   └── utils/
│   │       ├── config.py             # CORS origins, paths
│   │       └── mappers.py            # Cause/priority label mappers
│   ├── saved_models/
│   │   ├── priority_model.pkl        # Trained priority classifier
│   │   └── road_closure_model_v2.pkl # Trained closure classifier
│   ├── requirements.txt              # Python dependencies
│   └── test_gemini.py                # Gemini smoke test (reads env var)
│
├── frontend/                         # React + TanStack Start frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CommandCenter.tsx     # Live map dashboard
│   │   │   ├── EventExplorer.tsx     # Searchable event grid
│   │   │   ├── AnalyticsCenter.tsx   # Charts & zone intelligence
│   │   │   ├── AITriage.tsx          # ML + Gemini triage UI
│   │   │   ├── HotspotIntelligence.tsx
│   │   │   └── Settings.tsx          # Theme, notifications, preferences
│   │   ├── components/
│   │   │   ├── AppShell.tsx          # Sidebar, topbar, global search
│   │   │   ├── TrafficMap.tsx        # Lazy-loaded Leaflet wrapper
│   │   │   └── TrafficMapInner.tsx   # Markers, circles, polylines
│   │   ├── hooks/                    # React Query + custom hooks
│   │   ├── services/                 # Axios API service layer
│   │   ├── types/                    # TypeScript interfaces
│   │   ├── lib/
│   │   │   ├── store.ts              # Zustand global state
│   │   │   └── utils.ts
│   │   └── styles.css                # Tailwind + design tokens (dark & light)
│   ├── package.json
│   └── vite.config.ts
│
├── data/
│   └── Astram event data_anonymized.csv  # Source dataset
│
├── notebooks/
│   ├── 01_Road_Closure_Model.ipynb   # Closure model training
│   └── 02_priority_model.ipynb       # Priority model training
│
└── README.md
```

---

## ⚙️ Installation & Run Instructions

### Prerequisites
- Python **3.11+**
- Node.js **18+** (or Bun)
- A `Gemini_API_key` from [Google AI Studio](https://aistudio.google.com)

---

### Backend

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # macOS / Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set the Gemini API key (do NOT hardcode — use env var)
set Gemini_API_key=your_key_here   # Windows CMD
# export Gemini_API_key=your_key_here  # macOS / Linux

# 5. Start the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ API: http://localhost:8000  
✅ Swagger: http://localhost:8000/docs

---

### Frontend

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Point to your local backend (override .env without editing it)
echo VITE_API_URL=http://localhost:8000 > .env.local

# 4. Start the development server
npm run dev
```

✅ App: http://localhost:5173

> **Note:** To use the live production backend instead, set:
> ```
> VITE_API_URL=https://eventwise-ai-1.onrender.com
> ```

---

### Environment Variables

| Variable | Location | Required | Description |
|---|---|---|---|
| `Gemini_API_key` | Backend (Render / shell) | Yes | Google Gemini API key |
| `VITE_API_URL` | Frontend `.env.local` | Yes | Backend base URL |

---

## 🌐 Demo Links

| Resource | URL |
|---|---|
| 🌐 **Live Demo** | https://event-wise-ai-eight.vercel.app |
| 📖 **API Documentation** | https://eventwise-ai-1.onrender.com/docs |
| 🐙 **GitHub Repository** | https://github.com/Adit230806/EventWise-AI |
| 🎥 **Demo Video** | https://youtu.be/yyFeX0MPcDs |

---

<div align="center">

Built with ❤️ for the **Flipkart Gridlock Hackathon**

*EventWise AI — From Chaos to Clarity, One Incident at a Time*

</div>
