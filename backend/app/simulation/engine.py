from typing import Dict, Any, List, Optional
from app.simulation.formulas import (
    calculate_revenue,
    calculate_total_expenses,
    calculate_profit,
    calculate_profit_margin,
    apply_price_elasticity,
)
from app.simulation.scenarios import apply_scenario_modifications


class DeterministicSimulationEngine:
    """
    Independent Python mathematical engine for baseline and scenario financial calculation.
    """

    @staticmethod
    def calculate_baseline(variables: Dict[str, float]) -> Dict[str, Any]:
        customers = float(variables.get("customers_per_month", 0.0))
        avg_order = float(variables.get("average_order_value", 0.0))
        
        inventory = float(variables.get("inventory_cost", 0.0))
        salaries = float(variables.get("salary_cost", 0.0))
        rent = float(variables.get("rent", 0.0))
        utilities = float(variables.get("utilities", 0.0))
        marketing = float(variables.get("marketing", 0.0))

        revenue = calculate_revenue(customers, avg_order)
        expenses = calculate_total_expenses(inventory, salaries, rent, utilities, marketing)
        profit = calculate_profit(revenue, expenses)
        profit_margin = calculate_profit_margin(profit, revenue)

        return {
            "customers_per_month": customers,
            "average_order_value": avg_order,
            "inventory_cost": inventory,
            "salary_cost": salaries,
            "rent": rent,
            "utilities": utilities,
            "marketing": marketing,
            "revenue": revenue,
            "expenses": expenses,
            "profit": profit,
            "profit_margin": profit_margin,
        }

    @classmethod
    def run_simulation(
        cls,
        baseline_variables: Dict[str, float],
        scenario_changes: List[Dict[str, Any]],
        elasticity: float = -0.4
    ) -> Dict[str, Any]:
        baseline = cls.calculate_baseline(baseline_variables)

        # Check if price_change is in scenario_changes
        price_change_entry = next(
            (c for c in scenario_changes if c.get("variable_name") == "price_change"),
            None
        )

        modified_vars = dict(baseline_variables)

        if price_change_entry:
            price_change_pct = float(price_change_entry.get("change_value", 0.0)) / 100.0
            elasticity_res = apply_price_elasticity(
                baseline_customers=baseline_variables.get("customers_per_month", 0.0),
                baseline_avg_order=baseline_variables.get("average_order_value", 0.0),
                price_change_pct=price_change_pct,
                elasticity=elasticity,
            )
            modified_vars["customers_per_month"] = elasticity_res["new_customers"]
            modified_vars["average_order_value"] = elasticity_res["new_avg_order"]

            # Filter out price_change from general scenario changes to avoid double mutation
            other_changes = [c for c in scenario_changes if c.get("variable_name") != "price_change"]
            modified_vars = apply_scenario_modifications(modified_vars, other_changes)
        else:
            modified_vars = apply_scenario_modifications(modified_vars, scenario_changes)

        scenario_res = cls.calculate_baseline(modified_vars)

        profit_change = scenario_res["profit"] - baseline["profit"]
        profit_change_pct = (profit_change / abs(baseline["profit"]) * 100.0) if baseline["profit"] != 0 else 0.0

        revenue_change = scenario_res["revenue"] - baseline["revenue"]
        revenue_change_pct = (revenue_change / abs(baseline["revenue"]) * 100.0) if baseline["revenue"] != 0 else 0.0

        expense_change = scenario_res["expenses"] - baseline["expenses"]
        expense_change_pct = (expense_change / abs(baseline["expenses"]) * 100.0) if baseline["expenses"] != 0 else 0.0

        return {
            "baseline": baseline,
            "scenario": scenario_res,
            "comparison": {
                "profit_change": profit_change,
                "profit_change_percentage": round(profit_change_pct, 4),
                "revenue_change": revenue_change,
                "revenue_change_percentage": round(revenue_change_pct, 4),
                "expense_change": expense_change,
                "expense_change_percentage": round(expense_change_pct, 4),
            }
        }
