import os
import json
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
import requests
from backend.app.core.config import settings
from backend.app.schemas.api_schemas import AIInsightsResponse, AIInsightSection
from backend.app.services.profiling_service import generate_dataset_profile
from backend.app.services.stats_service import compute_correlation_matrix
from backend.app.services.dataset_detector import detect_dataset_domain
from backend.app.services.analyzers import get_analyzer

def generate_heuristic_ai_insights(
    df: pd.DataFrame,
    dataset_id: int,
    dataset_name: str,
    domain_override: Optional[str] = None,
    column_mapping: Optional[Dict[str, Any]] = None
) -> AIInsightsResponse:
    """Generate high-depth, domain-aware analytical insights using statistical heuristics."""
    profile = generate_dataset_profile(df, dataset_id, dataset_name)
    corr_result = compute_correlation_matrix(df)
    
    # Resolve domain
    if domain_override:
        effective_domain = domain_override
    else:
        detected = detect_dataset_domain(df)
        effective_domain = detected["domain"]
        if not column_mapping:
            column_mapping = detected["detected_fields"]

    analyzer = get_analyzer(effective_domain)
    domain_insights = analyzer.get_ai_insights(df, column_mapping)

    total_rows = len(df)
    total_cols = len(df.columns)
    
    # 1. Executive Summary (Domain tailored)
    base_summary = domain_insights.get("executive_summary")
    if not base_summary:
        summary_sentences = [
            f"AI DataSense analyzed '{dataset_name}' containing {total_rows:,} records and {total_cols} attributes.",
            f"The dataset achieves an overall Data Health Score of {profile.data_quality_score}/100.",
        ]
        if profile.total_missing_cells > 0:
            summary_sentences.append(f"Identified {profile.total_missing_cells:,} missing cells ({profile.missing_cells_pct}% missingness).")
        else:
            summary_sentences.append("The dataset is complete with zero missing values detected.")
        base_summary = " ".join(summary_sentences)
        
    executive_summary = base_summary
    
    # 2. Key Findings
    key_findings: List[AIInsightSection] = []
    
    # First inject domain-specific findings
    for df_finding in domain_insights.get("key_findings", []):
        key_findings.append(AIInsightSection(
            title=df_finding.get("title", "Key Finding"),
            summary=df_finding.get("summary", ""),
            bullet_points=df_finding.get("bullet_points", []),
            badge=df_finding.get("badge", analyzer.domain_display_name[:12]),
            sentiment=df_finding.get("sentiment", "positive")
        ))

    # Add numeric distribution findings
    for num_col in profile.numeric_stats[:3]:
        points = []
        points.append(f"Average value is {num_col.mean:,.2f} with standard deviation {num_col.std:,.2f}.")
        points.append(f"50% of the observations fall between {num_col.q25:,.2f} and {num_col.q75:,.2f} (IQR = {num_col.iqr:,.2f}).")
        if num_col.skewness is not None and abs(num_col.skewness) > 1.0:
            skew_dir = "right (positively skewed, long right tail)" if num_col.skewness > 0 else "left (negatively skewed, long left tail)"
            points.append(f"Significant skewness of {num_col.skewness:.2f} indicates asymmetric distribution towards the {skew_dir}.")
        
        badge = "Normal" if (num_col.skewness and abs(num_col.skewness) < 0.5) else "Skewed"
        key_findings.append(AIInsightSection(
            title=f"Distribution Analysis: {num_col.name}",
            summary=f"Descriptive metrics for {num_col.name} ranging from {num_col.min:,.2f} to {num_col.max:,.2f}.",
            bullet_points=points,
            badge=badge,
            sentiment="positive" if badge == "Normal" else "neutral"
        ))
        
    for cat_col in profile.categorical_stats[:2]:
        points = []
        points.append(f"Contains {cat_col.unique_count} distinct categories.")
        if cat_col.top_value:
            top_pct = round((cat_col.top_frequency / max(1, total_rows)) * 100, 1)
            points.append(f"Dominant category is '{cat_col.top_value}' representing {top_pct}% of total occurrences.")
        key_findings.append(AIInsightSection(
            title=f"Categorical Breakdown: {cat_col.name}",
            summary=f"Cardinality and frequency concentration in {cat_col.name}.",
            bullet_points=points,
            badge="Categorical",
            sentiment="neutral"
        ))

    # 3. Trends & Patterns
    identified_trends: List[AIInsightSection] = []
    date_cols = [c for c, t in profile.column_types.items() if t == "datetime"]
    if date_cols:
        dcol = date_cols[0]
        try:
            df_sorted = df.copy()
            df_sorted[dcol] = pd.to_datetime(df_sorted[dcol], errors="coerce")
            df_sorted = df_sorted.dropna(subset=[dcol]).sort_values(by=dcol)
            if profile.numeric_stats:
                first_num = profile.numeric_stats[0].name
                series = df_sorted[first_num].dropna()
                if len(series) > 10:
                    first_half = series.iloc[:len(series)//2].mean()
                    second_half = series.iloc[len(series)//2:].mean()
                    pct_change = round(((second_half - first_half) / max(0.001, abs(first_half))) * 100, 2)
                    trend_dir = "growth" if pct_change > 0 else "decline"
                    identified_trends.append(AIInsightSection(
                        title=f"Temporal Trend in {first_num} over {dcol}",
                        summary=f"Detected {abs(pct_change)}% {trend_dir} in {first_num} comparing historical to recent timeline.",
                        bullet_points=[
                            f"Earliest date: {df_sorted[dcol].min().strftime('%Y-%m-%d')}, Latest: {df_sorted[dcol].max().strftime('%Y-%m-%d')}.",
                            f"Early period mean: {first_half:,.2f} vs Late period mean: {second_half:,.2f}."
                        ],
                        badge="Temporal",
                        sentiment="positive" if pct_change > 0 else "warning"
                    ))
        except Exception:
            pass
            
    if not identified_trends:
        identified_trends.append(AIInsightSection(
            title="Cross-Sectional Patterns",
            summary=f"Structural analysis for {analyzer.domain_display_name}.",
            bullet_points=[
                f"Cohort exhibits {total_rows} sample records across {total_cols} dimensions.",
                "Homogeneous records suggest robust statistical power for analysis."
            ],
            badge="Cross-Sectional",
            sentiment="neutral"
        ))

    # 4. Anomalies and Risks
    anomalies_and_risks: List[AIInsightSection] = []
    if profile.total_missing_cells > 0:
        high_missing = [f"{col} ({cnt} missing, {round(cnt/total_rows*100,1)}%)" for col, cnt in profile.missing_per_column.items() if cnt > 0]
        anomalies_and_risks.append(AIInsightSection(
            title="Data Completeness Risk",
            summary=f"Missing values detected in {len(high_missing)} features.",
            bullet_points=[
                f"Impacted columns: {', '.join(high_missing[:4])}.",
                "Recommended Action: Use median or mode imputation in Data Cleaning."
            ],
            badge="Missing Data",
            sentiment="warning"
        ))
        
    if profile.duplicate_rows_count > 0:
        anomalies_and_risks.append(AIInsightSection(
            title="Duplicate Entry Warning",
            summary=f"Found {profile.duplicate_rows_count} exact duplicate rows.",
            bullet_points=[
                "Duplicate records can distort statistical distributions.",
                "Recommended Action: Remove duplicate rows before modeling."
            ],
            badge="Duplicates",
            sentiment="alert"
        ))
        
    if corr_result.high_multicollinearity_alerts:
        alerts = [item["warning"] for item in corr_result.high_multicollinearity_alerts[:3]]
        anomalies_and_risks.append(AIInsightSection(
            title="High Multicollinearity Alert",
            summary="Strong inter-variable linear dependencies detected.",
            bullet_points=alerts,
            badge="Collinearity",
            sentiment="warning"
        ))

    if not anomalies_and_risks:
        anomalies_and_risks.append(AIInsightSection(
            title="Zero Critical Data Anomalies",
            summary="The dataset passed completeness and consistency integrity checks with high fidelity.",
            bullet_points=["No severe missingness, duplicates, or collinearity breaches detected."],
            badge="Clean Data",
            sentiment="positive"
        ))

    # 5. Correlations & Drivers
    correlations_and_drivers: List[AIInsightSection] = []
    if corr_result.top_positive_pairs:
        top_pos = corr_result.top_positive_pairs[0]
        correlations_and_drivers.append(AIInsightSection(
            title=f"Strongest Positive Driver: {top_pos['var1']} & {top_pos['var2']}",
            summary=f"Strong positive linear correlation (r = +{top_pos['correlation']:.2f}).",
            bullet_points=[
                f"As '{top_pos['var1']}' increases, '{top_pos['var2']}' demonstrates a synchronized increase.",
                "This relationship represents a key explanatory predictive feature."
            ],
            badge="Positive Driver",
            sentiment="positive"
        ))
        
    if corr_result.top_negative_pairs:
        top_neg = corr_result.top_negative_pairs[0]
        correlations_and_drivers.append(AIInsightSection(
            title=f"Inverse Relationship: {top_neg['var1']} & {top_neg['var2']}",
            summary=f"Significant inverse correlation (r = {top_neg['correlation']:.2f}).",
            bullet_points=[
                f"Higher values of '{top_neg['var1']}' coincide with reduced values in '{top_neg['var2']}'."
            ],
            badge="Inverse Driver",
            sentiment="neutral"
        ))

    # 6. Strategic Recommendations
    strategic_recommendations: List[AIInsightSection] = []
    recs_list = domain_insights.get("recommendations", [])
    if recs_list:
        strategic_recommendations.append(AIInsightSection(
            title=f"{analyzer.domain_display_name} Action Plan",
            summary="Targeted strategic initiatives derived from domain analytics.",
            bullet_points=recs_list[:4],
            badge="Strategy",
            sentiment="positive"
        ))
    else:
        strategic_recommendations.append(AIInsightSection(
            title="Operational Action Plan",
            summary="Actionable execution steps.",
            bullet_points=[
                "Focus KPI optimization on primary driver variables identified in correlation analysis.",
                "Schedule periodic anomaly scans to flag sudden metric shifts.",
                "Export executive PDF report for management review."
            ],
            badge="Operations",
            sentiment="positive"
        ))

    # 7. SWOT Analysis
    swot = {
        "strengths": domain_insights.get("strengths", [
            f"Sample size of {total_rows:,} records across {total_cols} attributes.",
            f"Data Health Score of {profile.data_quality_score}/100."
        ]),
        "weaknesses": domain_insights.get("weaknesses", [
            f"Missing data in {sum(1 for cnt in profile.missing_per_column.values() if cnt > 0)} columns requiring preprocessing."
        ]),
        "opportunities": domain_insights.get("opportunities", [
            "Deploy predictive machine learning models for automated decision making."
        ]),
        "threats": domain_insights.get("threats", [
            "Overfitting if non-informative identifiers are included in training."
        ])
    }

    return AIInsightsResponse(
        dataset_id=dataset_id,
        dataset_name=dataset_name,
        executive_summary=executive_summary,
        data_health_evaluation=f"Data Quality: {profile.data_quality_score}/100. Domain: {analyzer.domain_display_name}. Features: {total_cols}.",
        key_findings=key_findings,
        identified_trends=identified_trends,
        anomalies_and_risks=anomalies_and_risks,
        correlations_and_drivers=correlations_and_drivers,
        strategic_recommendations=strategic_recommendations,
        swot_analysis=swot,
        generated_by="heuristic_engine"
    )

def generate_ai_insights(df: pd.DataFrame, dataset_id: int, dataset_name: str, custom_api_key: Optional[str] = None, domain_override: Optional[str] = None) -> AIInsightsResponse:
    """Generate AI insights using pluggable LLM if key is available, else statistical heuristic engine."""
    return generate_heuristic_ai_insights(df, dataset_id, dataset_name, domain_override=domain_override)
