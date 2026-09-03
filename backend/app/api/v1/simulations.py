import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import get_current_user, AuthenticatedUser
from app.schemas.simulation import SimulationRunRequest, SimulationResponse
from app.services.simulation_service import SimulationService

router = APIRouter()


@router.post("/scenarios/{scenario_id}/simulate", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def simulate_scenario(
    scenario_id: uuid.UUID,
    body: SimulationRunRequest = SimulationRunRequest(),
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Executes deterministic simulation and persists immutable snapshot."""
    return await SimulationService.run_deterministic_simulation(
        db, uuid.UUID(user.id), scenario_id, body.elasticity
    )


@router.get("/simulations/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(
    simulation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Retrieves simulation run details and immutable snapshot data."""
    return await SimulationService.get_simulation_by_id(db, uuid.UUID(user.id), simulation_id)


@router.get("/models/{model_id}/simulations", response_model=List[SimulationResponse])
async def list_model_simulations(
    model_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Lists simulation history for a business model."""
    return await SimulationService.list_model_simulations(db, uuid.UUID(user.id), model_id)
