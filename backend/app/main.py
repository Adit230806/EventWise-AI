from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import analytics, events, hotspots, stats, triage
from app.services.csv_loader import dataset_path, load_events_dataframe
from app.utils.config import DEFAULT_CORS_ORIGINS


@asynccontextmanager
async def lifespan(_: FastAPI):
    load_events_dataframe()
    yield


app = FastAPI(
    title="EventWise AI API",
    description="Traffic operations backend powered by the Astram anonymized events dataset.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=DEFAULT_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stats.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(hotspots.router, prefix="/api")
app.include_router(triage.router, prefix="/api")


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str | int]:
    df = load_events_dataframe()
    return {
        "status": "ok",
        "dataset": str(dataset_path()),
        "events_loaded": len(df),
    }
