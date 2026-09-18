from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from scipy import stats
from backend.app.schemas.api_schemas import HypothesisTestRequest, HypothesisTestResponse, CorrelationResponse
from backend.app.services.profiling_service import sanitize_float

def compute_hypothesis_test(df: pd.DataFrame, req: HypothesisTestRequest) -> HypothesisTestResponse:
    """Run statistical tests and generate plain-English natural language interpretations."""
    test_type = req.test_type.lower()
    alpha = 0.05
    
    if test_type == "t_test":
        col_a = req.col_a
        col_b = req.col_b
        group_col = req.group_col
        
        if group_col and group_col in df.columns and col_a in df.columns:
            unique_groups = df[group_col].dropna().unique()
            if len(unique_groups) < 2:
                raise ValueError(f"Group column '{group_col}' must have at least 2 distinct values.")
            g1_data = df[df[group_col] == unique_groups[0]][col_a].dropna()
            g2_data = df[df[group_col] == unique_groups[1]][col_a].dropna()
            group_labels = (str(unique_groups[0]), str(unique_groups[1]))
        elif col_b and col_a in df.columns and col_b in df.columns:
            g1_data = df[col_a].dropna()
            g2_data = df[col_b].dropna()
            group_labels = (col_a, col_b)
        else:
            raise ValueError("T-Test requires either two numeric columns or one numeric column and one grouping column.")
            
        t_stat, p_val = stats.ttest_ind(g1_data, g2_data, equal_var=False)
        is_sig = bool(p_val < alpha)
        
        g1_mean = float(g1_data.mean()) if len(g1_data) > 0 else 0.0
        g2_mean = float(g2_data.mean()) if len(g2_data) > 0 else 0.0
        
        if is_sig:
            interpretation = (
                f"Statistically significant difference detected (p = {p_val:.4e} < {alpha}). "
                f"'{group_labels[0]}' (Mean = {g1_mean:.2f}) differs significantly from '{group_labels[1]}' (Mean = {g2_mean:.2f})."
            )
        else:
            interpretation = (
                f"No statistically significant difference found (p = {p_val:.4f} >= {alpha}). "
                f"The observed difference between '{group_labels[0]}' ({g1_mean:.2f}) and '{group_labels[1]}' ({g2_mean:.2f}) is likely due to random variation."
            )
            
        return HypothesisTestResponse(
            test_name="Welch's Two-Sample Independent T-Test",
            statistic=sanitize_float(t_stat),
            p_value=sanitize_float(p_val),
            is_significant=is_sig,
            alpha=alpha,
            interpretation=interpretation,
            details={
                "group_1": group_labels[0],
                "group_1_mean": round(g1_mean, 2),
                "group_1_n": len(g1_data),
                "group_2": group_labels[1],
                "group_2_mean": round(g2_mean, 2),
                "group_2_n": len(g2_data)
            }
        )

    elif test_type == "anova":
        num_col = req.col_a
        cat_col = req.group_col or req.col_b
        if not cat_col or cat_col not in df.columns or num_col not in df.columns:
            raise ValueError("One-way ANOVA requires one numeric column and one categorical grouping column.")
            
        groups = [group[num_col].dropna().values for _, group in df.groupby(cat_col) if len(group[num_col].dropna()) >= 2]
        if len(groups) < 2:
            raise ValueError(f"ANOVA requires at least 2 distinct categories in '{cat_col}' with sufficient data.")
            
        f_stat, p_val = stats.f_oneway(*groups)
        is_sig = bool(p_val < alpha)
        
        if is_sig:
            interpretation = (
                f"Statistically significant variance across categories of '{cat_col}' (F = {f_stat:.2f}, p = {p_val:.4e}). "
                f"At least one category exhibits a significantly different mean for '{num_col}'."
            )
        else:
            interpretation = (
                f"No statistically significant difference across categories of '{cat_col}' (F = {f_stat:.2f}, p = {p_val:.4f}). "
                f"The means of '{num_col}' across all categories are statistically consistent."
            )
            
        return HypothesisTestResponse(
            test_name="One-Way Analysis of Variance (ANOVA)",
            statistic=sanitize_float(f_stat),
            p_value=sanitize_float(p_val),
            is_significant=is_sig,
            alpha=alpha,
            interpretation=interpretation,
            details={"categories_analyzed": len(groups), "group_column": cat_col, "numeric_column": num_col}
        )

    elif test_type == "chi_square":
        cat_a = req.col_a
        cat_b = req.col_b or req.group_col
        if not cat_b or cat_a not in df.columns or cat_b not in df.columns:
            raise ValueError("Chi-Square Test of Independence requires two categorical columns.")
            
        contingency = pd.crosstab(df[cat_a], df[cat_b])
        chi2_stat, p_val, dof, _ = stats.chi2_contingency(contingency)
        is_sig = bool(p_val < alpha)
        
        if is_sig:
            interpretation = (
                f"Significant statistical dependency detected between '{cat_a}' and '{cat_b}' (Chi2 = {chi2_stat:.2f}, p = {p_val:.4e}). "
                f"The distribution of '{cat_a}' is significantly dependent on '{cat_b}'."
            )
        else:
            interpretation = (
                f"Independence observed between '{cat_a}' and '{cat_b}' (Chi2 = {chi2_stat:.2f}, p = {p_val:.4f}). "
                f"There is no statistically significant association between the two categorical variables."
            )
            
        return HypothesisTestResponse(
            test_name="Chi-Square Test of Independence",
            statistic=sanitize_float(chi2_stat),
            p_value=sanitize_float(p_val),
            is_significant=is_sig,
            alpha=alpha,
            interpretation=interpretation,
            details={"degrees_of_freedom": int(dof), "contingency_table": contingency.to_dict()}
        )

    elif test_type == "normality":
        num_col = req.col_a
        if num_col not in df.columns:
            raise ValueError(f"Column '{num_col}' not found.")
        data = df[num_col].dropna()
        if len(data) > 5000:
            data = data.sample(5000, random_state=42)
            
        w_stat, p_val = stats.shapiro(data)
        is_normal = bool(p_val >= alpha)
        
        if is_normal:
            interpretation = (
                f"Data follows a normal distribution (W = {w_stat:.4f}, p = {p_val:.4f} >= {alpha}). "
                f"Parametric tests and linear models are well-suited for '{num_col}'."
            )
        else:
            interpretation = (
                f"Data significantly deviates from normality (W = {w_stat:.4f}, p = {p_val:.4e} < {alpha}). "
                f"Consider non-parametric tests, robust scalers, or transformations (Log/Box-Cox) for '{num_col}'."
            )
            
        return HypothesisTestResponse(
            test_name="Shapiro-Wilk Normality Test",
            statistic=sanitize_float(w_stat),
            p_value=sanitize_float(p_val),
            is_significant=not is_normal,
            alpha=alpha,
            interpretation=interpretation,
            details={"sample_size": len(data), "is_normally_distributed": is_normal}
        )
    else:
        raise ValueError(f"Unknown test type '{req.test_type}'. Supported: t_test, anova, chi_square, normality")

