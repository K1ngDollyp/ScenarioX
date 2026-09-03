import pytest
from app.simulation.monte_carlo import MonteCarloSimulationEngine


def test_monte_carlo_reproducibility():
    """Verifies that identical inputs and random seed yield identical results."""
    baseline = {
        "customers_per_month": 600.0,
        "average_order_value": 2500.0,
        "inventory_cost": 500000.0,
        "salary_cost": 250000.0,
        "rent": 100000.0,
        "utilities": 50000.0,
        "marketing": 100000.0,
    }

    uncertainty = [
        {
            "variable": "customers_per_month",
            "distribution": "triangular",
            "parameters": {"min": 500, "most_likely": 600, "max": 700}
        }
    ]

    res1 = MonteCarloSimulationEngine.run_monte_carlo(
        baseline_variables=baseline,
        uncertainty_configs=uncertainty,
        iterations=500,
        random_seed=12345
    )

    res2 = MonteCarloSimulationEngine.run_monte_carlo(
        baseline_variables=baseline,
        uncertainty_configs=uncertainty,
        iterations=500,
        random_seed=12345
    )

    assert res1["metrics"]["mean"] == res2["metrics"]["mean"]
    assert res1["metrics"]["median"] == res2["metrics"]["median"]
    assert res1["metrics"]["percentiles"]["p50"] == res2["metrics"]["percentiles"]["p50"]
    assert res1["metrics"]["probabilities"]["probability_of_profit"] == res2["metrics"]["probabilities"]["probability_of_profit"]


def test_monte_carlo_distribution_types():
    baseline = {
        "customers_per_month": 600.0,
        "average_order_value": 2500.0,
        "inventory_cost": 500000.0,
        "salary_cost": 250000.0,
        "rent": 100000.0,
        "utilities": 50000.0,
        "marketing": 100000.0,
    }

    uncertainty = [
        {
            "variable": "customers_per_month",
            "distribution": "normal",
            "parameters": {"mean": 600, "std_dev": 50}
        },
        {
            "variable": "average_order_value",
            "distribution": "uniform",
            "parameters": {"min": 2300, "max": 2700}
        }
    ]

    res = MonteCarloSimulationEngine.run_monte_carlo(
        baseline_variables=baseline,
        uncertainty_configs=uncertainty,
        iterations=1000,
        random_seed=42
    )

    assert res["iterations"] == 1000
    assert "mean" in res["metrics"]
    assert "p5" in res["metrics"]["percentiles"]
    assert len(res["histogram"]) == 20
