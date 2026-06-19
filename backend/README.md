# EventWise AI — Backend API

FastAPI backend serving the Astram anonymized traffic events dataset from CSV.

## Setup

```bash
cd backend
pip install -r requirements.txt
```

Dataset path (auto-resolved): `../data/Astram event data_anonymized - Astram event data_anonymizedb40ac87.csv`

## Run

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health:** http://localhost:8000/health

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stats` | Dashboard KPIs |
| GET | `/api/events` | All events (`priority`, `cause`, `q`, `feed`, `limit`) |
| GET | `/api/events/live-feed` | Active incidents |
| GET | `/api/map-events` | Active geolocated map markers |
| GET | `/api/hotspots` | Ranked hotspot zones |
| GET | `/api/analytics` | Charts data (default last 7 days) |

## Architecture

```
routes/   → HTTP layer
services/ → Business logic + pandas
schemas/  → Pydantic models (camelCase JSON matching frontend)
utils/    → CSV path config + value mappers
```

## Frontend integration

Set in `frontend/.env`:

```
VITE_API_URL=http://localhost:8000
```