def compute_correlation_matrix(df: pd.DataFrame, method: str = "pearson") -> CorrelationResponse:
    """Compute Pearson or Spearman correlation matrix with positive/negative highlights and multicollinearity alerts."""
    num_df = df.select_dtypes(include=[np.number])
    if num_df.empty or num_df.shape[1] < 2:
        return CorrelationResponse(
            method=method,
            columns=list(num_df.columns),
            matrix=[],
            top_positive_pairs=[],
            top_negative_pairs=[],
            high_multicollinearity_alerts=[]
        )
        
    corr_df = num_df.corr(method=method)
    columns = list(corr_df.columns)
    
    matrix = []
    for row in corr_df.values:
        matrix.append([sanitize_float(v) for v in row])
        
    pos_pairs = []
    neg_pairs = []
    multicollinearity = []
    
    for i in range(len(columns)):
        for j in range(i + 1, len(columns)):
            col1 = columns[i]
            col2 = columns[j]
            r = corr_df.iloc[i, j]
            if pd.isna(r):
                continue
            
            val = round(float(r), 4)
            strength = "Strong" if abs(val) >= 0.7 else "Moderate" if abs(val) >= 0.4 else "Weak"
            
            pair_obj = {
                "var1": str(col1),
                "var2": str(col2),
                "correlation": val,
                "abs_correlation": abs(val),
                "strength": strength,
                "description": f"{strength} {'positive' if val > 0 else 'negative'} relationship ({val})"
            }
            
            if val > 0.3:
                pos_pairs.append(pair_obj)
            elif val < -0.3:
                neg_pairs.append(pair_obj)
                
            if abs(val) >= 0.85:
                multicollinearity.append({
                    "var1": str(col1),
                    "var2": str(col2),
                    "correlation": val,
                    "warning": f"Severe multicollinearity between '{col1}' and '{col2}' (|r| = {abs(val):.2f} >= 0.85). One can potentially be dropped during feature selection."
                })
                
    pos_pairs.sort(key=lambda x: x["correlation"], reverse=True)
    neg_pairs.sort(key=lambda x: x["correlation"])
    
    return CorrelationResponse(
        method=method,
        columns=[str(c) for c in columns],
        matrix=matrix,
        top_positive_pairs=pos_pairs[:8],
        top_negative_pairs=neg_pairs[:8],
        high_multicollinearity_alerts=multicollinearity
    )
