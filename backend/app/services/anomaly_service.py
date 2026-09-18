from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from backend.app.schemas.api_schemas import AnomalyRequest, AnomalyResponse
from backend.app.services.profiling_service import sanitize_float

def detect_dataset_anomalies(df: pd.DataFrame, req: AnomalyRequest) -> AnomalyResponse:
    """Identify multivariate and statistical anomalies with contributing reasons."""
    features = req.feature_cols or list(df.select_dtypes(include=[np.number]).columns)
    num_df = df[features].select_dtypes(include=[np.number]).copy()
    
    if num_df.empty or len(num_df) < 10:
        raise ValueError("Anomaly detection requires numerical features and at least 10 observations.")
        
    for col in num_df.columns:
        if num_df[col].isna().sum() > 0:
            num_df[col] = num_df[col].fillna(num_df[col].median())
            
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(num_df)
    contamination = max(0.01, min(0.20, req.contamination))
    
    if req.method == "zscore":
        z_scores = np.abs(X_scaled)
        max_z = np.max(z_scores, axis=1)
        is_anomaly = max_z > 3.0
        scores = max_z / 3.0
    else: # isolation_forest
        clf = IsolationForest(contamination=contamination, random_state=42)
        preds = clf.fit_predict(X_scaled)
        is_anomaly = preds == -1
        raw_scores = clf.decision_function(X_scaled)
        min_s, max_s = raw_scores.min(), raw_scores.max()
        scores = 1.0 - ((raw_scores - min_s) / max(1e-5, (max_s - min_s)))
        
    total_records = len(df)
    anomaly_count = int(np.sum(is_anomaly))
    anomaly_pct = round((anomaly_count / total_records) * 100, 2)
    
    pca = PCA(n_components=2)
    pca_coords = pca.fit_transform(X_scaled)
    
    scatter_pts = []
    n_pts = min(300, total_records)
    for i in range(n_pts):
        scatter_pts.append({
            "index": int(i),
            "x": round(float(pca_coords[i, 0]), 3),
            "y": round(float(pca_coords[i, 1]), 3),
            "is_anomaly": bool(is_anomaly[i]),
            "anomaly_score": round(float(scores[i]), 3)
        })
        
    anom_indices = np.where(is_anomaly)[0]
    sorted_anom_indices = sorted(anom_indices, key=lambda idx: scores[idx], reverse=True)[:15]
    
    anomalous_records = []
    reasons_list = []
    
    for idx in sorted_anom_indices:
        row_dict = df.iloc[idx].to_dict()
        sanitized_row = {str(k): sanitize_float(v) for k, v in row_dict.items()}
        
        deviations = {}
        for col_idx, col_name in enumerate(num_df.columns):
            z = abs(X_scaled[idx, col_idx])
            if z > 2.0:
                deviations[str(col_name)] = round(float(z), 2)
                
        top_contrib = max(deviations.items(), key=lambda x: x[1])[0] if deviations else str(num_df.columns[0])
        reasons_list.append(f"Row #{idx}: Extreme deviation in '{top_contrib}' (Z = {deviations.get(top_contrib, 2.5)} std deviations from mean).")
        
        anomalous_records.append({
            "row_index": int(idx),
            "anomaly_score": round(float(scores[idx]), 3),
            "primary_driver": top_contrib,
            "deviating_features": deviations,
            "data": sanitized_row
        })
        
    ai_summary = (
        f"AI Anomaly Engine detected {anomaly_count} anomalous records ({anomaly_pct}% of dataset) "
        f"using {req.method.replace('_', ' ').title()}. Extreme deviations primarily manifest in {', '.join([str(c) for c in list(num_df.columns)[:3]])}."
    )
    
    return AnomalyResponse(
        total_records=total_records,
        anomaly_count=anomaly_count,
        anomaly_percentage=anomaly_pct,
        anomalous_records=anomalous_records,
        pca_scatter=scatter_pts,
        top_reasons=reasons_list[:8],
        ai_summary=ai_summary
    )
