from typing import Dict, Any, List, Union


def apply_variable_change(
    current_value: float,
    change_type: str,
    change_value: float
) -> float:
    """
    Applies a single variable modification.
    - 'percentage': change_value of 10 means +10% (multiplier 1.10), -5 means -5% (multiplier 0.95)
    - 'absolute': current_value + change_value
    - 'multiplier': current_value * change_value
    """
    if change_type == "percentage":
        return current_value * (1.0 + (change_value / 100.0))
    elif change_type == "absolute":
        return current_value + change_value
    elif change_type == "multiplier":
        return current_value * change_value
    else:
        raise ValueError(f"Unsupported change_type: {change_type}")


def apply_scenario_modifications(
    baseline_variables: Dict[str, float],
    changes: List[Dict[str, Any]]
) -> Dict[str, float]:
    """
    Given baseline model variables dict and a list of scenario changes,
    returns a updated copy of variables with scenario modifications applied.
    """
    modified = dict(baseline_variables)
    for change in changes:
        var_name = change.get("variable_name")
        if var_name in modified:
            modified[var_name] = apply_variable_change(
                current_value=modified[var_name],
                change_type=change.get("change_type", "percentage"),
                change_value=float(change.get("change_value", 0.0))
            )
    return modified
