import pytest
from app.simulation.formulas import (
    calculate_revenue,
    calculate_total_expenses,
    calculate_profit,
    calculate_profit_margin,
    apply_price_elasticity,
)


def test_basic_formulas():
    revenue = calculate_revenue(600, 2500)
    assert revenue == 1500000.0

    expenses = calculate_total_expenses(500000, 250000, 100000, 50000, 100000)
    assert expenses == 1000000.0

    profit = calculate_profit(revenue, expenses)
    assert profit == 500000.0

    profit_margin = calculate_profit_margin(profit, revenue)
    assert pytest.approx(profit_margin, 0.01) == 33.3333


def test_elasticity():
    res = apply_price_elasticity(
        baseline_customers=600,
        baseline_avg_order=2500,
        price_change_pct=0.10,
        elasticity=-0.4
    )
    assert res["new_customers"] == 576
    assert res["new_avg_order"] == 2750.0
