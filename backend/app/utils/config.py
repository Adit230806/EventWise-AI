from pathlib import Path

# backend/app/utils/config.py → project root is 3 levels up
PROJECT_ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = PROJECT_ROOT / "data"
OUTPUTS_DIR = PROJECT_ROOT / "outputs"

CSV_FILENAME = "Astram event data_anonymized - Astram event data_anonymizedb40ac87.csv"
CLUSTER_CENTERS_FILENAME = "cluster_centers.csv"

PRODUCTION_FRONTEND_ORIGIN = "https://event-wise-ai-eight.vercel.app"


def get_cors_origins() -> list[str]:
    return [PRODUCTION_FRONTEND_ORIGIN]


# Backwards-compatible alias used by main.py
DEFAULT_CORS_ORIGINS = get_cors_origins()


def csv_path() -> Path:
    return DATA_DIR / CSV_FILENAME


def cluster_centers_path() -> Path:
    return OUTPUTS_DIR / CLUSTER_CENTERS_FILENAME
