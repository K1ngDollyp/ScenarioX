from fastapi import APIRouter
from app.api.v1 import auth, models, scenarios, simulations, ai, analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(models.router, prefix="/models", tags=["Business Models"])
api_router.include_router(scenarios.router, tags=["Scenarios"])
api_router.include_router(simulations.router, tags=["Simulations"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Integration"])
api_router.include_router(analytics.router, tags=["Analytics & Optimization"])
