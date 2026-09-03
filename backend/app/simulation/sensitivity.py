from typing import Dict, Any, List
from app.simulation.engine import DeterministicSimulationEngine


class SensitivityAnalysisEngine:
    """
    Performs one-variable-at-a-time perturbation analysis to rank variables
    by their influence on profit.
    """

    @classmethod
    def analyze_sensitivity(
        cls,
        baseline_variables: Dict[str, float],
        perturbation_pct: float = 10.0,
        elasticity: float = -0.4
    ) -> List[Dict[str, Any]]:
        baseline_res = DeterministicSimulationEngine.calculate_baseline(baseline_variables)
        baseline_profit = baseline_res["profit"]

        results = []
        target_vars = [
            "customers_per_month",
            "average_order_value",
            "inventory_cost",
            "salary_cost",
            "rent",
            "utilities",
            "marketing"
        ]

        for var_name in target_vars:
            if var_name not in baseline_variables:
                continue

            # +Perturbation
            high_changes = [{"variable_name": var_name if var_name != "average_order_value" else "price_change", "change_type": "percentage", "change_value": perturbation_pct}]
            sim_high = DeterministicSimulationEngine.run_simulation(baseline_variables, high_changes, elasticity)
            profit_high = sim_high["scenario"]["profit"]

            # -Perturbation
            low_changes = [{"variable_name": var_name if var_name != "average_order_value" else "price_change", "change_type": "percentage", "change_value": -perturbation_pct}]
            sim_low = DeterministicSimulationEngine.run_simulation(baseline_variables, low_changes, elasticity)
            profit_low = sim_low["scenario"]["profit"]

            profit_swing = abs(profit_high - profit_low)

            results.append({
                "variable_name": var_name,
                "display_name": var_name.replace("_", " ").title(),
                "baseline_value": baseline_variables[var_name],
                "profit_at_plus_10": profit_high,
                "profit_at_minus_10": profit_low,
                "profit_swing": profit_swing,
                "percentage_impact": round((profit_swing / abs(baseline_profit) * 100.0) if baseline_profit != 0 else 0.0, 2)
            })

        # Rank by profit swing in descending order
        results.sort(key=lambda x: x["profit_swing"], reverse=True)
        for rank, item in enumerate(results, start=1):
            item["rank"] = rank

        return results
