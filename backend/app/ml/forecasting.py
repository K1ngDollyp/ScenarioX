import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, root_mean_squared_error
from app.schemas.forecast import HistoricalDataPoint, ForecastResultItem


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

        # Convert to pandas DataFrame and sort chronologically
        df = pd.DataFrame([dp.model_dump() for dp in historical_data])
        df = df.sort_values(by="period").reset_index(drop=True)

        if target_metric not in df.columns:
            raise ValueError(f"Metric '{target_metric}' not present in historical dataset.")

        y = df[target_metric].values
        X = np.arange(len(y)).reshape(-1, 1)

        # Fit linear regression model
        model = LinearRegression()
        model.fit(X, y)

        # In-sample predictions & error evaluation metrics
        y_pred_in_sample = model.predict(X)
        mae = float(mean_absolute_error(y, y_pred_in_sample))
        rmse = float(root_mean_squared_error(y, y_pred_in_sample))

        # Standard error of regression residual
        residuals = y - y_pred_in_sample
        std_err = float(np.std(residuals)) if len(residuals) > 1 else 0.05 * float(np.mean(y))

        # Out-of-sample forecast
        future_X = np.arange(len(y), len(y) + horizon).reshape(-1, 1)
        future_y = model.predict(future_X)

        # Determine last period string format to project future period labels
        last_period = str(df["period"].iloc[-1])
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
