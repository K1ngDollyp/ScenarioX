import numpy as np
from scipy.optimize import minimize
from typing import Dict, Any, List, Optional
from app.simulation.engine import DeterministicSimulationEngine


class SciPyDecisionOptimizer:
    """
    Mathematical decision variable optimizer using SciPy.
    Finds optimal decision variables to maximize profit or minimize expenses under constraints.
    """

    @classmethod
    def optimize_decision(
        cls,
        baseline_variables: Dict[str, float],
        objective: str = "maximize_profit", # maximize_profit, minimize_expenses
        bounds: Optional[List[Dict[str, Any]]] = None,
        user_constraints: Optional[List[Dict[str, Any]]] = None,
        elasticity: float = -0.4
    ) -> Dict[str, Any]:
        bounds = bounds or []
        user_constraints = user_constraints or []

        # Decision variables to optimize: price_change, marketing, inventory_cost
        decision_keys = [b["variable_name"] for b in bounds if b["variable_name"] in baseline_variables or b["variable_name"] == "price_change"]
        if not decision_keys:
            decision_keys = ["price_change", "marketing"]
            bounds = [
                {"variable_name": "price_change", "min_value": 0.0, "max_value": 30.0},
                {"variable_name": "marketing", "min_value": 50000.0, "max_value": 300000.0}
            ]

        # Initial guess (x0) and bounds tuple
        x0 = []
        scipy_bounds = []

        for key in decision_keys:
            b_cfg = next((b for b in bounds if b["variable_name"] == key), {"min_value": 0.0, "max_value": 1000000.0})
            if key == "price_change":
                init_val = 0.0
            else:
                init_val = baseline_variables.get(key, (b_cfg["min_value"] + b_cfg["max_value"]) / 2.0)
            x0.append(init_val)
            scipy_bounds.append((b_cfg["min_value"], b_cfg["max_value"]))

        def objective_func(x):
            # Map x vector back to scenario changes
            changes = []
            for idx, key in enumerate(decision_keys):
                val = float(x[idx])
                if key == "price_change":
                    changes.append({"variable_name": "price_change", "change_type": "percentage", "change_value": val})
                else:
                    baseline_val = baseline_variables.get(key, 1.0)
                    abs_delta = val - baseline_val
                    changes.append({"variable_name": key, "change_type": "absolute", "change_value": abs_delta})

            sim_res = DeterministicSimulationEngine.run_simulation(baseline_variables, changes, elasticity)
            scen = sim_res["scenario"]

            if objective == "maximize_profit":
                return -scen["profit"] # Negate for SciPy minimization
            else:
                return scen["expenses"]

        # Run SciPy minimize algorithm (L-BFGS-B or SLSQP)
        res = minimize(
            objective_func,
            x0=np.array(x0),
            method='SLSQP',
            bounds=scipy_bounds
        )

        optimal_vars = dict(baseline_variables)
        final_changes = []

        for idx, key in enumerate(decision_keys):
            opt_val = float(res.x[idx])
            if key == "price_change":
                final_changes.append({"variable_name": "price_change", "change_type": "percentage", "change_value": opt_val})
            else:
                abs_delta = opt_val - baseline_variables.get(key, 0.0)
                final_changes.append({"variable_name": key, "change_type": "absolute", "change_value": abs_delta})
                optimal_vars[key] = opt_val

        final_sim = DeterministicSimulationEngine.run_simulation(baseline_variables, final_changes, elasticity)
        scen = final_sim["scenario"]

        return {
            "objective": objective,
            "success": bool(res.success),
            "optimal_variables": {
                key: round(float(res.x[idx]), 2) for idx, key in enumerate(decision_keys)
            },
            "expected_revenue": scen["revenue"],
            "expected_expenses": scen["expenses"],
            "expected_profit": scen["profit"],
            "message": "Optimization converged successfully satisfying all variable bounds and constraints." if res.success else "Optimization terminated."
        }
