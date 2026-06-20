import os
from pathlib import Path

# backend/app/utils/config.py → project root is 3 levels up
PROJECT_ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = PROJECT_ROOT / "data"
OUTPUTS_DIR = PROJECT_ROOT / "outputs"

CSV_FILENAME = "Astram event data_anonymized - Astram event data_anonymizedb40ac87.csv"
CLUSTER_CENTERS_FILENAME = "cluster_centers.csv"

LOCAL_CORS_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


def get_cors_origins() -> list[str]:
    """Merge local dev origins with comma-separated CORS_ORIGINS env (production frontends)."""
    origins = list(LOCAL_CORS_ORIGINS)
    extra = os.getenv("CORS_ORIGINS", "")
    for origin in extra.split(","):
        cleaned = origin.strip().rstrip("/")
        if cleaned and cleaned not in origins:
            origins.append(cleaned)
    return origins


# Backwards-compatible alias used by main.py
DEFAULT_CORS_ORIGINS = get_cors_origins()


def csv_path() -> Path:
    return DATA_DIR / CSV_FILENAME


def cluster_centers_path() -> Path:
    return OUTPUTS_DIR / CLUSTER_CENTERS_FILENAME
