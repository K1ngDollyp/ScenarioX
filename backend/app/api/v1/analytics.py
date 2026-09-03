import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import get_current_user, AuthenticatedUser
from app.services.model_service import ModelService
from app.simulation.monte_carlo import MonteCarloSimulationEngine
from app.simulation.sensitivity import SensitivityAnalysisEngine
from app.ml.forecasting import ForecastingEngine
from app.optimization.optimizer import SciPyDecisionOptimizer
from app.schemas.forecast import ForecastRequest, ForecastResponse
from app.schemas.optimization import OptimizationRequest, OptimizationResponse

router = APIRouter()


@router.post("/models/{model_id}/monte-carlo")
async def run_monte_carlo_endpoint(
    model_id: uuid.UUID,
    body: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Executes Monte Carlo risk analysis for a model."""
    model = await ModelService.get_model_by_id(db, uuid.UUID(user.id), model_id)
    baseline_vars = {v.variable_name: v.value for v in model.variables}

    uncertainty_configs = body.get("uncertainty_configs", [])
    scenario_changes = body.get("scenario_changes", [])
    iterations = int(body.get("iterations", 1000))
    random_seed = body.get("random_seed", 42)
    target_profit = float(body.get("target_profit", 0.0))

    return MonteCarloSimulationEngine.run_monte_carlo(
        baseline_variables=baseline_vars,
        uncertainty_configs=uncertainty_configs,
        scenario_changes=scenario_changes,
        iterations=iterations,
        target_profit=target_profit,
        random_seed=random_seed
    )


@router.post("/models/{model_id}/sensitivity")
async def run_sensitivity_endpoint(
    model_id: uuid.UUID,
    body: Dict[str, Any] = {},
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Executes sensitivity perturbation analysis ranking variables by profit influence."""
    model = await ModelService.get_model_by_id(db, uuid.UUID(user.id), model_id)
    baseline_vars = {v.variable_name: v.value for v in model.variables}

    perturbation_pct = float(body.get("perturbation_pct", 10.0))
    elasticity = float(body.get("elasticity", -0.4))

    return SensitivityAnalysisEngine.analyze_sensitivity(
        baseline_variables=baseline_vars,
        perturbation_pct=perturbation_pct,
        elasticity=elasticity
    )


@router.post("/models/{model_id}/forecast")
async def run_forecast_endpoint(
    model_id: uuid.UUID,
    body: ForecastRequest,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Executes linear regression time-series forecasting from uploaded/manual historical data."""
    await ModelService.get_model_by_id(db, uuid.UUID(user.id), model_id)

    res = ForecastingEngine.forecast_metric(
        historical_data=body.historical_data,
        target_metric=body.metric,
        horizon=body.horizon
    )

    return {
        "id": uuid.uuid4(),
        "model_id": model_id,
        "metric": res["metric"],
        "horizon": res["horizon"],
        "mae": res["mae"],
        "rmse": res["rmse"],
        "predictions": res["predictions"],
        "created_at": "2026-09-03T18:00:00Z"
    }


@router.post("/models/{model_id}/optimize", response_model=OptimizationResponse)
async def run_optimization_endpoint(
    model_id: uuid.UUID,
    body: OptimizationRequest,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Executes SciPy decision optimization under explicit variable bounds and constraints."""
    model = await ModelService.get_model_by_id(db, uuid.UUID(user.id), model_id)
    baseline_vars = {v.variable_name: v.value for v in model.variables}

    bounds_dicts = [b.model_dump() for b in body.bounds]
    constraints_dicts = [c.model_dump() for c in body.constraints]

    opt_res = SciPyDecisionOptimizer.optimize_decision(
        baseline_variables=baseline_vars,
        objective=body.objective,
        bounds=bounds_dicts,
        user_constraints=constraints_dicts
    )

    return OptimizationResponse(
        id=uuid.uuid4(),
        model_id=model_id,
        objective=opt_res["objective"],
        success=opt_res["success"],
        optimal_variables=opt_res["optimal_variables"],
        expected_revenue=opt_res["expected_revenue"],
        expected_expenses=opt_res["expected_expenses"],
        expected_profit=opt_res["expected_profit"],
        message=opt_res["message"],
        created_at="2026-09-03T18:00:00Z"
    )
