# Requirements & Capabilities

## Functional Capabilities

### 1. Authentication & Session Management
- [x] JWT Token-based authentication with bcrypt hashing
- [x] One-click Instant Demo Guest Login
- [x] User registration and session persistence

### 2. Dataset Management
- [x] Drag-and-drop file upload for `.csv`, `.xlsx`, `.xls` (up to 50MB)
- [x] 5 Preloaded enterprise sample datasets
- [x] Dataset metadata tracking, column type inference, and deletion

### 3. Automated Profiling & Data Quality
- [x] Data Health Score computation (0-100%)
- [x] Statistical moments (Mean, Median, Std, IQR, Skewness, Kurtosis, Min/Max quartiles)
- [x] Cardinality, categorical frequency distribution, and missing value maps

### 4. Interactive Data Cleaning
- [x] Missing value imputation (Mean, Median, Mode, FFill, BFill, Constant, Drop)
- [x] Duplicate row removal
- [x] Outlier detection and treatment (IQR capping, Z-Score filtering)
- [x] Cleaned dataset persistence

### 5. Data Explorer & Querying
- [x] Paginated tabular grid with multi-column sorting
- [x] Dynamic filter builder (`equals`, `contains`, `greater_than`, `less_than`, `between`, `is_null`)
- [x] Instant CSV export of filtered queries

### 6. Automated Visualizations
- [x] Smart chart recommendations based on column types
- [x] Custom multi-chart builder (Bar, Line, Area, Pie, Scatter)

### 7. Statistical Testing & Hypothesis Suite
- [x] Two-Sample T-Test, One-Way ANOVA, Chi-Square Test of Independence, Shapiro-Wilk Normality test
- [x] Automated plain-English interpretations & p-value significance indicators

### 8. Correlation Analysis
- [x] Pearson & Spearman correlation coefficient matrices
- [x] Identification of top positive/negative pairs and multicollinearity warnings

### 9. AI Strategic Insights
- [x] Built-in statistical heuristic engine + pluggable external LLM (OpenAI / Gemini / Anthropic)
- [x] Executive Summary, Health Evaluation, Key Trends, Risk Alerts, and SWOT Analysis

### 10. AutoML Studio & Live Simulation
- [x] Problem type detection (Regression vs. Classification)
- [x] Model leaderboards (Linear/Logistic Regression, Decision Trees, Random Forest, Gradient Boosting)
- [x] K-Means Clustering with Elbow Method & 2D PCA visualization
- [x] Real-time interactive inference simulator

### 11. Time-Series Forecasting & Anomaly Detection
- [x] Time-series trend and seasonal decomposition with 7-90 day forecast and 95% confidence intervals
- [x] Isolation Forest & Z-Score anomaly detection with 2D PCA projection scatter plots

### 12. Executive Multi-Format Reports
- [x] Multi-page PDF report generation with ReportLab
- [x] Multi-sheet Excel workbook export with OpenPyXL
