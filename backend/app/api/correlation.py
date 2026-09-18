from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.db_models import Dataset, User
from backend.app.schemas.api_schemas import CorrelationResponse
from backend.app.api.deps import get_current_user
from backend.app.services.dataset_service import read_dataset_df
from backend.app.services.stats_service import compute_correlation_matrix

router = APIRouter(prefix="/correlation", tags=["Correlation"])

@router.get("/matrix/{dataset_id}", response_model=CorrelationResponse)
@router.get("/{dataset_id}", response_model=CorrelationResponse)
def get_correlation_endpoint(
    dataset_id: int,
    method: str = Query("pearson", pattern="^(pearson|spearman)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compute Pearson or Spearman correlation matrix with positive/negative driver highlights."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    df = read_dataset_df(dataset.file_path, dataset.file_type)
    return compute_correlation_matrix(df, method=method)
