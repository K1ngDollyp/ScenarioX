import numpy as np
from typing import List, Dict, Any, Optional
from app.schemas.forecast import HistoricalDataPoint, ForecastResultItem

try:
    import pandas as pd
    from sklearn.linear_model import LinearRegression
    from sklearn.metrics import mean_absolute_error, root_mean_squared_error
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


class ForecastingEngine:
    """
    Time-series forecasting module using Linear Regression with trend confidence intervals.
    Requires historical data; refuses to fabricate predictions from insufficient data.
    """

    @classmethod
    def forecast_metric(
        cls,
        historical_data: List[HistoricalDataPoint],
        target_metric: str = "profit",
        horizon: int = 6
    ) -> Dict[str, Any]:
        if len(historical_data) < 3:
            raise ValueError(
                f"Insufficient historical data points ({len(historical_data)} provided). "
                "At least 3 historical time periods are required for forecasting."
            )

        periods = [dp.period for dp in historical_data]
        values = []
        for dp in historical_data:
            d_dict = dp.model_dump()
            val = d_dict.get(target_metric)
            if val is None:
                raise ValueError(f"Metric '{target_metric}' not present in historical dataset.")
            values.append(float(val))

        # Sort chronologically by period
        sorted_pairs = sorted(zip(periods, values), key=lambda x: x[0])
        sorted_periods, y = zip(*sorted_pairs)
        y = np.array(y, dtype=float)
        X = np.arange(len(y), dtype=float)

        if HAS_SKLEARN:
            X_2d = X.reshape(-1, 1)
            model = LinearRegression()
            model.fit(X_2d, y)
            y_pred_in_sample = model.predict(X_2d)
            mae = float(mean_absolute_error(y, y_pred_in_sample))
            rmse = float(root_mean_squared_error(y, y_pred_in_sample))
            future_X = np.arange(len(y), len(y) + horizon).reshape(-1, 1)
            future_y = model.predict(future_X)
        else:
            # Polyfit linear regression fallback (y = slope * x + intercept)
            slope, intercept = np.polyfit(X, y, 1)
            y_pred_in_sample = slope * X + intercept
            residuals = y - y_pred_in_sample
            mae = float(np.mean(np.abs(residuals)))
            rmse = float(np.sqrt(np.mean(residuals ** 2)))
            future_X = np.arange(len(y), len(y) + horizon)
            future_y = slope * future_X + intercept

        residuals = y - y_pred_in_sample
        std_err = float(np.std(residuals)) if len(residuals) > 1 else 0.05 * float(np.mean(y))

        future_predictions = []
        for i in range(horizon):
            pred_val = float(future_y[i])
            margin = 1.96 * std_err # 95% confidence interval approximation
            period_label = f"Period +{i+1}"
            
            future_predictions.append(ForecastResultItem(
                period=period_label,
                predicted_value=round(pred_val, 2),
                lower_bound=round(pred_val - margin, 2),
                upper_bound=round(pred_val + margin, 2)
            ))

        return {
            "metric": target_metric,
            "horizon": horizon,
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "predictions": [item.model_dump() for item in future_predictions]
        }
