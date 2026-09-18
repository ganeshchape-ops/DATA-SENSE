# System Architecture

## Architecture Overview
AI DataSense follows a layered, modular full-stack client-server architecture:

```mermaid
graph TD
    User([User Browser]) <--> Frontend[React 19 + TypeScript + Tailwind CSS]
    Frontend <--> |REST API / JWT| BackendAPI[FastAPI Gateway]
    
    subgraph Backend Core
        BackendAPI --> AuthMod[Auth & JWT Security]
        BackendAPI --> DatasetsMod[Dataset Manager & Preloaded Sets]
        BackendAPI --> ProfilingMod[Profiling & Health Engine]
        BackendAPI --> CleaningMod[Cleaning & Imputation Engine]
        BackendAPI --> ExplorerMod[Explorer & Filter Engine]
        BackendAPI --> VisMod[Visualization & Chart Generator]
        BackendAPI --> StatsMod[Hypothesis & Statistical Suite]
        BackendAPI --> CorrMod[Correlation Engine]
        BackendAPI --> MLMod[AutoML & Prediction Simulator]
        BackendAPI --> ForecastMod[Time-Series Forecast Engine]
        BackendAPI --> AnomalyMod[Anomaly Detection Engine]
        BackendAPI --> AIMod[AI Strategic Insights Engine]
        BackendAPI --> ReportMod[PDF / Excel Report Engine]
    end
    
    subgraph Data & Storage Layer
        BackendAPI <--> SQLite[(SQLite Database: datasense.db)]
        DatasetsMod <--> FileStore[Disk Storage: uploads/ & reports/]
        AIMod -.-> ExternalLLM[External LLM: OpenAI / Gemini / Claude]
    end
```

## Backend Modular Design
- **`backend/app/api/`**: Router definitions encapsulating endpoints per domain module (`auth`, `datasets`, `profiling`, `cleaning`, `explorer`, `visualization`, `statistics`, `correlation`, `ai_insights`, `ml`, `forecasting`, `anomaly`, `reports`).
- **`backend/app/services/`**: Pure business logic and computational data science services, keeping routers thin and decoupled.
- **`backend/app/models/`**: SQLAlchemy declarative models for persistence (`User`, `Dataset`, etc.).
- **`backend/app/schemas/`**: Pydantic v2 schemas defining input validation and response contracts.
- **`backend/app/core/`**: Central application configurations, JWT security tokens, database connection pool, and file paths.

## Frontend Modular Design
- **`frontend/src/pages/`**: 18 specialized views corresponding to each platform feature (Dashboard, Upload, Profiler, Cleaning, Explorer, Visualization, Statistics, Correlation, AI Insights, ML Studio, Forecasting, Anomaly, Reports, History, Settings, Auth).
- **`frontend/src/components/`**: Reusable UI components (Navbar, Sidebar, Metric Cards, Chart Containers, Modals).
- **`frontend/src/context/`**: Global application state (Auth context, Active Dataset selection, Theme).
- **`frontend/src/services/`**: Axios API client bindings and endpoint interfaces.
