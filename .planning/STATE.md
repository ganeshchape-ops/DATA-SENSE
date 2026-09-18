# Project State & Memory

## Current Status
- **Milestone**: Milestone 1 (Complete) / Ready for Milestone 2 Planning
- **Phase Status**: All foundational phases (1-5) implemented and verified
- **Architecture Stability**: High. All 12 platform modules operational.
- **Verification Status**: Complete integration test suite passed (`test_e2e.py`).

## Key Decisions & Conventions
- **Single-command UX**: `python app.py` serves both backend API and frontend SPA bundle with automatic browser launch.
- **Dual-engine AI insights**: Statistical heuristic engine ensures high performance and instant insights without mandatory external API keys; pluggable LLM support is opt-in.
- **Client-Side Visualizations**: Built with Recharts and Tailwind CSS v4 in React 19.
- **Safe Serialization**: All backend services ensure NumPy/Pandas NaN and infinity values are sanitized before JSON transmission.
