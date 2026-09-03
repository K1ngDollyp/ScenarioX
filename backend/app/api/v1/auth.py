from fastapi import APIRouter, Depends
from app.core.security import get_current_user, AuthenticatedUser

router = APIRouter()


@router.get("/me")
async def get_me(user: AuthenticatedUser = Depends(get_current_user)):
    """Returns authenticated user identity info."""
    return {
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    }
