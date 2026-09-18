import os
import uuid
from pathlib import Path
from typing import Tuple, Dict, Any, List
import pandas as pd
from fastapi import UploadFile, HTTPException
from backend.app.core.config import settings, UPLOAD_DIR
from backend.app.models.db_models import Dataset

def detect_column_types(df: pd.DataFrame) -> Dict[str, str]:
    """Classify DataFrame column types accurately."""
    col_types = {}
    for col in df.columns:
        series = df[col].dropna()
        if series.empty:
            col_types[col] = "text"
            continue
        
        dtype = str(df[col].dtype)
        
        # Check datetime
        if "datetime" in dtype:
            col_types[col] = "datetime"
            continue
        
        # Try inferring datetime from string
        if dtype == "object" or dtype == "string":
            if any(k in str(col).lower() for k in ["date", "time", "timestamp", "year", "month"]):
                try:
                    pd.to_datetime(series.head(50), errors="raise")
                    col_types[col] = "datetime"
                    continue
                except Exception:
                    pass
        
        if pd.api.types.is_bool_dtype(df[col]):
            col_types[col] = "boolean"
        elif pd.api.types.is_numeric_dtype(df[col]):
            unique_count = df[col].nunique()
            if unique_count <= 2:
                col_types[col] = "binary"
            elif pd.api.types.is_integer_dtype(df[col]) and unique_count < 15:
                col_types[col] = "discrete_numeric"
            else:
                col_types[col] = "numeric"
        else:
            unique_count = df[col].nunique()
            if unique_count <= 2:
                col_types[col] = "binary"
            elif unique_count <= 20:
                col_types[col] = "categorical"
            elif unique_count == len(df) or "id" in str(col).lower() or "key" in str(col).lower():
                col_types[col] = "id"
            else:
                col_types[col] = "text"
                
    return col_types

def read_dataset_df(file_path: str, file_type: str) -> pd.DataFrame:
    """Read CSV or Excel safely with fallbacks."""
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Dataset file not found: {file_path}")
    
    ext = file_type.lower().replace(".", "")
    if ext == "csv":
        try:
            return pd.read_csv(file_path, encoding="utf-8")
        except UnicodeDecodeError:
            return pd.read_csv(file_path, encoding="latin1")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
    elif ext in ["xlsx", "xls"]:
        try:
            return pd.read_excel(file_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse Excel file: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file format: {file_type}")

def save_uploaded_file(upload_file: UploadFile) -> Tuple[str, str, int]:
    """Validate and save an uploaded file to the upload directory."""
    filename = upload_file.filename or "dataset.csv"
    ext = Path(filename).suffix.lower()
    
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed extensions: {settings.ALLOWED_EXTENSIONS}"
        )
    
    unique_name = f"{uuid.uuid4().hex}_{Path(filename).stem}{ext}"
    dest_path = UPLOAD_DIR / unique_name
    
    content = upload_file.file.read()
    size_bytes = len(content)
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    
    if size_bytes > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB"
        )
        
    with open(dest_path, "wb") as f:
        f.write(content)
        
    return str(dest_path), ext.replace(".", ""), size_bytes

def save_df_to_dataset_file(df: pd.DataFrame, base_name: str) -> Tuple[str, str, int]:
    """Save a DataFrame directly to a CSV file in uploads."""
    unique_name = f"{uuid.uuid4().hex}_{base_name}.csv"
    dest_path = UPLOAD_DIR / unique_name
    df.to_csv(dest_path, index=False)
    size_bytes = os.path.getsize(dest_path)
    return str(dest_path), "csv", size_bytes
