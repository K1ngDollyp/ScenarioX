import numpy as np
from typing import Dict, Any, Union


class DistributionSampler:
    """
    Validates and samples from statistical distributions for Monte Carlo variables.
    Supported distributions: 'fixed', 'uniform', 'normal', 'triangular'.
    """

    @staticmethod
    def validate_and_sample(
        distribution_config: Dict[str, Any],
        num_samples: int,
        rng: np.random.Generator
    ) -> np.ndarray:
        dist_type = distribution_config.get("distribution", "fixed").lower()
        params = distribution_config.get("parameters", {})

        if dist_type == "fixed":
            value = float(params.get("value", 0.0))
            return np.full(num_samples, value)

        elif dist_type == "uniform":
            min_val = float(params.get("min", 0.0))
            max_val = float(params.get("max", 1.0))
            if min_val > max_val:
                raise ValueError(f"Uniform min ({min_val}) cannot exceed max ({max_val})")
            return rng.uniform(low=min_val, high=max_val, size=num_samples)

        elif dist_type == "normal":
            mean = float(params.get("mean", 0.0))
            std_dev = float(params.get("std_dev", 1.0))
            if std_dev < 0:
                raise ValueError(f"Normal std_dev ({std_dev}) cannot be negative")
            return rng.normal(loc=mean, scale=std_dev, size=num_samples)

        elif dist_type == "triangular":
            left = float(params.get("min", 0.0))
            mode = float(params.get("most_likely", (left + float(params.get("max", 1.0))) / 2.0))
            right = float(params.get("max", 1.0))

            if not (left <= mode <= right):
                raise ValueError(f"Triangular parameters must satisfy min ({left}) <= most_likely ({mode}) <= max ({right})")

            return rng.triangular(left=left, mode=mode, right=right, size=num_samples)

        else:
            raise ValueError(f"Unsupported distribution type: '{dist_type}'")
