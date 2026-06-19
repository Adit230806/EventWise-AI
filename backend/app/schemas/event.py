from typing import Literal

from pydantic import BaseModel, Field


EventStatus = Literal["active", "monitoring", "resolved"]
EventPriority = Literal["critical", "high", "medium", "low"]
EventCause = Literal[
    "Vehicle Breakdown",
    "Accident",
    "Construction",
    "Water Logging",
    "Tree Fall",
    "Signal Failure",
    "Protest",
    "VIP Movement",
]
VehicleType = Literal["Truck", "Car", "Bus", "Two-Wheeler", "Auto", "None"]


class TrafficEvent(BaseModel):
    id: str
    code: str
    cause: EventCause
    status: EventStatus
    priority: EventPriority
    zone: str
    lat: float
    lng: float
    description: str
    vehicleType: VehicleType
    createdAt: str
    eta: str
    closureRisk: float = Field(ge=0, le=1)
    hotspotRisk: float = Field(ge=0, le=1)
    affectedRadius: int = Field(ge=0)
    reportedBy: str
    recommendedAction: str
