import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[3]

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse


app = FastAPI(
    title="DATA-SENSE",
    version="2.0.0",
    description="AI-Native Enterprise Intelligence & Predictive Analytics Platform",
    docs_url="/docs",
    redoc_url="/redoc"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "detail": str(exc)
        }
    )


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
        "service": "DATA-SENSE",
        "platform": "AI-Native Enterprise Intelligence & Predictive Analytics Platform",
        "version": "2.0.0",
        "engine": "FastAPI"
    }


@app.get("/test")
def test():
    return {
        "status": "success",
        "message": "Vercel deployment is working"
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port
    )
from backend.app.api.auth import router as auth_router

app = FastAPI(
    title="DATA-SENSE",
    version="2.0.0",
    description="AI-Native Enterprise Intelligence & Predictive Analytics Platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(
    auth_router,
    prefix="/api"
)


