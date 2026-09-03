import pytest
from app.simulation.sensitivity import SensitivityAnalysisEngine
from app.ml.forecasting import ForecastingEngine
from app.optimization.optimizer import SciPyDecisionOptimizer
from app.schemas.forecast import HistoricalDataPoint


def test_sensitivity_ranking():
    baseline = {
        "customers_per_month": 600.0,
        "average_order_value": 2500.0,
        "inventory_cost": 500000.0,
        "salary_cost": 250000.0,
        "rent": 100000.0,
        "utilities": 50000.0,
        "marketing": 100000.0,
    }

    ranking = SensitivityAnalysisEngine.analyze_sensitivity(baseline, perturbation_pct=10.0)
    assert len(ranking) > 0
    assert ranking[0]["rank"] == 1
    # Average order value / customers should be top drivers
    top_var = ranking[0]["variable_name"]
    assert top_var in ["customers_per_month", "average_order_value", "inventory_cost"]


def test_forecasting_engine():
    historical = [
        HistoricalDataPoint(period="2026-01", customers=520, revenue=1300000, expenses=900000, profit=400000),
        HistoricalDataPoint(period="2026-02", customers=550, revenue=1380000, expenses=920000, profit=460000),
        HistoricalDataPoint(period="2026-03", customers=570, revenue=1420000, expenses=940000, profit=480000),
    ]

    res = ForecastingEngine.forecast_metric(historical_data=historical, target_metric="profit", horizon=3)
    assert res["metric"] == "profit"
    assert len(res["predictions"]) == 3
    assert res["predictions"][0]["predicted_value"] > 480000


def test_forecasting_insufficient_data():
    historical = [
        HistoricalDataPoint(period="2026-01", customers=520, revenue=1300000, expenses=900000, profit=400000),
    ]
    with pytest.raises(ValueError, match="Insufficient historical data points"):
        ForecastingEngine.forecast_metric(historical_data=historical, target_metric="profit")


def test_scipy_optimizer():
    baseline = {
        "customers_per_month": 600.0,
        "average_order_value": 2500.0,
        "inventory_cost": 500000.0,
        "salary_cost": 250000.0,
        "rent": 100000.0,
        "utilities": 50000.0,
        "marketing": 100000.0,
    }

    bounds = [
        {"variable_name": "price_change", "min_value": 0.0, "max_value": 20.0},
        {"variable_name": "marketing", "min_value": 50000.0, "max_value": 200000.0}
    ]

    res = SciPyDecisionOptimizer.optimize_decision(
        baseline_variables=baseline,
        objective="maximize_profit",
        bounds=bounds
    )

    assert res["success"] is True
    assert "expected_profit" in res
    assert res["expected_profit"] >= 500000.0
