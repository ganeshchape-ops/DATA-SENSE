from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.db_models import Dataset, User
from backend.app.schemas.api_schemas import HypothesisTestRequest, HypothesisTestResponse
from backend.app.api.deps import get_current_user
from backend.app.services.dataset_service import read_dataset_df
from backend.app.services.stats_service import compute_hypothesis_test

router = APIRouter(prefix="/analytics", tags=["Statistics"])

@router.post("/hypothesis-test/{dataset_id}", response_model=HypothesisTestResponse)
def run_hypothesis_test_endpoint(
    dataset_id: int,
    req: HypothesisTestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Execute statistical test (T-Test, ANOVA, Chi-Square, Normality) with plain-English interpretations."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    df = read_dataset_df(dataset.file_path, dataset.file_type)
    try:
        return compute_hypothesis_test(df, req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
