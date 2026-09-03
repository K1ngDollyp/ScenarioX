from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class VariableBound(BaseModel):
    variable_name: str
    min_value: float
    max_value: float


class OptimizationConstraint(BaseModel):
    variable_name: str
    operator: str = Field("<= ", description="<=, >=, ==")
    target_value: float


class OptimizationRequest(BaseModel):
    objective: str = Field("maximize_profit", description="maximize_profit, minimize_expenses")
    bounds: List[VariableBound]
    constraints: List[OptimizationConstraint] = []


class OptimizationResponse(BaseModel):
    id: UUID
    model_id: UUID
    objective: str
    success: bool
    optimal_variables: Dict[str, float]
    expected_revenue: float
    expected_expenses: float
    expected_profit: float
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
