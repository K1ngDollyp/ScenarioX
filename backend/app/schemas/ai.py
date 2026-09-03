from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.schemas.model import VariableCreate


class AIParseModelRequest(BaseModel):
    description: str = Field(..., min_length=10, description="Natural language business description")


class AIParseModelResponse(BaseModel):
    business_type: str = "restaurant"
    extracted_variables: List[VariableCreate]
    missing_variables: List[str]
    assumptions: List[str]
    ambiguities: List[str] = []


class AIGenerateScenariosRequest(BaseModel):
    model_id: str


class AIScenarioSuggestion(BaseModel):
    name: str
    description: str
    changes: List[Dict[str, Any]]


class AIGenerateScenariosResponse(BaseModel):
    scenarios: List[AIScenarioSuggestion]


class AIExplainResultsRequest(BaseModel):
    simulation_result: Dict[str, Any]


class AIExplainResultsResponse(BaseModel):
    summary: str
    what_happened: str
    why_it_happened: str
    main_risks: str
    most_sensitive_variable: str
    practical_takeaway: str
