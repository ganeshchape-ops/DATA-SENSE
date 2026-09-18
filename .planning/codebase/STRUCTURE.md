# Directory Structure & File Map

```
d:/aa/
├── app.py                          # Unified launcher & browser auto-opener
├── requirements.txt                # Python backend dependencies
├── test_e2e.py                     # Comprehensive end-to-end integration test
├── README.md                       # Platform documentation and guide
├── .gitignore                      # Git ignore patterns
│
├── backend/                        # Backend FastAPI Application
│   ├── app/
│   │   ├── main.py                 # FastAPI application setup, middleware, and router mounts
│   │   ├── api/                    # REST API Endpoints
│   │   │   ├── auth.py             # Login, register, demo user authentication
│   │   │   ├── datasets.py         # Upload, list, delete, sample datasets loading
│   │   │   ├── profiling.py        # Statistical moments, types, missing heatmaps, health score
│   │   │   ├── cleaning.py         # Imputation, deduplication, outlier handling
│   │   │   ├── explorer.py         # Querying, filtering, pagination, CSV exports
│   │   │   ├── visualization.py    # Auto-chart recommendations & custom charts
│   │   │   ├── statistics.py       # T-tests, ANOVA, Chi-Square, Shapiro-Wilk
│   │   │   ├── correlation.py      # Pearson/Spearman matrix, multicollinearity alerts
│   │   │   ├── ai_insights.py      # AI strategic summaries, SWOT, recommendations
│   │   │   ├── ml.py               # AutoML training, leaderboard, live inference
│   │   │   ├── forecasting.py      # Time-series trend and seasonal forecasting
│   │   │   ├── anomaly.py          # Isolation Forest and Z-Score outlier detection
│   │   │   ├── reports.py          # PDF / Excel report generation & download
│   │   │   └── deps.py             # FastAPI dependency injections (DB, current user)
│   │   ├── core/                   # Core settings, database, security
│   │   │   ├── config.py           # App settings and environment variables
│   │   │   ├── database.py         # SQLAlchemy engine & session factory
│   │   │   └── security.py         # JWT tokens & bcrypt password hashing
│   │   ├── models/                 # SQLAlchemy ORM database models
│   │   ├── schemas/                # Pydantic validation schemas
│   │   └── services/               # Data science & business logic services
│   │       ├── ai_service.py       # Heuristic & LLM insight engine
│   │       ├── anomaly_service.py  # Isolation Forest & PCA anomaly detection
│   │       ├── cleaning_service.py # Missing value imputation & IQR outlier handler
│   │       ├── dataset_service.py  # File ingest, dataframe storage, schema detection
│   │       ├── forecast_service.py # Trend decomposition & linear/seasonal projections
│   │       ├── ml_service.py       # Classification/Regression AutoML & KMeans
│   │       ├── profiling_service.py# Data profiling & health scoring algorithms
│   │       ├── report_service.py   # ReportLab PDF & OpenPyXL Excel generator
│   │       ├── sample_datasets.py  # 5 Built-in enterprise sample dataset generators
│   │       └── stats_service.py    # SciPy hypothesis testing & correlation matrices
│   ├── datasense.db                # SQLite database storage
│   ├── reports/                    # Generated PDF/Excel reports
│   └── uploads/                    # Uploaded raw and cleaned dataset files
│
└── frontend/                       # Frontend React + TypeScript SPA
    ├── index.html                  # HTML entry template
    ├── package.json                # NPM dependencies and scripts
    ├── tsconfig.json               # TypeScript configuration
    ├── vite.config.ts              # Vite configuration
    └── src/
        ├── App.tsx                 # Root router and layout structure
        ├── main.tsx                # React DOM render entry
        ├── index.css               # Global styles & Tailwind CSS imports
        ├── context/                # Context providers (Auth, Active Dataset)
        ├── components/             # Reusable UI components & layouts
        ├── pages/                  # Page views (Dashboard, ML, Profiler, etc.)
        ├── services/               # Axios API client & endpoints
        └── types/                  # TypeScript interface definitions
```
