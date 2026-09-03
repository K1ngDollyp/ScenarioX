import pytest
from app.simulation.engine import DeterministicSimulationEngine


def test_section_13_mandatory_deterministic_verification():
    """
    Mandatory Section 13 Numerical Integrity Test.
    Verifies that the simulation engine independently produces exact mathematical baseline and scenario outputs.
    """
    baseline_variables = {
        "customers_per_month": 600.0,
        "average_order_value": 2500.0,
        "inventory_cost": 500000.0,
        "salary_cost": 250000.0,
        "rent": 100000.0,
        "utilities": 50000.0,
        "marketing": 100000.0,
    }

    # 1. Test Baseline Calculation
    baseline = DeterministicSimulationEngine.calculate_baseline(baseline_variables)
    assert baseline["revenue"] == 1500000.0
    assert baseline["expenses"] == 1000000.0
    assert baseline["profit"] == 500000.0
    assert pytest.approx(baseline["profit_margin"], 0.01) == 33.3333

    # 2. Test Scenario Simulation (+10% price change, elasticity -0.4)
    scenario_changes = [
        {
            "variable_name": "price_change",
            "change_type": "percentage",
            "change_value": 10.0,
        }
    ]

    sim_result = DeterministicSimulationEngine.run_simulation(
        baseline_variables=baseline_variables,
        scenario_changes=scenario_changes,
        elasticity=-0.4,
    )

    scenario = sim_result["scenario"]
    comparison = sim_result["comparison"]

    # Verify exact scenario values
    assert scenario["customers_per_month"] == 576.0
    assert scenario["average_order_value"] == 2750.0
    assert scenario["revenue"] == 1584000.0
    assert scenario["expenses"] == 1000000.0
    assert scenario["profit"] == 584000.0

    # Verify exact comparison deltas
    assert comparison["profit_change"] == 84000.0
    assert comparison["profit_change_percentage"] == 16.8
