# Integrations & External Services

## Pluggable LLM Providers (AI Strategic Insights)
- **Architecture**: Dual-engine design located in `backend/app/services/ai_service.py`
- **Engine 1 - Built-in Heuristic Engine**: Zero-external-dependency statistical inference engine generating executive summaries, health diagnostics, SWOT analysis, and actionable business strategies based on statistical profiles.
- **Engine 2 - External LLM APIs**: Configurable support for:
  - OpenAI API (`OPENAI_API_KEY`)
  - Google Gemini API (`GEMINI_API_KEY`)
  - Anthropic Claude API (`ANTHROPIC_API_KEY`)
- Graceful fallback to built-in heuristic engine if API keys are missing or requests time out.

## Storage & Filesystem Integrations
- Local upload storage: `backend/uploads/` (stores uploaded CSV/XLSX and cleaned dataset versions)
- Generated report storage: `backend/reports/` (stores dynamically generated ReportLab PDF reports and OpenPyXL Excel workbooks)
- SQLite database: `backend/datasense.db` storing users, datasets metadata, and activity logs.

## Static Assets & Client-Server Bridge
- FastAPI dynamically serves the React SPA build from `frontend/dist` when present.
- Single command `python app.py` starts the backend and handles static SPA routing fallback.
