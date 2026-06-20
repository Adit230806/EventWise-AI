from fastapi import APIRouter

from app.schemas.triage import TriageRequest, TriageResponse
from app.services.ml_service import predict_closure, predict_priority

router = APIRouter(tags=["AI Triage"])


def build_recommended_action(priority_label: str, closure_probability: float) -> str:
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

    priority = predict_priority(features)
    closure = predict_closure(features)

    return TriageResponse(
        priorityLabel=priority["label"],
        priorityConfidence=priority["confidence"],
        closureRequired=closure["closure_required"],
        closureProbability=closure["closure_probability"],
        recommendedAction=build_recommended_action(
            priority["label"],
            closure["closure_probability"],
        ),
    )
