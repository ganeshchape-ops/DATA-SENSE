# Technical Concerns & Future Considerations

## 1. Large Dataset In-Memory Scaling
- **Current State**: Datasets are loaded directly into Pandas DataFrames in memory during API requests.
- **Concern**: Very large files (>500MB) can cause high memory usage on single-server deployments.
- **Future Consideration**: Introduce chunked streaming, DuckDB or Polars for accelerated query execution on large files.

## 2. Asynchronous Long-Running ML Jobs
- **Current State**: Model training runs synchronously within FastAPI request handlers (fast for <10,000 rows).
- **Concern**: Extremely large training sets could trigger client HTTP timeout.
- **Future Consideration**: Introduce background tasks (FastAPI `BackgroundTasks` or Celery/Redis queue) with websocket progress notifications for multi-minute training runs.

## 3. Database Concurrency
- **Current State**: Default SQLite backend is used for zero-setup local execution.
- **Concern**: High concurrent write volume could encounter SQLite database locks in multi-user production environments.
- **Future Consideration**: Configure PostgreSQL support via SQLAlchemy URI in `backend/app/core/config.py` for enterprise deployments.
