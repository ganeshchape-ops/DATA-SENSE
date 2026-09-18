from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np
from backend.app.core.database import get_db
from backend.app.models.db_models import Dataset, User
from backend.app.schemas.api_schemas import ChartRequest, RecommendedChart
from backend.app.api.deps import get_current_user
from backend.app.services.dataset_service import read_dataset_df, detect_column_types
from backend.app.services.profiling_service import sanitize_float

router = APIRouter(prefix="/visualization", tags=["Visualization"])

@router.get("/recommend/{dataset_id}", response_model=List[RecommendedChart])
def get_chart_recommendations(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Recommend best charts based on column data type topology."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    df = read_dataset_df(dataset.file_path, dataset.file_type)
    col_types = detect_column_types(df)
    
    num_cols = [c for c, t in col_types.items() if t in ["numeric", "discrete_numeric"]]
    cat_cols = [c for c, t in col_types.items() if t in ["categorical", "binary"]]
    date_cols = [c for c, t in col_types.items() if t == "datetime"]
    
    recommendations: List[RecommendedChart] = []
    
    if date_cols and num_cols:
        recommendations.append(RecommendedChart(
            chart_type="area",
            x_axis=date_cols[0],
            y_axis=num_cols[0],
            title=f"Time-Series Trend: {num_cols[0]} over {date_cols[0]}",
            reason="Captures chronological progression, seasonality and temporal momentum.",
            score=0.98
        ))
        
    if cat_cols and num_cols:
        recommendations.append(RecommendedChart(
            chart_type="bar",
            x_axis=cat_cols[0],
            y_axis=num_cols[0],
            title=f"Category Comparison: {num_cols[0]} by {cat_cols[0]}",
            reason="Ideal for ranking and comparing aggregate values across distinct segments.",
            score=0.95
        ))
        
    if len(num_cols) >= 2:
        recommendations.append(RecommendedChart(
            chart_type="scatter",
            x_axis=num_cols[0],
            y_axis=num_cols[1],
            title=f"Correlation Scatter: {num_cols[1]} vs {num_cols[0]}",
            reason="Reveals linear, non-linear relationships, clusters, and bivariate outliers.",
            score=0.92
        ))
        
    if cat_cols:
        recommendations.append(RecommendedChart(
            chart_type="pie",
            x_axis=cat_cols[0],
            y_axis=None,
            title=f"Composition Distribution: {cat_cols[0]}",
            reason="Visualizes proportional market share and segment breakdown.",
            score=0.88
        ))
        
    if num_cols:
        recommendations.append(RecommendedChart(
            chart_type="histogram",
            x_axis=num_cols[0],
            y_axis=None,
            title=f"Frequency Histogram: {num_cols[0]}",
            reason="Highlights skewness, kurtosis, modal peaks, and continuous variance.",
            score=0.85
        ))
        
    if cat_cols and num_cols:
        cat_for_box = cat_cols[1] if len(cat_cols) > 1 else cat_cols[0]
        num_for_box = num_cols[1] if len(num_cols) > 1 else num_cols[0]
        recommendations.append(RecommendedChart(
            chart_type="boxplot",
            x_axis=cat_for_box,
            y_axis=num_for_box,
            title=f"Spread & Outlier Box Plot: {num_for_box} across {cat_for_box}",
            reason="Compares quartiles, medians, and outlier points between categories.",
            score=0.82
        ))

    return recommendations

@router.post("/query/{dataset_id}")
def query_chart_data(
    dataset_id: int,
    req: ChartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aggregate and format data for interactive frontend Recharts/Plotly rendering."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    df = read_dataset_df(dataset.file_path, dataset.file_type)
    chart_type = req.chart_type.lower()
    x_axis = req.x_axis
    y_axis = req.y_axis
    
    if x_axis not in df.columns:
        raise HTTPException(status_code=400, detail=f"X-Axis column '{x_axis}' not in dataset.")
        
    if chart_type == "histogram":
        series = pd.to_numeric(df[x_axis], errors="coerce").dropna()
        if series.empty:
            return {"data": []}
        counts, bin_edges = np.histogram(series, bins=min(20, max(5, int(np.sqrt(len(series))))))
        hist_data = []
        for i in range(len(counts)):
            hist_data.append({
                "bin": f"{bin_edges[i]:.1f} - {bin_edges[i+1]:.1f}",
                "count": int(counts[i]),
                "range_min": round(float(bin_edges[i]), 2),
                "range_max": round(float(bin_edges[i+1]), 2)
            })
        return {"data": hist_data, "chart_type": "histogram", "x_axis": x_axis}

    elif chart_type == "scatter":
        if not y_axis or y_axis not in df.columns:
            raise HTTPException(status_code=400, detail="Scatter plot requires valid Y-Axis column.")
        clean_df = df[[x_axis, y_axis]].dropna()
        clean_df[x_axis] = pd.to_numeric(clean_df[x_axis], errors="coerce")
        clean_df[y_axis] = pd.to_numeric(clean_df[y_axis], errors="coerce")
        clean_df = clean_df.dropna()
        
        if len(clean_df) > 500:
            clean_df = clean_df.sample(500, random_state=42)
            
        scatter_pts = [
            {"x": round(float(r[x_axis]), 2), "y": round(float(r[y_axis]), 2)}
            for _, r in clean_df.iterrows()
        ]
        return {"data": scatter_pts, "chart_type": "scatter", "x_axis": x_axis, "y_axis": y_axis}

    elif chart_type == "boxplot":
        if not y_axis or y_axis not in df.columns:
            raise HTTPException(status_code=400, detail="Box plot requires numeric Y-Axis column.")
        box_data = []
        for cat_val, group in df.groupby(x_axis):
            num_s = pd.to_numeric(group[y_axis], errors="coerce").dropna()
            if len(num_s) >= 3:
                q25 = float(num_s.quantile(0.25))
                med = float(num_s.median())
                q75 = float(num_s.quantile(0.75))
                iqr = q75 - q25
                min_v = float(max(num_s.min(), q25 - 1.5 * iqr))
                max_v = float(min(num_s.max(), q75 + 1.5 * iqr))
                box_data.append({
                    "category": str(cat_val),
                    "min": round(min_v, 2),
                    "q25": round(q25, 2),
                    "median": round(med, 2),
                    "q75": round(q75, 2),
                    "max": round(max_v, 2)
                })
        return {"data": box_data[:15], "chart_type": "boxplot", "x_axis": x_axis, "y_axis": y_axis}

    elif chart_type == "pie":
        vc = df[x_axis].astype(str).value_counts().head(req.limit or 8)
        pie_data = [{"name": str(k), "value": int(v)} for k, v in vc.items()]
        return {"data": pie_data, "chart_type": "pie", "x_axis": x_axis}

    else:
        if not y_axis or y_axis not in df.columns:
            vc = df[x_axis].astype(str).value_counts().head(req.limit or 25)
            agg_data = [{"name": str(k), "value": int(v)} for k, v in vc.items()]
            return {"data": agg_data, "chart_type": chart_type, "x_axis": x_axis, "y_axis": "Count"}
            
        agg_func = req.aggregation or "sum"
        grouped = df.groupby(x_axis)[y_axis]
        
        if agg_func == "avg" or agg_func == "mean":
            res = grouped.mean()
        elif agg_func == "count":
            res = grouped.count()
        elif agg_func == "min":
            res = grouped.min()
        elif agg_func == "max":
            res = grouped.max()
        elif agg_func == "median":
            res = grouped.median()
        else:
            res = grouped.sum()
            
        res = res.sort_values(ascending=False).head(req.limit or 30)
        chart_data = [
            {"name": str(k), "value": round(float(v), 2) if pd.notna(v) else 0.0}
            for k, v in res.items()
        ]
        return {"data": chart_data, "chart_type": chart_type, "x_axis": x_axis, "y_axis": y_axis, "aggregation": agg_func}
