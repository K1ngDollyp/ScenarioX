from typing import List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class ScenarioChangeBase(BaseModel):
    variable_name: str
    change_type: str = Field("percentage", description="absolute, percentage, multiplier")
    change_value: float


class ScenarioChangeCreate(ScenarioChangeBase):
    pass


class ScenarioChangeResponse(ScenarioChangeBase):
    id: UUID
    scenario_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ScenarioBase(BaseModel):
    name: str
    description: Optional[str] = None


class ScenarioCreate(ScenarioBase):
    changes: List[ScenarioChangeCreate]


class ScenarioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    changes: Optional[List[ScenarioChangeCreate]] = None


class ScenarioResponse(ScenarioBase):
    id: UUID
    model_id: UUID
    created_at: datetime
    updated_at: datetime
    changes: List[ScenarioChangeResponse] = []

    class Config:
        from_attributes = True
