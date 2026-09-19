import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.db_models import Dataset, User, Report
from backend.app.schemas.api_schemas import GenerateReportRequest
from backend.app.api.deps import get_current_user
from backend.app.services.dataset_service import read_dataset_df
from backend.app.services.report_service import generate_pdf_report, generate_excel_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/generate/{dataset_id}")
def generate_report_endpoint(
    dataset_id: int,
    req: GenerateReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate executive PDF, Excel, or CSV report."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    df = read_dataset_df(dataset.file_path, dataset.file_type)
    report_type = req.report_type.lower()
    
    effective_domain = dataset.domain_override or dataset.domain or "generic"
    mapping = dataset.column_mapping or {}

    if report_type == "pdf":
        file_path = generate_pdf_report(df, dataset.id, dataset.name, req.title, domain_override=effective_domain, column_mapping=mapping)
    elif report_type == "excel":
        file_path = generate_excel_report(df, dataset.id, dataset.name, domain_override=effective_domain, column_mapping=mapping)
    elif report_type == "csv":
        file_path = dataset.file_path
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported report type '{report_type}'. Choose pdf, excel, or csv.")
        
    title = req.title or f"{dataset.name} {report_type.upper()} Report"
    
    report_record = Report(
        dataset_id=dataset.id,
        title=title,
        report_type=report_type,
        file_path=file_path
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)
    
    return {
        "report_id": report_record.id,
        "title": title,
        "report_type": report_type,
        "download_url": f"/api/reports/download/{report_record.id}",
        "filename": os.path.basename(file_path),
        "message": f"{report_type.upper()} report generated successfully."
    }

@router.get("/download/{report_id}")
def download_report_endpoint(
    report_id: int,
    db: Session = Depends(get_db)
):
    """Stream generated report file for download."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report file not found.")
        
    media_types = {
        "pdf": "application/pdf",
        "excel": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "csv": "text/csv"
    }
    media_type = media_types.get(report.report_type.lower(), "application/octet-stream")
    return FileResponse(
        report.file_path,
        media_type=media_type,
        filename=os.path.basename(report.file_path)
    )
