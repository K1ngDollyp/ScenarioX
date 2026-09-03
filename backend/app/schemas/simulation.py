from typing import Dict, Any, Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class SimulationRunRequest(BaseModel):
    elasticity: float = Field(-0.4, description="Price elasticity coefficient")


class SimulationResultItem(BaseModel):
    metric_name: str
    metric_value: float
    metadata: Dict[str, Any] = {}


class SimulationResponse(BaseModel):
    id: UUID
    model_id: UUID
    scenario_id: Optional[UUID] = None
    simulation_type: str
    status: str
    iterations: int = 1
    random_seed: Optional[int] = None
    snapshot_data: Dict[str, Any] = Field(..., description="Immutable snapshot of inputs and context")
    started_at: datetime
    completed_at: datetime
    created_at: datetime
    results: List[SimulationResultItem] = []

    class Config:
        from_attributes = True
