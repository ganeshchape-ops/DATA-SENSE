import math
from typing import Dict, Any, List
import pandas as pd
import numpy as np
from scipy import stats
from backend.app.schemas.api_schemas import DatasetProfileResponse, NumericColumnStats, CategoricalColumnStats
from backend.app.services.dataset_service import detect_column_types

def sanitize_float(val: Any) -> Any:
    """Ensure NaN, inf, or numpy scalars are converted to valid JSON types."""
    if val is None:
        return None
    if isinstance(val, (float, np.floating)):
        if math.isnan(val) or math.isinf(val):
            return None
        return round(float(val), 4)
    if isinstance(val, (int, np.integer)):
        return int(val)
    if isinstance(val, (np.bool_, bool)):
        return bool(val)
    return str(val)

def generate_dataset_profile(df: pd.DataFrame, dataset_id: int, dataset_name: str) -> DatasetProfileResponse:
    """Generate comprehensive statistical profile of a dataset."""
    total_rows, total_cols = df.shape
    memory_kb = round(df.memory_usage(deep=True).sum() / 1024, 2)
    
    total_cells = max(1, total_rows * total_cols)
    total_missing = int(df.isna().sum().sum())
    missing_pct = round((total_missing / total_cells) * 100, 2)
    
    duplicate_rows = int(df.duplicated().sum())
    duplicate_pct = round((duplicate_rows / max(1, total_rows)) * 100, 2)
    
    col_types = detect_column_types(df)
    missing_per_col = {str(col): int(df[col].isna().sum()) for col in df.columns}
    
    numeric_stats_list: List[NumericColumnStats] = []
    categorical_stats_list: List[CategoricalColumnStats] = []
    
    num_count = 0
    cat_count = 0
    date_count = 0
    
    for col in df.columns:
        ctype = col_types.get(col, "text")
        col_series = df[col]
        non_null = col_series.dropna()
        n_count = len(col_series)
        n_missing = int(col_series.isna().sum())
        n_missing_pct = round((n_missing / max(1, n_count)) * 100, 2)
        
        if ctype in ["numeric", "discrete_numeric", "binary"] and pd.api.types.is_numeric_dtype(non_null):
            num_count += 1
            if not non_null.empty:
                mean_val = sanitize_float(non_null.mean())
                std_val = sanitize_float(non_null.std(ddof=1)) if len(non_null) > 1 else 0.0
                var_val = sanitize_float(non_null.var(ddof=1)) if len(non_null) > 1 else 0.0
                min_val = sanitize_float(non_null.min())
                q25_val = sanitize_float(non_null.quantile(0.25))
                median_val = sanitize_float(non_null.median())
                q75_val = sanitize_float(non_null.quantile(0.75))
                max_val = sanitize_float(non_null.max())
                
                iqr_val = sanitize_float(q75_val - q25_val) if (q75_val is not None and q25_val is not None) else None
                skew_val = sanitize_float(stats.skew(non_null, nan_policy="omit")) if len(non_null) > 2 else 0.0
                kurt_val = sanitize_float(stats.kurtosis(non_null, nan_policy="omit")) if len(non_null) > 3 else 0.0
                
                zeros_count = int((non_null == 0).sum())
                negative_count = int((non_null < 0).sum())
            else:
                mean_val = std_val = var_val = min_val = q25_val = median_val = q75_val = max_val = iqr_val = skew_val = kurt_val = None
                zeros_count = negative_count = 0
                
            numeric_stats_list.append(NumericColumnStats(
                name=str(col),
                dtype=str(col_series.dtype),
                count=n_count,
                missing=n_missing,
                missing_pct=n_missing_pct,
                mean=mean_val,
                std=std_val,
                variance=var_val,
                min=min_val,
                q25=q25_val,
                median=median_val,
                q75=q75_val,
                max=max_val,
                iqr=iqr_val,
                skewness=skew_val,
                kurtosis=kurt_val,
                zeros_count=zeros_count,
                negative_count=negative_count
            ))
        elif ctype == "datetime":
            date_count += 1
            top_vc = non_null.astype(str).value_counts().head(10)
            top_cats = [{"category": str(k), "count": int(v), "percentage": round(float(v)/max(1, len(non_null))*100, 2)} for k, v in top_vc.items()]
            categorical_stats_list.append(CategoricalColumnStats(
                name=str(col),
                dtype="datetime",
                count=n_count,
                missing=n_missing,
                missing_pct=n_missing_pct,
                unique_count=int(non_null.nunique()),
                top_value=str(top_vc.index[0]) if len(top_vc) > 0 else None,
                top_frequency=int(top_vc.iloc[0]) if len(top_vc) > 0 else None,
                top_categories=top_cats
            ))
        else:
            cat_count += 1
            top_vc = non_null.astype(str).value_counts().head(10)
            top_cats = [{"category": str(k), "count": int(v), "percentage": round(float(v)/max(1, len(non_null))*100, 2)} for k, v in top_vc.items()]
            categorical_stats_list.append(CategoricalColumnStats(
                name=str(col),
                dtype=str(col_series.dtype),
                count=n_count,
                missing=n_missing,
                missing_pct=n_missing_pct,
                unique_count=int(non_null.nunique()),
                top_value=str(top_vc.index[0]) if len(top_vc) > 0 else None,
                top_frequency=int(top_vc.iloc[0]) if len(top_vc) > 0 else None,
                top_categories=top_cats
            ))
            
    quality = 100.0
    quality -= min(30.0, missing_pct * 2.5)
    quality -= min(20.0, duplicate_pct * 2.0)
    constant_cols = sum(1 for col in df.columns if df[col].nunique() <= 1)
    quality -= min(15.0, (constant_cols / max(1, total_cols)) * 30.0)
    quality = round(max(10.0, min(100.0, quality)), 1)
    
    return DatasetProfileResponse(
        dataset_id=dataset_id,
        dataset_name=dataset_name,
        rows=total_rows,
        columns=total_cols,
        memory_usage_kb=memory_kb,
        total_missing_cells=total_missing,
        missing_cells_pct=missing_pct,
        duplicate_rows_count=duplicate_rows,
        duplicate_rows_pct=duplicate_pct,
        numeric_columns_count=num_count,
        categorical_columns_count=cat_count,
        datetime_columns_count=date_count,
        numeric_stats=numeric_stats_list,
        categorical_stats=categorical_stats_list,
        missing_per_column=missing_per_col,
        column_types=col_types,
        data_quality_score=quality
    )
