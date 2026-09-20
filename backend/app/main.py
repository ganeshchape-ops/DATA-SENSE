```python
import sys
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[3]

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import HTTPException, RequestValidationError

from backend.app.core.config import settings

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


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Native Enterprise Intelligence & Predictive Analytics Platform",
    docs_url="/docs",
    redoc_url="/redoc"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "success": False
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
            "success": False
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": f"An error occurred: {str(exc)}",
            "success": False
        }
    )


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


@app.get("/")
def home():
    return {
        "status": "success",
        "message": "DATA-SENSE API is running",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "platform": settings.PROJECT_FULL_NAME,
        "version": settings.VERSION,
        "engine": "FastAPI + Scikit-Learn + Pandas + SciPy"
    }


frontend_dist = ROOT_DIR / "frontend" / "dist"

if frontend_dist.exists():

    assets_dir = frontend_dist / "assets"

    if assets_dir.exists():
        app.mount(
            "/assets",
            StaticFiles(directory=str(assets_dir)),
            name="assets"
        )


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):

    if (
        full_path.startswith("api/")
        or full_path == "api"
        or full_path.startswith("docs")
        or full_path.startswith("redoc")
        or full_path == "openapi.json"
    ):
        raise HTTPException(
            status_code=404,
            detail="Not Found"
        )

    if frontend_dist.exists():

        file_path = frontend_dist / full_path

        if full_path and file_path.is_file():
            return FileResponse(file_path)

        index_file = frontend_dist / "index.html"

        if index_file.exists():
            return FileResponse(index_file)

    return HTMLResponse(
        """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DATA-SENSE</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #0f172a;
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                }

                .card {
                    background: #1e293b;
                    padding: 40px;
                    border-radius: 20px;
                    text-align: center;
                    max-width: 600px;
                }

                h1 {
                    color: #38bdf8;
                }

                p {
                    color: #cbd5e1;
                }

                a {
                    color: #38bdf8;
                    text-decoration: none;
                }
            </style>
        </head>

        <body>
            <div class="card">
                <h1>DATA-SENSE</h1>

                <p>
                    AI-Native Enterprise Intelligence
                    & Predictive Analytics Platform
                </p>

                <p>
                    Backend API is running successfully.
                </p>

                <p>
                    <a href="/docs">
                        Open API Documentation
                    </a>
                </p>
            </div>
        </body>
        </html>
        """
    )


if __name__ == "__main__":

    import uvicorn

    port = int(os.getenv("PORT", "8000"))

    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
```
