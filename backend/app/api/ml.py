from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.db_models import Dataset, User, MLModel
from backend.app.schemas.api_schemas import (
    MLTaskDetectionResponse, MLTrainRequest, MLTrainResponse,
    MLPredictRequest, MLPredictResponse, ClusteringRequest, ClusteringResponse
)
from backend.app.api.deps import get_current_user
from backend.app.services.dataset_service import read_dataset_df
from backend.app.services.ml_service import detect_ml_task, train_ml_models, predict_single_sample, perform_kmeans_clustering

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

@router.get("/detect-task/{dataset_id}", response_model=MLTaskDetectionResponse)
def detect_task_endpoint(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Automatically analyze dataset topology to determine ML task and target columns."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    df = read_dataset_df(dataset.file_path, dataset.file_type)
    return detect_ml_task(df)

@router.post("/train/{dataset_id}", response_model=MLTrainResponse)
def train_models_endpoint(
    dataset_id: int,
    req: MLTrainRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Train regression or classification algorithms and generate comparison benchmark."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    df = read_dataset_df(dataset.file_path, dataset.file_type)
    try:
        res = train_ml_models(df, req, dataset.id)
        
        for m in res.trained_models:
            db_model = MLModel(
                dataset_id=dataset.id,
                model_name=m.model_name,
                task_type=req.task_type,
                target_col=req.target_col,
                features_list=req.feature_cols,
                metrics=m.metrics
            )
            db.add(db_model)
        db.commit()
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/predict", response_model=MLPredictResponse)
def predict_endpoint(
    req: MLPredictRequest,
    current_user: User = Depends(get_current_user)
):
    """Real-time live prediction simulator with feature weights and AI explanations."""
    try:
        return predict_single_sample(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/clustering/{dataset_id}", response_model=ClusteringResponse)
def clustering_endpoint(
    dataset_id: int,
    req: ClusteringRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """K-Means clustering with Elbow inertia curve, 2D PCA projection, and cluster personas."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    df = read_dataset_df(dataset.file_path, dataset.file_type)
    try:
        return perform_kmeans_clustering(df, req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
