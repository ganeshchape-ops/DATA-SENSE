from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.db_models import Dataset, User, Analysis
from backend.app.schemas.api_schemas import AIInsightsResponse
from backend.app.api.deps import get_current_user
from backend.app.services.dataset_service import read_dataset_df
from backend.app.services.ai_service import generate_ai_insights

router = APIRouter(prefix="/ai", tags=["AI Insights"])

@router.post("/insights/{dataset_id}", response_model=AIInsightsResponse)
def get_ai_insights_endpoint(
    dataset_id: int,
    x_ai_key: str = Header(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate executive AI summary, trends, anomalies, SWOT, and recommendations."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    df = read_dataset_df(dataset.file_path, dataset.file_type)
    insights = generate_ai_insights(df, dataset.id, dataset.name, custom_api_key=x_ai_key)
    
    try:
        analysis = Analysis(
            dataset_id=dataset.id,
            analysis_type="ai_insights",
            result=insights.dict()
        )
        db.add(analysis)
        db.commit()
    except Exception:
        pass
        
    return insights
