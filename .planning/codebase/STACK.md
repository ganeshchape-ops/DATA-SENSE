# Tech Stack & Dependencies

## Core Backend
- **Language**: Python 3.10+
- **Framework**: FastAPI (>=0.110.0) with Uvicorn (>=0.28.0)
- **Data Validation & Settings**: Pydantic v2 (>=2.6.0), pydantic-settings (>=2.2.0)
- **Database & ORM**: SQLAlchemy 2.0+ with SQLite backend (`backend/datasense.db`)
- **Authentication**: JWT (`python-jose[cryptography]`), Passlib (`bcrypt`), password hashing
- **File Parsing & I/O**: `python-multipart`, `openpyxl` (>=3.1.2) for Excel parsing

## Data Science, ML & Analytics
- **Data Manipulation**: Pandas (>=2.2.0), NumPy (>=1.26.0)
- **Machine Learning**: Scikit-Learn (>=1.4.0) (Linear/Logistic Regression, Decision Trees, Random Forest, Gradient Boosting, KMeans, PCA, Isolation Forest)
- **Statistical Computing**: SciPy (>=1.12.0) (T-Tests, ANOVA, Chi-Square, Shapiro-Wilk, skew/kurtosis)
- **Reporting & Visualization**: ReportLab (>=4.1.0) for multi-page PDF generation, OpenPyXL for multi-sheet workbooks, Matplotlib (>=3.8.3), Seaborn (>=0.13.2)

## Core Frontend
- **Framework**: React 19 (`19.2.8`) with TypeScript (`~6.0.2`)
- **Bundler & Build**: Vite (`^8.3.0`) with `@vitejs/plugin-react` (`^6.1.1`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` + `tailwindcss` `^4.3.3`), `clsx`, `tailwind-merge`
- **Icons**: Lucide React (`^1.45.0`)
- **Routing**: React Router DOM (`^7.18.3`)
- **Charts & Visualization**: Recharts (`^3.10.1`)
- **HTTP Client**: Axios (`^1.20.0`)
- **Linter**: Oxlint (`^1.81.0`)

## Execution & Serving Runtime
- Single unified entrypoint: `python app.py` (spawns FastAPI backend, serves built frontend static assets from `frontend/dist`, and auto-opens default browser).
- Dev mode: Frontend via `npm run dev` on port 5173, backend via `python app.py` on port 8000.
