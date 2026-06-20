from __future__ import annotations

from datetime import timedelta

import pandas as pd

from app.schemas.analytics import (
    CauseBreakdownItem,
    EventAnalyticsData,
    HourlyTrendItem,
    PriorityBreakdownItem,
    WeeklyTrendItem,
    ZoneIntelligenceItem,
)
from app.services.csv_loader import load_events_dataframe
from app.utils.mappers import FRONTEND_CAUSES, FRONTEND_PRIORITIES, map_cause, map_priority


def _analytics_window(df: pd.DataFrame, days: int = 7) -> pd.DataFrame:
    if df.empty or df["event_ts"].isna().all():
        return df.iloc[0:0]
    max_ts = df["event_ts"].max()
    cutoff = max_ts - timedelta(days=days)
    return df[df["event_ts"] >= cutoff].copy()


def get_analytics(days: int = 7) -> EventAnalyticsData:
    df = load_events_dataframe()
    window = _analytics_window(df, days=days)

    # Cause distribution
    cause_counts = (
        window["event_cause"].map(map_cause).value_counts().to_dict()
        if not window.empty
        else {}
    )
    cause_breakdown = [
        CauseBreakdownItem(cause=cause, count=int(cause_counts.get(cause, 0)))  # type: ignore[arg-type]
        for cause in FRONTEND_CAUSES
        if cause_counts.get(cause, 0) > 0
    ]
    cause_breakdown.sort(key=lambda item: item.count, reverse=True)

    # Priority distribution (active events in window)
    if not window.empty:
        mapped = window.apply(
            lambda row: map_priority(
                row.get("priority"),
                requires_closure=bool(row.get("requires_road_closure", False)),
            ),
            axis=1,
        )
        priority_counts = mapped.value_counts().to_dict()
    else:
        priority_counts = {}

    priority_breakdown = [
        PriorityBreakdownItem(priority=priority, count=int(priority_counts.get(priority, 0)))  # type: ignore[arg-type]
        for priority in FRONTEND_PRIORITIES
        if priority_counts.get(priority, 0) > 0
    ]

    # Hourly trends
    hourly_items: list[HourlyTrendItem] = []
    if not window.empty:
        hours = window["event_ts"].dt.hour
        critical_mask = window.apply(
            lambda row: map_priority(
                row.get("priority"),
                requires_closure=bool(row.get("requires_road_closure", False)),
            )
            == "critical",
            axis=1,
        )
        for hour in range(24):
            hour_mask = hours == hour
            hourly_items.append(
                HourlyTrendItem(
                    hour=f"{hour:02d}:00",
                    events=int(hour_mask.sum()),
                    critical=int((hour_mask & critical_mask).sum()),
                )
            )

    # Weekly trends
    day_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_items: list[WeeklyTrendItem] = []
    if not window.empty:
        weekdays = window["event_ts"].dt.day_name().str[:3]
        statuses = window["status"].astype(str).str.lower()
        for day in day_order:
            day_mask = weekdays == day
            weekly_items.append(
                WeeklyTrendItem(
                    day=day,
                    resolved=int((day_mask & statuses.isin(["closed", "resolved"])).sum()),
                    active=int((day_mask & (statuses == "active")).sum()),
                )
            )

    # Zone intelligence
    zone_items: list[ZoneIntelligenceItem] = []
    if not window.empty:
        grouped = window.groupby("zone_label")
        zone_stats = []
        for zone, group in grouped:
            count = len(group)
            priority_labels = group.apply(
                lambda row: map_priority(
                    row.get("priority"),
                    requires_closure=bool(row.get("requires_road_closure", False)),
                ),
                axis=1,
            )
            high_ratio = float((priority_labels.isin(["critical", "high"])).mean())
            closure_ratio = float(group["requires_road_closure"].fillna(False).astype(bool).mean())
            # Raw composite score — will be normalised below so only the top zone reaches 100
            raw_score = count * 2.5 + high_ratio * 45 + closure_ratio * 25
            zone_stats.append((str(zone), count, raw_score))

        # Sort by raw score descending, take top 10
        zone_stats.sort(key=lambda item: item[2], reverse=True)
        zone_stats = zone_stats[:10]

        # Normalise: scale raw scores so the highest zone = 100, others proportionally lower.
        # Add a small stagger offset so tied raw scores still produce distinct rounded values.
        if zone_stats:
            max_raw = zone_stats[0][2]
            normalised = []
            for idx, (zone, count, raw) in enumerate(zone_stats):
                if max_raw > 0:
                    # Stagger: subtract a small per-rank offset to break ties at the top
                    stagger = idx * 1.5
                    norm = max(0.0, (raw / max_raw) * 100 - stagger)
                else:
                    norm = 0.0
                # Round to nearest integer, ensure top zone is exactly 100
                risk = 100 if idx == 0 else max(1, min(99, round(norm)))
                normalised.append((zone, count, risk))

            zone_items = [
                ZoneIntelligenceItem(zone=zone, events=count, risk=risk)
                for zone, count, risk in normalised
            ]

    return EventAnalyticsData(
        causeBreakdown=cause_breakdown,
        priorityBreakdown=priority_breakdown,
        hourlyTrend=hourly_items,
        weeklyTrend=weekly_items,
        zoneIntelligence=zone_items,
    )
