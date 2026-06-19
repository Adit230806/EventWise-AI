from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.event import EventCause, EventPriority


class CauseBreakdownItem(BaseModel):
    cause: EventCause
    count: int = Field(ge=0)


class PriorityBreakdownItem(BaseModel):
    priority: EventPriority
    count: int = Field(ge=0)


class HourlyTrendItem(BaseModel):
    hour: str
    events: int = Field(ge=0)
    critical: int = Field(ge=0)


class WeeklyTrendItem(BaseModel):
    day: str
    resolved: int = Field(ge=0)
    active: int = Field(ge=0)


class ZoneIntelligenceItem(BaseModel):
    zone: str
    events: int = Field(ge=0)
    risk: int = Field(ge=0, le=100)


class EventAnalyticsData(BaseModel):
    causeBreakdown: list[CauseBreakdownItem]
    priorityBreakdown: list[PriorityBreakdownItem]
    hourlyTrend: list[HourlyTrendItem]
    weeklyTrend: list[WeeklyTrendItem]
    zoneIntelligence: list[ZoneIntelligenceItem]
