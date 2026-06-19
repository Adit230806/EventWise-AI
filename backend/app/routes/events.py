from fastapi import APIRouter, Query

from app.schemas.event import TrafficEvent
from app.services import event_service

router = APIRouter(tags=["Events"])


@router.get("/events", response_model=list[TrafficEvent], summary="List traffic events with optional filters")
def read_events(
    priority: str | None = Query(default=None, description="Filter by priority: critical|high|medium|low"),
    cause: str | None = Query(default=None, description="Filter by cause label"),
    q: str | None = Query(default=None, description="Search query across id, cause, zone, corridor"),
    feed: str | None = Query(default=None, description="Set to 'live' for active incidents only"),
    limit: int = Query(default=500, ge=1, le=2000),
) -> list[TrafficEvent]:
    return event_service.list_events(priority=priority, cause=cause, query=q, feed=feed, limit=limit)


@router.get("/events/live-feed", response_model=list[TrafficEvent], summary="Active incidents for live feed")
def read_live_feed(limit: int = Query(default=40, ge=1, le=200)) -> list[TrafficEvent]:
    return event_service.list_live_feed(limit=limit)


@router.get("/map-events", response_model=list[TrafficEvent], summary="Active geolocated events for map layers")
def read_map_events(limit: int = Query(default=250, ge=1, le=1000)) -> list[TrafficEvent]:
    return event_service.list_map_events(limit=limit)
