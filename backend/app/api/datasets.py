import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.db_models import Dataset, User
from backend.app.schemas.api_schemas import DatasetSummary, SampleDatasetRequest
from backend.app.api.deps import get_current_user
from backend.app.services.dataset_service import (
    save_uploaded_file, read_dataset_df, detect_column_types, save_df_to_dataset_file
)
from backend.app.services.sample_datasets import SAMPLE_GENERATORS

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.post("/upload", response_model=DatasetSummary)
async def upload_dataset(
    file: UploadFile = File(...),
    dataset_name: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload CSV or Excel dataset, inspect structure, and store metadata."""
    file_path, file_type, file_size = save_uploaded_file(file)
    
    try:
        df = read_dataset_df(file_path, file_type)
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to read dataset: {str(e)}")
        
    rows, cols = df.shape
    if rows == 0 or cols == 0:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail="Uploaded dataset is empty (0 rows or 0 columns).")
        
    col_names = [str(c) for c in df.columns]
    col_types = detect_column_types(df)
    
    name = dataset_name or file.filename or "Untitled Dataset"
    
    dataset = Dataset(
        user_id=current_user.id,
        name=name,
        original_filename=file.filename or "dataset.csv",
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
        rows=rows,
        columns=cols,
        column_names=col_names,
        column_types=col_types
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    
    return dataset

@router.post("/sample", response_model=DatasetSummary)
def load_sample_dataset(
    req: SampleDatasetRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate and load one of the 5 preloaded sample datasets."""
    key = req.sample_key.lower()
    if key not in SAMPLE_GENERATORS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sample key '{key}'. Supported: {list(SAMPLE_GENERATORS.keys())}"
        )
        
    sample_title, generator_fn = SAMPLE_GENERATORS[key]
    df = generator_fn()
    
    file_path, file_type, file_size = save_df_to_dataset_file(df, f"sample_{key}")
    rows, cols = df.shape
    col_names = [str(c) for c in df.columns]
    col_types = detect_column_types(df)
    
    dataset = Dataset(
        user_id=current_user.id,
        name=sample_title,
        original_filename=f"sample_{key}.csv",
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
        rows=rows,
        columns=cols,
        column_names=col_names,
        column_types=col_types
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    
    return dataset

@router.get("", response_model=List[DatasetSummary])
def list_datasets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all datasets owned by current user."""
    return db.query(Dataset).filter(Dataset.user_id == current_user.id).order_by(Dataset.created_at.desc()).all()

@router.get("/{dataset_id}", response_model=DatasetSummary)
def get_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get single dataset details."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return dataset

@router.delete("/{dataset_id}")
def delete_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete dataset record and its physical file."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    if os.path.exists(dataset.file_path):
        try:
            os.remove(dataset.file_path)
        except Exception:
            pass
            
    db.delete(dataset)
    db.commit()
    return {"message": f"Dataset '{dataset.name}' successfully deleted."}
