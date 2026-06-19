from fastapi import APIRouter, Query

from app.schemas.analytics import EventAnalyticsData
from app.services.analytics_service import get_analytics

router = APIRouter(tags=["Analytics"])


@router.get("/analytics", response_model=EventAnalyticsData, summary="Analytics aggregates (last 7 days)")
def read_analytics(days: int = Query(default=7, ge=1, le=90, description="Rolling window in days")) -> EventAnalyticsData:
    return get_analytics(days=days)
