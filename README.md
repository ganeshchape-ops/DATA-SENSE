# AI DataSense — AI-Powered Data Analytics & Prediction Platform

**AI DataSense** is an industry-grade, full-stack AI, Machine Learning, and Data Analytics platform. It enables business analysts, data scientists, and students to upload any CSV or Excel dataset (or choose from 5 built-in enterprise sample datasets) and automatically execute data profiling, automated data cleaning, exploratory data analysis, hypothesis testing, correlation analysis, AI-generated strategic insights, automated machine learning (AutoML), time-series forecasting, anomaly detection, and downloadable executive reports.

---

## Key Features

1. **User Authentication & Guest Demo Mode**:
   - Secure JWT token-based authentication with bcrypt hashing.
   - One-click instant **Demo Login** for quick demonstration without manual registration.

2. **Dataset Management & Preloaded Datasets**:
   - Drag-and-drop file upload supporting `.csv`, `.xlsx`, and `.xls` up to 50MB.
   - **5 Realistic Preloaded Datasets**:
     - *E-Commerce Sales & Margin* (500 orders, multivariable sales, discounts, customer ratings, margins)
     - *Customer Churn & Retention* (450 subscribers, tenure, contract types, churn status)
     - *Real Estate Valuation* (400 properties, square footage, bedrooms, bathrooms, price)
     - *Heart Disease Clinical Risk* (350 patients, resting BP, cholesterol, heart disease target)
     - *Web Traffic & Daily Revenue* (180 days, daily visitors, bounce rate, ad clicks, revenue)

3. **Automated Data Profiling**:
   - Computes statistical moments: Mean, Median, Std, IQR, Skewness, Kurtosis, Min/Max quartiles.
   - Categorical frequency distribution and cardinalities.
   - Missing value heatmaps and duplicate row detection.
   - Automated **Data Health Score (0-100%)**.

4. **Interactive Data Cleaning Pipeline**:
   - Configurable missing value imputation (Mean, Median, Mode, Forward Fill, Backward Fill, Drop Rows, Constant).
   - Duplicate removal and outlier treatment (IQR Capping or Z-Score filtering).
   - Generates and persists a clean version of the dataset.

5. **Data Explorer & Dynamic Filter Engine**:
   - Paginated tabular browser with multi-column sorting.
   - Complex filter builder (`equals`, `contains`, `greater_than`, `less_than`, `between`, `is_null`).
   - Instant CSV export of filtered queries.

6. **Automated Visualization Studio**:
   - AI-recommended chart generator tailored to detected column data types.
   - Custom chart builder supporting **Bar, Line, Area, Pie, and Scatter charts**.

7. **Statistical Testing & Hypothesis Suite**:
   - Two-Sample T-Test, One-Way ANOVA, Chi-Square Test of Independence, and Shapiro-Wilk Normality test.
   - Automatic plain-English interpretations and p-value significance indicators (alpha = 0.05).

8. **Correlation Analysis & Heatmap**:
   - Pearson & Spearman correlation coefficient matrix.
   - Automated identification of top positive/negative pairs and multicollinearity warnings.

9. **AI Strategic Insights Engine**:
   - Dual-engine architecture: Built-in statistical heuristic engine + pluggable external LLM support (OpenAI / Gemini / Anthropic).
   - Generates Executive Summary, Data Health Evaluation, Key Trends, Risk & Anomaly Alerts, and a full **SWOT Analysis**.

10. **AutoML Studio & Live Prediction Simulator**:
    - Automatic problem type detection (Regression vs. Classification).
    - Multi-algorithm training & leaderboard (Linear/Logistic Regression, Decision Trees, Random Forest, Gradient Boosting).
    - K-Means Clustering with Elbow Method (k = 2 to 8) and 2D PCA visualization.
    - **Real-Time Live Simulator**: Interactive slider/input interface for live model inference.

11. **Time-Series Forecasting**:
    - Chronological trend & seasonal decomposition with 7 to 90-day projections.
    - 95% confidence intervals (upper/lower bounds) with historical vs. forecast charts.

12. **Anomaly Detection**:
    - Isolation Forest and Z-Score outlier detection with 2D PCA projection scatter plots.

13. **Downloadable Multi-Format Reports**:
    - **Multi-page Executive PDF Report** generated via ReportLab with tables, key metrics, and summaries.
    - **Multi-sheet Excel Workbook** generated via OpenPyXL with raw data, profiling, and ML leaderboards.

---

## How to Run the Application

### Option 1: Direct Single-Command Execution (Recommended)

1. Open your terminal (PowerShell or Command Prompt) in the project folder `d:\aa`:
   ```powershell
   python app.py
   ```
2. The server will start and automatically open your default browser (Google Chrome) to:
   ```
   http://127.0.0.1:8000
   ```
3. Interactive API documentation is available at:
   - **Swagger UI**: `http://127.0.0.1:8000/docs`
   - **ReDoc**: `http://127.0.0.1:8000/redoc`

---

### Option 2: Full-Stack Development Mode (Live Hot Reload)

If you wish to develop frontend and backend with hot module replacement:

#### 1. Start Backend:
```powershell
# In root directory d:\aa
python app.py
```

#### 2. Start Frontend (in a separate terminal):
```powershell
cd d:\aa\frontend
npm run dev
```
Navigate to `http://localhost:5173` in Google Chrome.

---

## Tech Stack

- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLAlchemy, SQLite, Pydantic v2.
- **Data Science & ML**: Pandas, NumPy, Scikit-Learn, SciPy.
- **Reporting**: ReportLab (PDF), OpenPyXL (Excel).
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts.

---

## Verification & Testing

Run the automated end-to-end integration test suite:
```powershell
python test_e2e.py
```
This tests all 12 platform services end-to-end and outputs verification logs.
