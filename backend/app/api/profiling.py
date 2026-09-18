from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.db_models import Dataset, User
from backend.app.schemas.api_schemas import DatasetProfileResponse
from backend.app.api.deps import get_current_user
from backend.app.services.dataset_service import read_dataset_df
from backend.app.services.profiling_service import generate_dataset_profile

router = APIRouter(prefix="/profiling", tags=["Profiling"])

@router.get("/profile/{dataset_id}", response_model=DatasetProfileResponse)
def get_dataset_profile_endpoint(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compute and return full statistical data profile and quality score."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    df = read_dataset_df(dataset.file_path, dataset.file_type)
    return generate_dataset_profile(df, dataset.id, dataset.name)
