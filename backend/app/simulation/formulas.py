from typing import Dict, Any


def calculate_revenue(customers_per_month: float, average_order_value: float) -> float:
    """Calculate baseline monthly revenue."""
    return customers_per_month * average_order_value


def calculate_total_expenses(
    inventory_cost: float,
    salary_cost: float,
    rent: float,
    utilities: float,
    marketing: float
) -> float:
    """Calculate total baseline monthly expenses."""
    return inventory_cost + salary_cost + rent + utilities + marketing


def calculate_profit(revenue: float, total_expenses: float) -> float:
    """Calculate net profit."""
    return revenue - total_expenses


def calculate_profit_margin(profit: float, revenue: float) -> float:
    """Calculate profit margin percentage."""
    if revenue <= 0:
        return 0.0
    return (profit / revenue) * 100.0


def apply_price_elasticity(
    baseline_customers: float,
    baseline_avg_order: float,
    price_change_pct: float,
    elasticity: float = -0.4
) -> Dict[str, float]:
    """
    Applies price elasticity of demand to compute new customer volume and order value.
    Example:
      price_change_pct = 0.10 (+10%)
      elasticity = -0.4
      demand_change = 0.10 * (-0.4) = -0.04 (-4%)
      new_customers = 600 * (1 - 0.04) = 576
      new_avg_order = 2500 * (1 + 0.10) = 2750
    """
    demand_change_pct = price_change_pct * elasticity
    new_customers = round(baseline_customers * (1.0 + demand_change_pct))
    new_avg_order = baseline_avg_order * (1.0 + price_change_pct)
    return {
        "new_customers": new_customers,
        "new_avg_order": new_avg_order,
        "demand_change_pct": demand_change_pct * 100.0,
    }
