from pydantic import BaseModel, Field


class TriageRequest(BaseModel):
    event_type: str = Field(
        ...,
        examples=["unplanned"],
        description="Event classification, e.g. unplanned or planned.",
    )
    event_cause: str = Field(
        ...,
        examples=["vehicle_breakdown"],
        description="Primary cause of the traffic event.",
    )
    veh_type: str = Field(
        ...,
        examples=["truck"],
        description="Vehicle type involved in the incident.",
    )
    latitude: float = Field(..., ge=-90, le=90, examples=[12.97])
    longitude: float = Field(..., ge=-180, le=180, examples=[77.59])


class TriageResponse(BaseModel):
    priorityLabel: str = Field(..., examples=["HIGH"])
    priorityConfidence: float = Field(..., ge=0, le=100, examples=[69.19])
    closureRequired: bool = Field(..., examples=[False])
    closureProbability: float = Field(..., ge=0, le=100, examples=[10.67])
    recommendedAction: str = Field(
        ...,
        examples=["Monitor closely and dispatch response team."],
    )
