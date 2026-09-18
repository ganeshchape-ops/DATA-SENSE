# Code Conventions & Style Guidelines

## Backend (Python / FastAPI)
- **Typing**: Use standard Python type annotations across functions and Pydantic schemas.
- **Service-Oriented Architecture**: Keep endpoint route handlers in `backend/app/api/` concise; encapsulate all Pandas/Scikit-Learn/SciPy logic inside dedicated classes/modules in `backend/app/services/`.
- **Error Handling**: Use standard FastAPI `HTTPException` with meaningful status codes (400 for bad parameters, 404 for missing datasets, 401 for unauthorized).
- **Data Serialization**: Return clean dictionary payloads or Pydantic models with JSON-safe primitives (converting NaN/inf values to null/safe representations before returning).
- **Security**: Hash all passwords using bcrypt via Passlib; protect sensitive endpoints with `get_current_user` dependency from `deps.py`.

## Frontend (React 19 / TypeScript)
- **Functional Components**: Use standard React functional components with TypeScript interfaces for props.
- **Styling**: Tailwind CSS utility classes with structured class grouping; use `lucide-react` for consistent iconography.
- **State Management**: React Context for global state (Authentication state, selected dataset ID), local `useState`/`useEffect` for view-specific data fetching.
- **API Interactions**: Centralized Axios instances with JWT bearer token interceptors in `frontend/src/services/`.
- **Responsiveness**: Mobile-first grid and flex layouts supporting both desktop widescreen and tablet views.
