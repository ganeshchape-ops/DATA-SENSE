from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.db_models import Dataset, User
from backend.app.schemas.api_schemas import CleanDatasetRequest, CleanDatasetResponse
from backend.app.api.deps import get_current_user
from backend.app.services.dataset_service import read_dataset_df, save_df_to_dataset_file, detect_column_types
from backend.app.services.cleaning_service import clean_dataset_df
from backend.app.services.profiling_service import sanitize_float

router = APIRouter(prefix="/cleaning", tags=["Cleaning"])

@router.post("/clean/{dataset_id}", response_model=CleanDatasetResponse)
def clean_dataset_endpoint(
    dataset_id: int,
    req: CleanDatasetRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clean dataset via missing imputation, duplicate drop, or outlier handling."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    df = read_dataset_df(dataset.file_path, dataset.file_type)
    cleaned_df, stats_summary = clean_dataset_df(df, req)
    
    preview_data = [
        {str(k): sanitize_float(v) for k, v in row.items()}
        for row in cleaned_df.head(10).to_dict(orient="records")
    ]
    
    if req.preview_only:
        return CleanDatasetResponse(
            original_rows=stats_summary["original_rows"],
            original_columns=stats_summary["original_columns"],
            cleaned_rows=stats_summary["cleaned_rows"],
            cleaned_columns=stats_summary["cleaned_columns"],
            removed_duplicates=stats_summary["removed_duplicates"],
            imputed_missing_cells=stats_summary["imputed_missing_cells"],
            treated_outliers=stats_summary["treated_outliers"],
            preview_data=preview_data,
            message="Cleaning transformation preview generated successfully."
        )
        
    new_name = req.new_dataset_name or f"{dataset.name} (Cleaned)"
    file_path, file_type, file_size = save_df_to_dataset_file(cleaned_df, "cleaned")
    
    new_dataset = Dataset(
        user_id=current_user.id,
        name=new_name,
        original_filename=f"cleaned_{dataset.original_filename}",
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
        rows=cleaned_df.shape[0],
        columns=cleaned_df.shape[1],
        column_names=[str(c) for c in cleaned_df.columns],
        column_types=detect_column_types(cleaned_df)
    )
    db.add(new_dataset)
    db.commit()
    db.refresh(new_dataset)
    
    return CleanDatasetResponse(
        original_rows=stats_summary["original_rows"],
        original_columns=stats_summary["original_columns"],
        cleaned_rows=stats_summary["cleaned_rows"],
        cleaned_columns=stats_summary["cleaned_columns"],
        removed_duplicates=stats_summary["removed_duplicates"],
        imputed_missing_cells=stats_summary["imputed_missing_cells"],
        treated_outliers=stats_summary["treated_outliers"],
        new_dataset_id=new_dataset.id,
        preview_data=preview_data,
        message=f"Cleaned dataset saved as '{new_name}'."
    )
