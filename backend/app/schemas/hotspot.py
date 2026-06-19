from typing import Literal

from pydantic import BaseModel, Field


class HotspotData(BaseModel):
    id: str
    zone: str
    rank: int = Field(ge=1)
    risk: int = Field(ge=0, le=100)
    cluster: int = Field(ge=0)
    trend: Literal["up", "down"]
    change: float
