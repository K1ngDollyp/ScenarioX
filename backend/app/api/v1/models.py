import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import get_current_user, AuthenticatedUser
from app.schemas.model import BusinessModelCreate, BusinessModelUpdate, BusinessModelResponse
from app.services.model_service import ModelService

router = APIRouter()


@router.post("/", response_model=BusinessModelResponse, status_code=status.HTTP_201_CREATED)
async def create_model(
    data: BusinessModelCreate,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Creates a new business model for the authenticated user."""
    return await ModelService.create_model(db, uuid.UUID(user.id), user.email, data)


@router.get("/", response_model=List[BusinessModelResponse])
async def list_models(
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Lists all active business models owned by the authenticated user."""
    return await ModelService.list_user_models(db, uuid.UUID(user.id))


@router.get("/{model_id}", response_model=BusinessModelResponse)
async def get_model(
    model_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Gets details and variables for a specific business model."""
    return await ModelService.get_model_by_id(db, uuid.UUID(user.id), model_id)


@router.patch("/{model_id}", response_model=BusinessModelResponse)
async def update_model(
    model_id: uuid.UUID,
    data: BusinessModelUpdate,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Updates a business model."""
    return await ModelService.update_model(db, uuid.UUID(user.id), model_id, data)


@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_model(
    model_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Soft deletes a business model."""
    await ModelService.delete_model(db, uuid.UUID(user.id), model_id)
    return None
