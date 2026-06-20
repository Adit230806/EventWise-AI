# EventWise AI — Backend API

FastAPI backend serving the Astram anonymized traffic events dataset from CSV.

**Production:** https://eventwise-ai-1.onrender.com

## Setup

```bash
cd backend
pip install -r requirements.txt
```

Dataset path (auto-resolved): `../data/Astram event data_anonymized - Astram event data_anonymizedb40ac87.csv`

## Run locally

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Production endpoints

- **Swagger UI:** https://eventwise-ai-1.onrender.com/docs
- **ReDoc:** https://eventwise-ai-1.onrender.com/redoc
- **Health:** https://eventwise-ai-1.onrender.com/health

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stats` | Dashboard KPIs |
| GET | `/api/events` | All events (`priority`, `cause`, `q`, `feed`, `limit`) |
| GET | `/api/events/live-feed` | Active incidents |
| GET | `/api/map-events` | Active geolocated map markers |
| GET | `/api/hotspots` | Ranked hotspot zones |
| GET | `/api/analytics` | Charts data (default last 7 days) |
| POST | `/api/triage` | AI triage inference |

## Architecture

```
routes/   → HTTP layer
services/ → Business logic + pandas
schemas/  → Pydantic models (camelCase JSON matching frontend)
utils/    → CSV path config + value mappers
```

## Frontend integration

Production frontend: https://event-wise-ai-eight.vercel.app

Set in `frontend/.env` (and Vercel environment variables at build time):

```
VITE_API_URL=https://eventwise-ai-1.onrender.com
```

Do not include `/api` — the frontend adds route paths like `/api/stats`.

CORS allows only the production frontend origin (`https://event-wise-ai-eight.vercel.app`).
