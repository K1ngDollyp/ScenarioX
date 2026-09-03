from typing import List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


from pydantic import BaseModel, Field, ConfigDict


class VariableBase(BaseModel):
    variable_name: str = Field(..., description="Unique code for variable e.g. customers_per_month")
    display_name: str = Field(..., description="Human readable label")
    category: str = Field("revenue", description="revenue, expense, operation")
    value: float = Field(..., description="Numerical variable value")
    unit: str = Field(..., description="Explicit unit e.g. customers/month, NGN/order")
    period: str = Field("month", description="month, year, day, order")
    currency: str = Field("NGN", description="ISO currency code e.g. NGN, USD")
    description: Optional[str] = None
    source: str = Field("user_input", description="user_input, ai_extracted, calculated, system_default")


class VariableCreate(VariableBase):
    pass


class VariableResponse(VariableBase):
    id: UUID
    model_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BusinessModelBase(BaseModel):
    name: str
    business_type: str = "restaurant"
    currency: str = "NGN"
    description: Optional[str] = None


class BusinessModelCreate(BusinessModelBase):
    variables: List[VariableCreate]


class BusinessModelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    currency: Optional[str] = None
    variables: Optional[List[VariableCreate]] = None


class BusinessModelResponse(BusinessModelBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    variables: List[VariableResponse] = []

    model_config = ConfigDict(from_attributes=True)
