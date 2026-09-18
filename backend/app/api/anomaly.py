from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.db_models import Dataset, User
from backend.app.schemas.api_schemas import AnomalyRequest, AnomalyResponse
from backend.app.api.deps import get_current_user
from backend.app.services.dataset_service import read_dataset_df
from backend.app.services.anomaly_service import detect_dataset_anomalies

router = APIRouter(prefix="/anomaly", tags=["Anomaly Detection"])

@router.post("/detect/{dataset_id}", response_model=AnomalyResponse)
def detect_anomalies_endpoint(
    dataset_id: int,
    req: AnomalyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Detect statistical and multivariate anomalies using Isolation Forest or Z-Score."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    df = read_dataset_df(dataset.file_path, dataset.file_type)
    try:
        return detect_dataset_anomalies(df, req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
