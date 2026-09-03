import numpy as np
from typing import Dict, Any, List, Optional
from app.simulation.distributions import DistributionSampler
from app.simulation.engine import DeterministicSimulationEngine


class MonteCarloSimulationEngine:
    """
    Real statistical Monte Carlo simulation engine.
    Computes mean, median, std_dev, min, max, percentiles P5-P95, probabilities, and histogram bins.
    """

    @classmethod
    def run_monte_carlo(
        cls,
        baseline_variables: Dict[str, float],
        uncertainty_configs: List[Dict[str, Any]],
        scenario_changes: Optional[List[Dict[str, Any]]] = None,
        iterations: int = 1000,
        target_profit: float = 0.0,
        random_seed: Optional[int] = 42,
        elasticity: float = -0.4
    ) -> Dict[str, Any]:
        # Enforce server-side iteration bounds
        clamped_iterations = max(100, min(iterations, 10000))
        rng = np.random.default_rng(seed=random_seed)

        # 1. Sample uncertain baseline variables
        sampled_variables = {}
        for var_name, baseline_val in baseline_variables.items():
            matching_cfg = next(
                (cfg for cfg in uncertainty_configs if cfg.get("variable") == var_name),
                None
            )
            if matching_cfg:
                sampled_variables[var_name] = DistributionSampler.validate_and_sample(
                    matching_cfg, clamped_iterations, rng
                )
            else:
                sampled_variables[var_name] = np.full(clamped_iterations, baseline_val)

        # 2. Perform vector/iterative simulation for each iteration
        revenue_arr = np.zeros(clamped_iterations)
        expenses_arr = np.zeros(clamped_iterations)
        profit_arr = np.zeros(clamped_iterations)

        for i in range(clamped_iterations):
            iter_vars = {k: float(v[i]) for k, v in sampled_variables.items()}
            sim_res = DeterministicSimulationEngine.run_simulation(
                baseline_variables=iter_vars,
                scenario_changes=scenario_changes or [],
                elasticity=elasticity
            )
            scen = sim_res["scenario"]
            revenue_arr[i] = scen["revenue"]
            expenses_arr[i] = scen["expenses"]
            profit_arr[i] = scen["profit"]

        # 3. Calculate Statistical Metrics
        mean_profit = float(np.mean(profit_arr))
        median_profit = float(np.median(profit_arr))
        std_profit = float(np.std(profit_arr))
        min_profit = float(np.min(profit_arr))
        max_profit = float(np.max(profit_arr))

        percentiles = {
            "p5": float(np.percentile(profit_arr, 5)),
            "p10": float(np.percentile(profit_arr, 10)),
            "p25": float(np.percentile(profit_arr, 25)),
            "p50": float(np.percentile(profit_arr, 50)),
            "p75": float(np.percentile(profit_arr, 75)),
            "p90": float(np.percentile(profit_arr, 90)),
            "p95": float(np.percentile(profit_arr, 95)),
        }

        prob_profit = float(np.sum(profit_arr > 0) / clamped_iterations * 100.0)
        prob_loss = float(np.sum(profit_arr <= 0) / clamped_iterations * 100.0)
        prob_target = float(np.sum(profit_arr >= target_profit) / clamped_iterations * 100.0)

        # 4. Generate Histogram Binning for Frontend Rendering
        counts, bin_edges = np.histogram(profit_arr, bins=20)
        histogram = [
            {
                "bin_start": float(bin_edges[k]),
                "bin_end": float(bin_edges[k+1]),
                "count": int(counts[k])
            }
            for k in range(len(counts))
        ]

        return {
            "iterations": clamped_iterations,
            "random_seed": random_seed,
            "metrics": {
                "mean": round(mean_profit, 2),
                "median": round(median_profit, 2),
                "std_dev": round(std_profit, 2),
                "min": round(min_profit, 2),
                "max": round(max_profit, 2),
                "percentiles": percentiles,
                "probabilities": {
                    "probability_of_profit": round(prob_profit, 2),
                    "probability_of_loss": round(prob_loss, 2),
                    "probability_of_target": round(prob_target, 2),
                }
            },
            "histogram": histogram
        }
