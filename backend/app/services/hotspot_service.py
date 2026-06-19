from __future__ import annotations

import math
from datetime import timedelta

import pandas as pd

from app.schemas.hotspot import HotspotData
from app.services.csv_loader import load_cluster_centers, load_events_dataframe
from app.utils.mappers import map_priority


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _nearest_cluster(lat: float, lng: float, centers: pd.DataFrame) -> int:
    if centers.empty or math.isnan(lat) or math.isnan(lng):
        return 0
    best_id = 0
    best_dist = float("inf")
    for _, center in centers.iterrows():
        dist = _haversine_km(lat, lng, float(center["latitude"]), float(center["longitude"]))
        if dist < best_dist:
            best_dist = dist
            best_id = int(center["cluster_id"])
    return best_id


def _zone_risk_score(group: pd.DataFrame) -> int:
    count = len(group)
    active = int((group["status"].astype(str).str.lower() == "active").sum())
    high = int(
        group.apply(
            lambda row: map_priority(
                row.get("priority"),
                requires_closure=bool(row.get("requires_road_closure", False)),
            )
            in ("critical", "high"),
            axis=1,
        ).sum()
    )
    closure = int(group["requires_road_closure"].fillna(False).astype(bool).sum())
    score = active * 4 + high * 2 + closure * 3 + count * 0.15
    return int(min(100, max(10, round(score))))


def get_hotspots(limit: int = 6) -> list[HotspotData]:
    df = load_events_dataframe()
    centers = load_cluster_centers()

    if df.empty:
        return []

    max_ts = df["event_ts"].max()
    recent_cutoff = max_ts - timedelta(days=7)
    prior_cutoff = max_ts - timedelta(days=14)

    active_df = df[df["status"].astype(str).str.lower() == "active"]
    zone_groups = active_df.groupby("zone_label")

    candidates: list[dict] = []
    for zone, group in zone_groups:
        if str(zone) == "nan" or not str(zone).strip():
            continue
        lat = group["latitude"].dropna()
        lng = group["longitude"].dropna()
        centroid_lat = float(lat.mean()) if not lat.empty else 12.97
        centroid_lng = float(lng.mean()) if not lng.empty else 77.59

        recent = group[group["event_ts"] >= recent_cutoff]
        prior = group[(group["event_ts"] >= prior_cutoff) & (group["event_ts"] < recent_cutoff)]
        recent_count = len(recent)
        prior_count = max(len(prior), 1)
        change_pct = round(((recent_count - prior_count) / prior_count) * 100, 1)

        candidates.append(
            {
                "zone": str(zone),
                "risk": _zone_risk_score(group),
                "cluster": len(group),
                "trend": "up" if change_pct >= 0 else "down",
                "change": abs(change_pct),
                "cluster_id": _nearest_cluster(centroid_lat, centroid_lng, centers),
            }
        )

    candidates.sort(key=lambda item: item["risk"], reverse=True)

    hotspots: list[HotspotData] = []
    for rank, item in enumerate(candidates[:limit], start=1):
        hotspots.append(
            HotspotData(
                id=f"hs-{rank:02d}",
                zone=item["zone"],
                rank=rank,
                risk=item["risk"],
                cluster=item["cluster"],
                trend=item["trend"],  # type: ignore[arg-type]
                change=float(item["change"]),
            )
        )

    return hotspots
