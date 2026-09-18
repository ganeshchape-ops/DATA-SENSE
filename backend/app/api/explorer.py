from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np
from backend.app.core.database import get_db
from backend.app.models.db_models import Dataset, User
from backend.app.schemas.api_schemas import ExploreQueryRequest, ExploreQueryResponse
from backend.app.api.deps import get_current_user
from backend.app.services.dataset_service import read_dataset_df, detect_column_types
from backend.app.services.profiling_service import sanitize_float

router = APIRouter(prefix="/explorer", tags=["Data Explorer"])

@router.post("/explore/{dataset_id}", response_model=ExploreQueryResponse)
def explore_dataset_endpoint(
    dataset_id: int,
    req: ExploreQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Filter, sort, search, and paginate tabular data dynamically."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    df = read_dataset_df(dataset.file_path, dataset.file_type)
    total_rows = len(df)
    filtered_df = df.copy()
    
    # 1. Full-text Search
    if req.search_query and req.search_query.strip():
        q = req.search_query.strip().lower()
        mask = pd.Series(False, index=filtered_df.index)
        for col in filtered_df.columns:
            mask = mask | filtered_df[col].astype(str).str.lower().str.contains(q, na=False)
        filtered_df = filtered_df[mask]

    # 2. Multi-condition Query Filtering
    if req.conditions:
        for cond in req.conditions:
            col = cond.column
            if col not in filtered_df.columns:
                continue
            op = cond.operator.lower()
            val = cond.value
            
            try:
                if op == "eq":
                    filtered_df = filtered_df[filtered_df[col] == val]
                elif op == "neq":
                    filtered_df = filtered_df[filtered_df[col] != val]
                elif op == "gt":
                    filtered_df = filtered_df[pd.to_numeric(filtered_df[col], errors="coerce") > float(val)]
                elif op == "gte":
                    filtered_df = filtered_df[pd.to_numeric(filtered_df[col], errors="coerce") >= float(val)]
                elif op == "lt":
                    filtered_df = filtered_df[pd.to_numeric(filtered_df[col], errors="coerce") < float(val)]
                elif op == "lte":
                    filtered_df = filtered_df[pd.to_numeric(filtered_df[col], errors="coerce") <= float(val)]
                elif op == "contains":
                    filtered_df = filtered_df[filtered_df[col].astype(str).str.contains(str(val), case=False, na=False)]
                elif op == "startswith":
                    filtered_df = filtered_df[filtered_df[col].astype(str).str.startswith(str(val), na=False)]
                elif op == "is_null":
                    filtered_df = filtered_df[filtered_df[col].isna()]
                elif op == "not_null":
                    filtered_df = filtered_df[filtered_df[col].notna()]
            except Exception:
                pass

    filtered_rows = len(filtered_df)

    # 3. Sorting
    if req.sort_column and req.sort_column in filtered_df.columns:
        ascending = req.sort_direction.lower() != "desc"
        filtered_df = filtered_df.sort_values(by=req.sort_column, ascending=ascending)

    # 4. Column Selection
    columns = [str(c) for c in (req.selected_columns if req.selected_columns else filtered_df.columns)]
    valid_columns = [c for c in columns if c in filtered_df.columns]
    if valid_columns:
        filtered_df = filtered_df[valid_columns]
    else:
        valid_columns = [str(c) for c in filtered_df.columns]

    # 5. Pagination
    page = max(1, req.page)
    page_size = max(5, min(100, req.page_size))
    total_pages = max(1, (filtered_rows + page_size - 1) // page_size)
    
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_df = filtered_df.iloc[start_idx:end_idx]

    data_records = [
        {str(k): sanitize_float(v) for k, v in row.items()}
        for row in paginated_df.to_dict(orient="records")
    ]
    
    col_types = detect_column_types(df)

    return ExploreQueryResponse(
        total_rows=total_rows,
        filtered_rows=filtered_rows,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        columns=valid_columns,
        column_types={c: col_types.get(c, "text") for c in valid_columns},
        data=data_records
    )
