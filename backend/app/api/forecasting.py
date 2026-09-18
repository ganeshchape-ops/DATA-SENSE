from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.db_models import Dataset, User
from backend.app.schemas.api_schemas import ForecastRequest, ForecastResponse
from backend.app.api.deps import get_current_user
from backend.app.services.dataset_service import read_dataset_df
from backend.app.services.forecast_service import generate_time_series_forecast

router = APIRouter(prefix="/forecasting", tags=["Forecasting"])

@router.post("/forecast/{dataset_id}", response_model=ForecastResponse)
def forecast_endpoint(
    dataset_id: int,
    req: ForecastRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate time series future projection with trend decomposition and 95% confidence intervals."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    df = read_dataset_df(dataset.file_path, dataset.file_type)
    try:
        return generate_time_series_forecast(df, req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
