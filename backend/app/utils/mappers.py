"""Map raw CSV values to frontend-compatible enum strings."""

from __future__ import annotations

import math
import re
from typing import Any

# Frontend EventCause union
CAUSE_MAP: dict[str, str] = {
    "vehicle_breakdown": "Vehicle Breakdown",
    "accident": "Accident",
    "construction": "Construction",
    "water_logging": "Water Logging",
    "tree_fall": "Tree Fall",
    "signal_failure": "Signal Failure",
    "procession": "Protest",
    "public_event": "Protest",
    "vip_movement": "VIP Movement",
    "pot_holes": "Construction",
    "road_conditions": "Construction",
    "congestion": "Accident",
    "others": "Accident",
}

VEHICLE_MAP: dict[str, str] = {
    "truck": "Truck",
    "heavy_vehicle": "Truck",
    "lcv": "Truck",
    "private_car": "Car",
    "taxi": "Car",
    "bmtc_bus": "Bus",
    "private_bus": "Bus",
    "ksrtc_bus": "Bus",
    "auto": "Auto",
    "two_wheeler": "Two-Wheeler",
    "others": "None",
}

STATUS_MAP: dict[str, str] = {
    "active": "active",
    "closed": "resolved",
    "resolved": "resolved",
}

PRIORITY_MAP: dict[str, str] = {
    "high": "high",
    "low": "low",
}

FRONTEND_CAUSES = [
    "Vehicle Breakdown",
    "Accident",
    "Construction",
    "Water Logging",
    "Tree Fall",
    "Signal Failure",
    "Protest",
    "VIP Movement",
]

FRONTEND_PRIORITIES = ["critical", "high", "medium", "low"]


def _safe_str(value: Any, default: str = "") -> str:
    if value is None:
        return default
    if isinstance(value, float) and math.isnan(value):
        return default
    text = str(value).strip()
    return text if text and text.lower() != "nan" else default


def map_cause(raw: Any) -> str:
    key = _safe_str(raw, "others").lower().replace(" ", "_")
    return CAUSE_MAP.get(key, "Accident")


def map_vehicle(raw: Any) -> str:
    key = _safe_str(raw, "others").lower().replace(" ", "_")
    return VEHICLE_MAP.get(key, "None")


def map_status(raw: Any) -> str:
    key = _safe_str(raw, "active").lower()
    return STATUS_MAP.get(key, "monitoring")


def map_priority(raw: Any, *, requires_closure: bool = False) -> str:
    key = _safe_str(raw, "low").lower()
    if key == "high" and requires_closure:
        return "critical"
    if key == "high":
        return "high"
    return "low"


def zone_label(raw: Any, corridor: Any = None, address: Any = None) -> str:
    zone = _safe_str(raw)
    if zone:
        return zone
    corridor_str = _safe_str(corridor)
    if corridor_str:
        return corridor_str
    address_str = _safe_str(address)
    if address_str:
        parts = [p.strip() for p in address_str.split(",")]
        for part in parts:
            if "Bengaluru" in part or "Bangalore" in part:
                continue
            if len(part) > 3 and not part.startswith("Pin"):
                return part[:48]
    return "Unknown Zone"


def human_eta(minutes: float) -> str:
    mins = max(1, int(minutes))
    if mins < 60:
        return f"{mins} min"
    hours = mins // 60
    rem = mins % 60
    return f"{hours}h {rem}m" if rem else f"{hours}h"


def closure_risk(requires_closure: bool, priority: str) -> float:
    base = 0.72 if requires_closure else 0.18
    if priority == "critical":
        return min(0.98, base + 0.22)
    if priority == "high":
        return min(0.92, base + 0.12)
    if priority == "medium":
        return min(0.65, base + 0.05)
    return base


def hotspot_risk(priority: str, zone_event_density: float = 0.5) -> float:
    weights = {"critical": 0.88, "high": 0.72, "medium": 0.48, "low": 0.25}
    return min(0.99, weights.get(priority, 0.3) * 0.7 + zone_event_density * 0.3)


def recommended_action(cause: str, zone: str, priority: str) -> str:
    actions = {
        "Vehicle Breakdown": f"Dispatch recovery unit to {zone}; stage traffic diversion on adjacent corridor.",
        "Accident": f"Alert EMS and activate incident corridor management near {zone}.",
        "Construction": f"Coordinate lane closure signage and update ETA boards for {zone}.",
        "Water Logging": f"Deploy pump crew and restrict heavy vehicles through {zone}.",
        "Tree Fall": f"Send clearance crew; verify overhead line safety in {zone}.",
        "Signal Failure": f"Manual signal override requested for junction near {zone}.",
        "Protest": f"Activate crowd monitoring and pre-stage alternate routes around {zone}.",
        "VIP Movement": f"Implement rolling cordon and priority green-wave along {zone}.",
    }
    prefix = "Immediate: " if priority in ("critical", "high") else "Monitor: "
    return prefix + actions.get(cause, f"Standard response protocol for {zone}.")


def parse_cause_filter(cause: str | None) -> str | None:
    if not cause:
        return None
    normalized = cause.strip()
    for frontend_cause in FRONTEND_CAUSES:
        if frontend_cause.lower() == normalized.lower():
            return frontend_cause
    return normalized


def parse_priority_filter(priority: str | None) -> str | None:
    if not priority:
        return None
    p = priority.strip().lower()
    if p in FRONTEND_PRIORITIES:
        return p
    return None


def matches_search(row: dict[str, Any], query: str) -> bool:
    q = query.strip().lower()
    if not q:
        return True
    haystack = " ".join(
        _safe_str(row.get(field))
        for field in (
            "id",
            "event_cause",
            "zone",
            "corridor",
            "description",
            "address",
            "police_station",
        )
    ).lower()
    return q in haystack or q in _safe_str(row.get("id")).lower()
