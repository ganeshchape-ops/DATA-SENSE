# AI DataSense

## Overview
**AI DataSense** is an enterprise-grade AI-powered Data Analytics, Machine Learning, and Automated Decision Intelligence platform. It empowers data scientists, business intelligence teams, and analysts to upload structured tabular data (or select from realistic preloaded datasets) and perform comprehensive data profiling, automated data cleaning, statistical hypothesis testing, correlation discovery, automated machine learning (AutoML) with live simulation, time-series forecasting, anomaly detection, AI strategic insight generation, and downloadable executive PDF & Excel reports.

## Core Value Proposition
- **Zero-Friction Ingestion**: Immediate drag-and-drop CSV/Excel upload with 5 instant preloaded datasets (E-Commerce, Churn, Real Estate, Clinical Heart Disease, Web Traffic).
- **Automated Data Quality & Profiling**: Instant health scoring (0-100%), statistical moments, missing value maps, and duplicate detection.
- **Self-Service Cleaning Pipeline**: Missing value imputation, IQR/Z-score outlier filtering, and persistent cleaned versions.
- **Statistical Rigor**: T-tests, ANOVA, Chi-Square, and Shapiro-Wilk with automated plain-English hypothesis interpretations.
- **AutoML & Interactive Simulation**: Automated problem classification, multi-model leaderboards, K-Means clustering, and real-time inference sliders.
- **AI Executive Insights**: Automatic SWOT analysis, trend extraction, risk detection, and LLM pluggability.
- **Executive Reporting**: One-click downloadable multi-page PDF reports (ReportLab) and multi-sheet Excel workbooks (OpenPyXL).

## Technology Stack
- **Backend**: FastAPI, Python 3.10+, Uvicorn, SQLAlchemy, SQLite, Pydantic v2
- **Analytics & ML**: Pandas, NumPy, Scikit-Learn, SciPy
- **Reporting**: ReportLab (PDF), OpenPyXL (Excel)
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts
- **Testing**: Python end-to-end integration suite (`test_e2e.py`)
