from fastapi import APIRouter, Query

from app.schemas.hotspot import HotspotData
from app.services.hotspot_service import get_hotspots

router = APIRouter(tags=["Hotspots"])


@router.get("/hotspots", response_model=list[HotspotData], summary="Ranked hotspot zones")
def read_hotspots(limit: int = Query(default=6, ge=1, le=20)) -> list[HotspotData]:
    return get_hotspots(limit=limit)
