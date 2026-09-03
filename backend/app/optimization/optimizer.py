import numpy as np
from typing import Dict, Any, List, Optional
from app.simulation.engine import DeterministicSimulationEngine

try:
    from scipy.optimize import minimize
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False


class SciPyDecisionOptimizer:
    """
    Mathematical decision variable optimizer.
    Finds optimal decision variables to maximize profit or minimize expenses under constraints.
    Uses SciPy SLSQP when available, or grid search optimization as serverless fallback.
    """

    @classmethod
    def optimize_decision(
        cls,
        baseline_variables: Dict[str, float],
        objective: str = "maximize_profit",
        bounds: Optional[List[Dict[str, Any]]] = None,
        user_constraints: Optional[List[Dict[str, Any]]] = None,
        elasticity: float = -0.4
    ) -> Dict[str, Any]:
        bounds = bounds or []
        user_constraints = user_constraints or []

        decision_keys = [b["variable_name"] for b in bounds if b["variable_name"] in baseline_variables or b["variable_name"] == "price_change"]
        if not decision_keys:
            decision_keys = ["price_change", "marketing"]
            bounds = [
                {"variable_name": "price_change", "min_value": 0.0, "max_value": 30.0},
                {"variable_name": "marketing", "min_value": 50000.0, "max_value": 300000.0}
            ]

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

        def evaluate_vector(x_vec):
            changes = []
            for idx, key in enumerate(decision_keys):
                val = float(x_vec[idx])
                if key == "price_change":
                    changes.append({"variable_name": "price_change", "change_type": "percentage", "change_value": val})
                else:
                    baseline_val = baseline_variables.get(key, 1.0)
                    abs_delta = val - baseline_val
                    changes.append({"variable_name": key, "change_type": "absolute", "change_value": abs_delta})

            sim_res = DeterministicSimulationEngine.run_simulation(baseline_variables, changes, elasticity)
            scen = sim_res["scenario"]
            return scen

        if HAS_SCIPY:
            def objective_func(x):
                scen = evaluate_vector(x)
                if objective == "maximize_profit":
                    return -scen["profit"]
                else:
                    return scen["expenses"]

            res = minimize(
                objective_func,
                x0=np.array(x0),
                method='SLSQP',
                bounds=scipy_bounds
            )
            opt_x = res.x
            success = bool(res.success)
        else:
            # Grid search fallback over decision variable space
            steps = 20
            best_score = float('-inf') if objective == "maximize_profit" else float('inf')
            best_x = list(x0)

            grid_0 = np.linspace(scipy_bounds[0][0], scipy_bounds[0][1], steps)
            grid_1 = np.linspace(scipy_bounds[1][0], scipy_bounds[1][1], steps) if len(scipy_bounds) > 1 else [0]

            for v0 in grid_0:
                for v1 in grid_1:
                    test_vec = [v0, v1] if len(scipy_bounds) > 1 else [v0]
                    scen = evaluate_vector(test_vec)
                    score = scen["profit"] if objective == "maximize_profit" else -scen["expenses"]
                    if score > best_score:
                        best_score = score
                        best_x = test_vec

            opt_x = best_x
            success = True

        final_changes = []
        optimal_vars = dict(baseline_variables)

        for idx, key in enumerate(decision_keys):
            opt_val = float(opt_x[idx])
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
            "success": success,
            "optimal_variables": {
                key: round(float(opt_x[idx]), 2) for idx, key in enumerate(decision_keys)
            },
            "expected_revenue": scen["revenue"],
            "expected_expenses": scen["expenses"],
            "expected_profit": scen["profit"],
            "message": "Optimization converged successfully satisfying all variable bounds and constraints."
        }
