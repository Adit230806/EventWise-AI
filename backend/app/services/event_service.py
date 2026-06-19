from __future__ import annotations

import math
from typing import Any

import pandas as pd

from app.schemas.event import TrafficEvent
from app.services.csv_loader import load_events_dataframe
from app.utils.mappers import (
    closure_risk,
    hotspot_risk,
    human_eta,
    map_cause,
    map_priority,
    map_status,
    map_vehicle,
    matches_search,
    parse_cause_filter,
    parse_priority_filter,
    recommended_action,
    zone_label,
)


def _row_to_event(row: pd.Series, *, zone_density: float = 0.5) -> TrafficEvent:
    requires_closure = bool(row.get("requires_road_closure", False))
    priority = map_priority(row.get("priority"), requires_closure=requires_closure)
    cause = map_cause(row.get("event_cause"))
    zone = zone_label(row.get("zone"), row.get("corridor"), row.get("address"))
    status = map_status(row.get("status"))

    created_ts = row.get("event_ts")
    created_at = created_ts.isoformat().replace("+00:00", "Z") if pd.notna(created_ts) else ""

    # Estimate ETA from priority / closure requirement
    eta_minutes = {"critical": 18, "high": 32, "medium": 55, "low": 80}.get(priority, 45)
    if requires_closure:
        eta_minutes += 15

    lat = float(row["latitude"]) if pd.notna(row.get("latitude")) else 12.9716
    lng = float(row["longitude"]) if pd.notna(row.get("longitude")) else 77.5946

    reported_by = str(row.get("police_station") or row.get("created_by_id") or "Field Ops")

    return TrafficEvent(
        id=str(row["id"]),
        code=str(row["id"]),
        cause=cause,  # type: ignore[arg-type]
        status=status,  # type: ignore[arg-type]
        priority=priority,  # type: ignore[arg-type]
        zone=zone,
        lat=lat,
        lng=lng,
        description=str(row.get("description") or f"{cause} reported in {zone}"),
        vehicleType=map_vehicle(row.get("veh_type")),  # type: ignore[arg-type]
        createdAt=created_at,
        eta=human_eta(eta_minutes),
        closureRisk=round(closure_risk(requires_closure, priority), 2),
        hotspotRisk=round(hotspot_risk(priority, zone_density), 2),
        affectedRadius=350 if requires_closure else (220 if priority in ("critical", "high") else 120),
        reportedBy=reported_by,
        recommendedAction=recommended_action(cause, zone, priority),
    )


def _zone_density_map(df: pd.DataFrame) -> dict[str, float]:
    if df.empty:
        return {}
    counts = df["zone_label"].value_counts()
    max_count = max(int(counts.max()), 1)
    return {zone: float(count / max_count) for zone, count in counts.items()}


def _apply_filters(
    df: pd.DataFrame,
    *,
    priority: str | None = None,
    cause: str | None = None,
    query: str | None = None,
    status: str | None = None,
    feed: str | None = None,
) -> pd.DataFrame:
    filtered = df.copy()

    if feed == "live":
        filtered = filtered[filtered["status"].astype(str).str.lower() == "active"]

    if status:
        filtered = filtered[filtered["status"].astype(str).str.lower() == status.lower()]

    if query:
        mask = filtered.apply(lambda row: matches_search(row.to_dict(), query), axis=1)
        filtered = filtered[mask]

    if cause:
        cause_filter = parse_cause_filter(cause)
        if cause_filter:
            mapped = filtered["event_cause"].map(map_cause)
            filtered = filtered[mapped.str.lower() == cause_filter.lower()]

    if priority:
        priority_filter = parse_priority_filter(priority)
        if priority_filter:
            mapped_priorities = filtered.apply(
                lambda row: map_priority(
                    row.get("priority"),
                    requires_closure=bool(row.get("requires_road_closure", False)),
                ),
                axis=1,
            )
            filtered = filtered[mapped_priorities == priority_filter]

    return filtered


def list_events(
    *,
    priority: str | None = None,
    cause: str | None = None,
    query: str | None = None,
    feed: str | None = None,
    limit: int = 500,
) -> list[TrafficEvent]:
    df = load_events_dataframe()
    densities = _zone_density_map(df)
    filtered = _apply_filters(df, priority=priority, cause=cause, query=query, feed=feed)
    filtered = filtered.sort_values("event_ts", ascending=False).head(limit)
    return [
        _row_to_event(row, zone_density=densities.get(str(row["zone_label"]), 0.4))
        for _, row in filtered.iterrows()
    ]


def list_live_feed(limit: int = 40) -> list[TrafficEvent]:
    return list_events(feed="live", limit=limit)


def list_map_events(limit: int = 250) -> list[TrafficEvent]:
    df = load_events_dataframe()
    densities = _zone_density_map(df)
    active = df[df["status"].astype(str).str.lower() == "active"].copy()
    active = active[active["latitude"].notna() & active["longitude"].notna()]
    active = active.sort_values("event_ts", ascending=False).head(limit)
    return [
        _row_to_event(row, zone_density=densities.get(str(row["zone_label"]), 0.4))
        for _, row in active.iterrows()
    ]
