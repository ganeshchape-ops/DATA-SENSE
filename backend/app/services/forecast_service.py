from typing import Dict, Any, List
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from backend.app.schemas.api_schemas import ForecastRequest, ForecastResponse
from backend.app.services.profiling_service import sanitize_float

def generate_time_series_forecast(df: pd.DataFrame, req: ForecastRequest) -> ForecastResponse:
    """Produce time-series forecast with trend decomposition, confidence bands, and AI commentary."""
    date_col = req.date_col
    target_col = req.target_col
    periods = req.forecast_periods
    freq = req.frequency or "D"
    
    if date_col not in df.columns or target_col not in df.columns:
        raise ValueError(f"Specified date column '{date_col}' or target column '{target_col}' not found.")
        
    ts_df = df[[date_col, target_col]].dropna().copy()
    ts_df[date_col] = pd.to_datetime(ts_df[date_col], errors="coerce")
    ts_df = ts_df.dropna(subset=[date_col]).sort_values(by=date_col)
    
    if len(ts_df) < 5:
        raise ValueError("Time series forecasting requires at least 5 chronological observations.")
        
    ts_agg = ts_df.groupby(date_col)[target_col].mean().reset_index()
    ts_agg = ts_agg.set_index(date_col)
    
    try:
        ts_resampled = ts_agg.resample(freq).mean().interpolate(method="linear")
    except Exception:
        ts_resampled = ts_agg
        
    y = ts_resampled[target_col].values
    n = len(y)
    x = np.arange(n)
    
    slope, intercept = np.polyfit(x, y, 1)
    fitted_trend = intercept + (slope * x)
    residuals = y - fitted_trend
    std_residuals = np.std(residuals) if len(residuals) > 1 else 1.0
    
    historical_points = []
    for d, val in zip(ts_resampled.index, y):
        historical_points.append({
            "date": d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d),
            "actual": round(float(val), 2),
            "trend": round(float(intercept + slope * len(historical_points)), 2)
        })
        
    last_date = ts_resampled.index[-1]
    forecast_points = []
    
    season_len = 7 if freq == "D" and n >= 14 else 12 if freq == "M" and n >= 24 else 4
    seasonal_factors = np.zeros(season_len)
    if n >= season_len * 2:
        for i in range(n):
            seasonal_factors[i % season_len] += residuals[i]
        seasonal_factors /= (n // season_len)
        
    for step in range(1, periods + 1):
        future_idx = n + step - 1
        if freq == "D":
            next_date = last_date + timedelta(days=step)
        elif freq == "W":
            next_date = last_date + timedelta(weeks=step)
        elif freq == "M":
            next_date = last_date + pd.DateOffset(months=step)
        else:
            next_date = last_date + timedelta(days=step)
            
        future_trend = intercept + (slope * future_idx)
        future_season = seasonal_factors[future_idx % season_len] if len(seasonal_factors) > 0 else 0
        forecast_val = max(0.0, future_trend + future_season)
        
        uncertainty = std_residuals * np.sqrt(1 + (step / 10.0)) * 1.96
        lower_bound = max(0.0, forecast_val - uncertainty)
        upper_bound = forecast_val + uncertainty
        
        forecast_points.append({
            "date": next_date.strftime("%Y-%m-%d") if hasattr(next_date, "strftime") else str(next_date),
            "forecast": round(float(forecast_val), 2),
            "lower_bound": round(float(lower_bound), 2),
            "upper_bound": round(float(upper_bound), 2)
        })
        
    mae = float(np.mean(np.abs(residuals)))
    rmse = float(np.sqrt(np.mean(residuals**2)))
    growth_pct = round((slope * periods / max(1e-4, abs(intercept + slope * n))) * 100, 2)
    trend_type = "Upward Expansion" if slope > 0.05 else "Downward Contraction" if slope < -0.05 else "Stable Horizontal"
    
    trend_summary = (
        f"Detected a {trend_type} trajectory with an estimated growth rate of {growth_pct}% "
        f"over the projected {periods}-period horizon."
    )
    
    insights = [
        f"Baseline historical trend indicates average change of {slope:+.2f} per period.",
        f"Model standard error (RMSE) is {rmse:.2f} with mean absolute deviation of {mae:.2f}.",
        f"95% Confidence bounds account for historical variance and projected forecast horizon drift."
    ]
    
    return ForecastResponse(
        date_col=date_col,
        target_col=target_col,
        frequency=freq,
        historical=historical_points[-60:],
        forecast=forecast_points,
        trend_summary=trend_summary,
        metrics={
            "slope": sanitize_float(slope),
            "mae": sanitize_float(mae),
            "rmse": sanitize_float(rmse),
            "projected_growth_pct": sanitize_float(growth_pct)
        },
        ai_insights=insights
    )
