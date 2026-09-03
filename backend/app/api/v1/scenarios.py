import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import get_current_user, AuthenticatedUser
from app.schemas.scenario import ScenarioCreate, ScenarioUpdate, ScenarioResponse
from app.services.scenario_service import ScenarioService

router = APIRouter()


@router.post("/models/{model_id}/scenarios", response_model=ScenarioResponse, status_code=status.HTTP_201_CREATED)
async def create_scenario(
    model_id: uuid.UUID,
    data: ScenarioCreate,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Creates a new scenario for a business model."""
    return await ScenarioService.create_scenario(db, uuid.UUID(user.id), model_id, data)


@router.get("/models/{model_id}/scenarios", response_model=List[ScenarioResponse])
async def list_scenarios(
    model_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Lists scenarios for a business model."""
    return await ScenarioService.list_model_scenarios(db, uuid.UUID(user.id), model_id)


@router.get("/scenarios/{scenario_id}", response_model=ScenarioResponse)
async def get_scenario(
    scenario_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Gets details for a specific scenario."""
    return await ScenarioService.get_scenario_by_id(db, uuid.UUID(user.id), scenario_id)


@router.patch("/scenarios/{scenario_id}", response_model=ScenarioResponse)
async def update_scenario(
    scenario_id: uuid.UUID,
    data: ScenarioUpdate,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Updates a scenario."""
    return await ScenarioService.update_scenario(db, uuid.UUID(user.id), scenario_id, data)


@router.delete("/scenarios/{scenario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scenario(
    scenario_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Soft deletes a scenario."""
    await ScenarioService.delete_scenario(db, uuid.UUID(user.id), scenario_id)
    return None
