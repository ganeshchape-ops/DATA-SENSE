import sys
import os
from pathlib import Path

# Ensure project root is in sys.path when executed directly
_root_dir = Path(__file__).resolve().parent.parent.parent
if str(_root_dir) not in sys.path:
    sys.path.insert(0, str(_root_dir))

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings, UPLOAD_DIR, REPORTS_DIR
from backend.app.core.database import engine, Base
import backend.app.models.db_models  # Ensure all models are registered

# API Routers
from backend.app.api.auth import router as auth_router
from backend.app.api.datasets import router as datasets_router
from backend.app.api.profiling import router as profiling_router
from backend.app.api.cleaning import router as cleaning_router
from backend.app.api.explorer import router as explorer_router
from backend.app.api.visualization import router as vis_router
from backend.app.api.statistics import router as stats_router
from backend.app.api.correlation import router as corr_router
from backend.app.api.ai_insights import router as ai_router
from backend.app.api.ai_chat import router as ai_chat_router
from backend.app.api.ml import router as ml_router
from backend.app.api.forecasting import router as forecast_router
from backend.app.api.anomaly import router as anomaly_router
from backend.app.api.reports import router as reports_router
from backend.app.api.admin import router as admin_router

# Create Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Native Enterprise Intelligence & Predictive Analytics Platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.exceptions import HTTPException, RequestValidationError

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "success": False}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "success": False}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_msg = str(exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An error occurred: {error_msg}", "success": False}
    )

# Register API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(datasets_router, prefix=settings.API_V1_STR)
app.include_router(profiling_router, prefix=settings.API_V1_STR)
app.include_router(cleaning_router, prefix=settings.API_V1_STR)
app.include_router(explorer_router, prefix=settings.API_V1_STR)
app.include_router(vis_router, prefix=settings.API_V1_STR)
app.include_router(stats_router, prefix=settings.API_V1_STR)
app.include_router(corr_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(ai_chat_router, prefix=settings.API_V1_STR)
app.include_router(ml_router, prefix=settings.API_V1_STR)
app.include_router(forecast_router, prefix=settings.API_V1_STR)
app.include_router(anomaly_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "platform": settings.PROJECT_FULL_NAME,
        "version": settings.VERSION,
        "engine": "FastAPI + Scikit-Learn + Pandas + SciPy"
    }

frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

from fastapi.responses import FileResponse, HTMLResponse

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Allow API, Docs, and OpenAPI routes to pass through
    if full_path.startswith("api/") or full_path == "api" or full_path.startswith("docs") or full_path.startswith("redoc") or full_path == "openapi.json":
        raise HTTPException(status_code=404, detail="Not Found")

    if frontend_dist.exists():
        file_path = frontend_dist / full_path
        if full_path and file_path.is_file():
            return FileResponse(file_path)
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)

    return HTMLResponse(
        """<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <title>AI Insight — Enterprise Analytics Platform</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
                .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; border: 1px solid #334155; max-width: 520px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
                h1 { color: #38bdf8; margin-bottom: 0.5rem; font-size: 1.75rem; }
                p { color: #94a3b8; line-height: 1.6; font-size: 0.95rem; }
                code { background: #0f172a; color: #38bdf8; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-size: 0.85rem; }
                a { color: #38bdf8; text-decoration: none; font-weight: 600; }
                .btn { display: inline-block; margin-top: 1rem; padding: 0.6rem 1.2rem; background: #3b82f6; color: #fff; border-radius: 0.5rem; font-weight: 500; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>AI Insight Platform</h1>
                <p>Backend API and intelligence engines are active.</p>
                <p>To run live hot-reload development UI:</p>
                <p><code>cd frontend && npm run dev</code></p>
                <a class="btn" href="http://localhost:5173" target="_blank">Open Live Frontend (Port 5173)</a>
            </div>
        </body>
        </html>"""
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"\nAI Insight running on http://127.0.0.1:{port}\n")
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=port, reload=True)
