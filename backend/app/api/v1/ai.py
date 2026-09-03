from fastapi import APIRouter, Depends, status
from app.core.security import get_current_user, AuthenticatedUser
from app.schemas.ai import (
    AIParseModelRequest,
    AIParseModelResponse,
    AIGenerateScenariosRequest,
    AIGenerateScenariosResponse,
    AIExplainResultsRequest,
    AIExplainResultsResponse,
)
from app.services.ai_service import AIService

router = APIRouter()


@router.post("/parse-model", response_model=AIParseModelResponse)
async def parse_model(
    body: AIParseModelRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Extracts structured model variables and missing fields from natural language."""
    return await AIService.parse_model_description(body.description)


@router.post("/generate-scenarios", response_model=AIGenerateScenariosResponse)
async def generate_scenarios(
    body: AIGenerateScenariosRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Generates scenario suggestions for a business model."""
    return await AIService.generate_scenario_suggestions(body.model_id)


@router.post("/explain-results", response_model=AIExplainResultsResponse)
async def explain_results(
    body: AIExplainResultsRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Generates plain-language explanation for backend-calculated simulation results."""
    return await AIService.explain_results(body.simulation_result)
