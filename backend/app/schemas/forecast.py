from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class HistoricalDataPoint(BaseModel):
    period: str = Field(..., description="YYYY-MM or date string")
    customers: float
    revenue: float
    expenses: float
    profit: float


class ForecastRequest(BaseModel):
    metric: str = Field("profit", description="customers, revenue, expenses, profit")
    horizon: int = Field(6, ge=1, le=24, description="Forecast periods ahead")
    historical_data: List[HistoricalDataPoint]


class ForecastResultItem(BaseModel):
    period: str
    predicted_value: float
    lower_bound: float
    upper_bound: float


class ForecastResponse(BaseModel):
    id: UUID
    model_id: UUID
    metric: str
    horizon: int
    mae: Optional[float] = None
    rmse: Optional[float] = None
    predictions: List[ForecastResultItem]
    created_at: datetime

    class Config:
        from_attributes = True
