from fastapi import APIRouter

from app.schemas.triage import AiInsights, TriageRequest, TriageResponse
from app.services.gemini_service import generate_recommendation
from app.services.ml_service import predict_closure, predict_priority

router = APIRouter(tags=["AI Triage"])

# Reverse-maps from snake_case ML values back to display labels for Gemini prompt.
_CAUSE_DISPLAY: dict[str, str] = {
    "vehicle_breakdown": "Vehicle Breakdown",
    "accident": "Accident",
    "construction": "Construction",
    "water_logging": "Water Logging",
    "tree_fall": "Tree Fall",
    "signal_failure": "Signal Failure",
    "procession": "Protest / Procession",
    "vip_movement": "VIP Movement",
}

_VEH_DISPLAY: dict[str, str] = {
    "truck": "Truck",
    "private_car": "Car",
    "bmtc_bus": "Bus",
    "two_wheeler": "Two-Wheeler",
    "auto": "Auto",
    "others": "None",
}


def build_recommended_action(priority_label: str, closure_probability: float) -> str:
    """Deterministic fallback action from the original ML-only pipeline (unchanged)."""
    if priority_label == "HIGH" and closure_probability > 50:
        return (
            "Immediate traffic intervention recommended. "
            "Deploy field units and reroute vehicles."
        )
    if priority_label == "HIGH":
        return "Monitor closely and dispatch response team."
    return "Routine monitoring recommended."


@router.post(
    "/triage",
    response_model=TriageResponse,
    summary="Run AI triage for a traffic incident",
)
def triage_incident(payload: TriageRequest) -> TriageResponse:
    features = payload.model_dump()

    # ── Step 1: Existing ML pipeline (unchanged) ──────────────────────────────
    priority = predict_priority(features)
    closure = predict_closure(features)

    # ── Step 2: Gemini enhancement (non-blocking) ─────────────────────────────
    cause_display = _CAUSE_DISPLAY.get(payload.event_cause, payload.event_cause)
    veh_display = _VEH_DISPLAY.get(payload.veh_type, payload.veh_type)

    raw_insights = generate_recommendation(
        event_type=payload.event_type,
        cause=cause_display,
        zone=f"lat {payload.latitude:.4f}, lng {payload.longitude:.4f}",
        vehicle_type=veh_display,
        priority_label=priority["label"],
        confidence=priority["confidence"],
        closure_probability=closure["closure_probability"],
    )

    ai_insights = AiInsights(**raw_insights)

    # ── Step 3: Build response ────────────────────────────────────────────────
    return TriageResponse(
        priorityLabel=priority["label"],
        priorityConfidence=priority["confidence"],
        closureRequired=closure["closure_required"],
        closureProbability=closure["closure_probability"],
        recommendedAction=build_recommended_action(
            priority["label"],
            closure["closure_probability"],
        ),
        ai_insights=ai_insights,
    )
