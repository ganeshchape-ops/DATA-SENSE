# AI Insight — AI-Native Enterprise Intelligence & Predictive Analytics Platform

**AI Insight** is an enterprise-grade, production-quality, full-stack AI, Machine Learning, and Predictive Business Intelligence platform. It empowers business analysts, data scientists, and executives to upload tabular datasets (or explore 5 built-in enterprise sample datasets) and automatically execute data profiling, automated data cleaning, exploratory data analysis, statistical hypothesis testing, correlation heatmaps, AutoML model training, time-series forecasting, anomaly detection, AI strategic SWOT analysis, and conversational natural language queries via ChatGPT-style AI Data Chat.

---

## 🌟 Key Platform Capabilities

1. **Animated Neural Splash Screen**:
   - Particle network animations, 4-stage loading sequence, and instant transition to authentication.

2. **Enterprise Authentication & Secure OTP Verification**:
   - JWT token security with bcrypt hashing.
   - 6-digit OTP phone/email verification with 5-minute expiration, 45s countdown timer, and SMS provider abstraction (Twilio / MSG91 / Firebase / Local Dev banner).
   - Multi-step Forgot Password recovery workflow.
   - 1-Click Instant Demo Login for immediate exploration.

3. **SaaS Executive Dashboard (Inspired by Reference Layout)**:
   - Clean white / light theme with subtle shadows and rounded cards.
   - Global Search (`Ctrl + K`) Command Palette.
   - Notification Center Drawer with unread badges.
   - **6 Animated KPI Cards**: Total Revenue (₹25.6L), Total Sales (₹18.4L), Total Profit (₹7.8L), Customers (4,520), Growth (+14.5%), Prediction Accuracy (92.4%).
   - **8 Responsive Analytics Charts**:
     1. *Sales Trend*: Line chart with order volume indicators.
     2. *Revenue Analysis*: Bar chart comparing revenue vs. operational costs.
     3. *Profit Trend*: Area gradient chart showing net margin %.
     4. *Target vs Actual*: Grouped bar chart tracking quota achievement.
     5. *Customer Segments*: Donut chart (Enterprise, Mid-Market, SMB, Startup).
     6. *Product Performance*: Horizontal bar chart ranking leading product revenue.
     7. *Regional Performance*: Map & regional territory distribution.
     8. *Monthly Growth*: Compounded MoM growth trajectory.

4. **Data Upload & 550+ Record Demo Dataset**:
   - Drag-and-drop file upload for `.csv`, `.xlsx`, `.xls`, and `.json` up to 50MB.
   - Instant "Explore Demo Analytics" button loading `sales_data.csv` with 550+ multi-variable records.
   - 5 Built-in enterprise datasets (E-Commerce, Churn, Real Estate, Heart Disease, Web Traffic).

5. **Data Preview & Spreadsheet Explorer**:
   - Searchable, sortable, paginated tabular grid with multi-rule dynamic filter builder, column visibility toggles, and instant CSV export.

6. **Data Cleaning & Quality Pipeline**:
   - Automated Data Quality Score (0–100%).
   - Imputation strategies (Mean, Median, Mode, Forward Fill, Backward Fill, Constant, Drop).
   - Deduplication and IQR / Z-Score outlier treatment with Before/After comparison.

7. **Statistical Testing Suite**:
   - Two-sample T-test, One-Way ANOVA, Chi-Square test of independence, Shapiro-Wilk normality test with plain-English automated interpretations.
   - Pearson & Spearman correlation matrices with multicollinearity alerts.

8. **AutoML Studio & Live Prediction Simulator**:
   - Automated problem classification (Regression vs. Classification).
   - Multi-algorithm leaderboards (Linear/Logistic Regression, Decision Trees, Random Forest, Gradient Boosting).
   - Interactive inference simulator with dynamic real-time sliders and downloadable predictions.

9. **Time-Series Forecasting & Anomaly Detection**:
   - 7-day to 12-month trend forecasting with 95% confidence intervals.
   - Isolation Forest and Z-Score outlier detection with 2D PCA scatter plots.

10. **Conversational AI Data Chat**:
    - ChatGPT-style interactive conversational interface grounded directly on dataset metrics with starter suggestions and conversation export.

11. **Executive Reporting & Admin Console**:
    - Multi-page ReportLab PDF reports and multi-sheet OpenPyXL workbooks.
    - Role-based Admin Console with user status management and system telemetry.

---

## 🚀 How to Run the Application

### Option 1: Unified Single-Command Runner (Recommended)

1. Open PowerShell / Command Prompt in `d:\aa`:
   ```powershell
   python app.py
   ```
2. The server will start and automatically open your default browser to:
   ```
   http://127.0.0.1:8000
   ```
3. Interactive API documentation is available at:
   - **Swagger UI**: `http://127.0.0.1:8000/docs`
   - **ReDoc**: `http://127.0.0.1:8000/redoc`

---

### Option 2: Full-Stack Development Mode (Live Hot Reload)

#### Backend:
```powershell
python app.py
```

#### Frontend:
```powershell
cd frontend
npm run dev
```
Navigate to `http://localhost:5173`.

---

## 🧪 End-to-End Verification

Run the automated 15-stage integration test suite:
```powershell
python test_e2e.py
```

---

## 🛠 Tech Stack

- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLAlchemy, SQLite, Pydantic v2.
- **Analytics & ML**: Pandas, NumPy, Scikit-Learn, SciPy.
- **Reporting**: ReportLab (PDF), OpenPyXL (Excel).
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts.
