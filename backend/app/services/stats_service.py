from __future__ import annotations

import pandas as pd

from app.schemas.dashboard import DashboardStats
from app.services.csv_loader import load_events_dataframe
from app.utils.mappers import map_priority


def get_dashboard_stats() -> DashboardStats:
    df = load_events_dataframe()

    total = len(df)
    active = int((df["status"].astype(str).str.lower() == "active").sum())
    road_closures = int(df["requires_road_closure"].fillna(False).astype(bool).sum())

    mapped_priority = df.apply(
        lambda row: map_priority(
            row.get("priority"),
            requires_closure=bool(row.get("requires_road_closure", False)),
        ),
        axis=1,
    )
    high_priority = int(mapped_priority.isin(["critical", "high"]).sum())

    # Hotspot alerts: active events in top risk zones
    zone_counts = (
        df[df["status"].astype(str).str.lower() == "active"]["zone_label"].value_counts()
    )
    hotspot_alerts = int(min(len(zone_counts.head(6)), zone_counts[zone_counts >= 3].count() if not zone_counts.empty else 0))
    if hotspot_alerts == 0 and not zone_counts.empty:
        hotspot_alerts = int(min(6, len(zone_counts)))

    return DashboardStats(
        totalEvents=total,
        activeEvents=active,
        highPriority=high_priority,
        roadClosures=road_closures,
        hotspotAlerts=hotspot_alerts,
    )
