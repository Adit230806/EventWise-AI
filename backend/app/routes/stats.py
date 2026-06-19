from fastapi import APIRouter, Query

from app.schemas.dashboard import DashboardStats
from app.services.stats_service import get_dashboard_stats

router = APIRouter(tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats, summary="Dashboard KPI statistics")
def read_stats() -> DashboardStats:
    return get_dashboard_stats()
