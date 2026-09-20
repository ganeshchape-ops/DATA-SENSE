import os
import sys
from pathlib import Path

# Ensure project root and backend directory are in sys.path
ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"

for path_dir in [str(ROOT_DIR), str(BACKEND_DIR)]:
    if path_dir not in sys.path:
        sys.path.insert(0, path_dir)

from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.core.database import Base, engine
import backend.app.models.db_models  # Register all models

# API Routers
from backend.app.api.admin import router as admin_router
from backend.app.api.ai_chat import router as ai_chat_router
from backend.app.api.ai_insights import router as ai_insights_router
from backend.app.api.anomaly import router as anomaly_router
from backend.app.api.auth import router as auth_router
from backend.app.api.cleaning import router as cleaning_router
from backend.app.api.correlation import router as correlation_router
from backend.app.api.datasets import router as datasets_router
from backend.app.api.explorer import router as explorer_router
from backend.app.api.forecasting import router as forecasting_router
from backend.app.api.ml import router as ml_router
from backend.app.api.profiling import router as profiling_router
from backend.app.api.reports import router as reports_router
from backend.app.api.statistics import router as statistics_router
from backend.app.api.visualization import router as visualization_router

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Native Enterprise Intelligence & Predictive Analytics Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Middleware (Production Ready)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Initialize database tables on startup
@app.on_event("startup")
def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[WARN] Database initialization notice: {e}")

# Exception Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "success": False}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An error occurred: {str(exc)}", "success": False}
    )

# Root & Health check routes
@app.get("/api/health")
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "platform": settings.PROJECT_FULL_NAME,
        "version": settings.VERSION,
        "engine": "FastAPI + Scikit-Learn + Pandas + SciPy"
    }

@app.get("/test")
def test_endpoint():
    return {
        "status": "success",
        "message": "DATA-SENSE API Vercel deployment is active and healthy",
        "version": settings.VERSION
    }

# Register all API routers under /api
api_routers = [
    auth_router,
    datasets_router,
    profiling_router,
    cleaning_router,
    explorer_router,
    visualization_router,
    statistics_router,
    correlation_router,
    ai_insights_router,
    ai_chat_router,
    ml_router,
    forecasting_router,
    anomaly_router,
    reports_router,
    admin_router,
]

for router in api_routers:
    app.include_router(router, prefix=settings.API_V1_STR)

# Serve Frontend static assets and SPA if available
frontend_dist = ROOT_DIR / "frontend" / "dist"
if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

@app.get("/")
def home():
    index_file = frontend_dist / "index.html"
    if frontend_dist.exists() and index_file.exists():
        return FileResponse(str(index_file))
    return {
        "status": "success",
        "message": f"{settings.PROJECT_NAME} API is running",
        "docs": "/docs",
        "health": "/api/health",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    print(f"\n{settings.PROJECT_NAME} starting on http://127.0.0.1:{port}\n")
    uvicorn.run(app, host="0.0.0.0", port=port)
