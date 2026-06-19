from pydantic import BaseModel, Field


class DashboardStats(BaseModel):
    totalEvents: int = Field(ge=0)
    activeEvents: int = Field(ge=0)
    highPriority: int = Field(ge=0)
    roadClosures: int = Field(ge=0)
    hotspotAlerts: int = Field(ge=0)
