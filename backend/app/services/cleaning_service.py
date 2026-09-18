from typing import Tuple, List, Dict, Any, Optional
import pandas as pd
import numpy as np
from backend.app.schemas.api_schemas import CleanDatasetRequest, CleanDatasetResponse

def clean_dataset_df(df: pd.DataFrame, req: CleanDatasetRequest) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Apply data cleaning transformations and return cleaned DataFrame + statistics."""
    df_cleaned = df.copy()
    original_rows, original_cols = df.shape
    
    imputed_cells = 0
    removed_dups = 0
    treated_outliers = 0
    
    # 1. Handle Missing Values
    if req.missing_value_actions:
        for action in req.missing_value_actions:
            col = action.column
            if col not in df_cleaned.columns:
                continue
                
            missing_count = int(df_cleaned[col].isna().sum())
            if missing_count == 0:
                continue
                
            strat = action.strategy.lower()
            if strat == "mean" and pd.api.types.is_numeric_dtype(df_cleaned[col]):
                fill_val = df_cleaned[col].mean()
                df_cleaned[col] = df_cleaned[col].fillna(fill_val)
                imputed_cells += missing_count
            elif strat == "median" and pd.api.types.is_numeric_dtype(df_cleaned[col]):
                fill_val = df_cleaned[col].median()
                df_cleaned[col] = df_cleaned[col].fillna(fill_val)
                imputed_cells += missing_count
            elif strat == "mode":
                mode_vals = df_cleaned[col].mode()
                if not mode_vals.empty:
                    fill_val = mode_vals.iloc[0]
                    df_cleaned[col] = df_cleaned[col].fillna(fill_val)
                    imputed_cells += missing_count
            elif strat == "ffill":
                df_cleaned[col] = df_cleaned[col].ffill()
                imputed_cells += missing_count
            elif strat == "bfill":
                df_cleaned[col] = df_cleaned[col].bfill()
                imputed_cells += missing_count
            elif strat == "constant" and action.constant_value is not None:
                df_cleaned[col] = df_cleaned[col].fillna(action.constant_value)
                imputed_cells += missing_count
            elif strat == "drop_rows":
                before = len(df_cleaned)
                df_cleaned = df_cleaned.dropna(subset=[col])
                imputed_cells += (before - len(df_cleaned))
            elif strat == "drop_column":
                df_cleaned = df_cleaned.drop(columns=[col])
                imputed_cells += missing_count

    # 2. Handle Duplicates
    if req.remove_duplicates:
        subset = req.duplicate_subset if req.duplicate_subset else None
        before = len(df_cleaned)
        df_cleaned = df_cleaned.drop_duplicates(subset=subset)
        removed_dups = before - len(df_cleaned)
        
    # 3. Handle Outliers
    if req.outlier_actions:
        for o_act in req.outlier_actions:
            col = o_act.column
            if col not in df_cleaned.columns or not pd.api.types.is_numeric_dtype(df_cleaned[col]):
                continue
                
            non_null = df_cleaned[col].dropna()
            if len(non_null) < 5:
                continue
                
            if o_act.method.lower() == "iqr":
                q25 = non_null.quantile(0.25)
                q75 = non_null.quantile(0.75)
                iqr = q75 - q25
                threshold = o_act.threshold or 1.5
                lower_bound = q25 - (threshold * iqr)
                upper_bound = q75 + (threshold * iqr)
            else:  # zscore
                mean_val = non_null.mean()
                std_val = non_null.std(ddof=1)
                threshold = o_act.threshold or 3.0
                if std_val == 0:
                    continue
                lower_bound = mean_val - (threshold * std_val)
                upper_bound = mean_val + (threshold * std_val)
                
            outlier_mask = (df_cleaned[col] < lower_bound) | (df_cleaned[col] > upper_bound)
            num_outliers = int(outlier_mask.sum())
            
            if num_outliers > 0:
                if o_act.action.lower() == "remove":
                    df_cleaned = df_cleaned[~outlier_mask]
                    treated_outliers += num_outliers
                elif o_act.action.lower() == "cap":
                    df_cleaned[col] = df_cleaned[col].clip(lower=lower_bound, upper=upper_bound)
                    treated_outliers += num_outliers

    cleaned_rows, cleaned_cols = df_cleaned.shape
    stats_summary = {
        "original_rows": original_rows,
        "original_columns": original_cols,
        "cleaned_rows": cleaned_rows,
        "cleaned_columns": cleaned_cols,
        "removed_duplicates": removed_dups,
        "imputed_missing_cells": imputed_cells,
        "treated_outliers": treated_outliers
    }
    return df_cleaned, stats_summary
