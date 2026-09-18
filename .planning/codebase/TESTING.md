# Testing & Quality Assurance

## Automated Test Suites
- **End-to-End Platform Integration Test**: `test_e2e.py`
  - Validates all 12 core platform services end-to-end against live synthetic data:
    1. Sample dataset creation & seeding
    2. Data profiling & health scoring
    3. Cleaning pipeline & missing value imputation
    4. Data explorer & complex filtering
    5. Visualization engine configuration
    6. Statistical hypothesis testing suite (T-test, ANOVA, Chi-Square, Shapiro-Wilk)
    7. Pearson & Spearman correlation matrices
    8. AI Strategic Insights generation (Executive summary, SWOT analysis)
    9. AutoML studio (Classification & Regression model training, leaderboard generation, inference simulation)
    10. Time-series forecasting (7-90 day horizon with 95% confidence intervals)
    11. Anomaly detection (Isolation forest & PCA projection)
    12. Executive PDF report and Excel workbook generation

## Running Tests
To run the automated end-to-end integration tests:
```powershell
python test_e2e.py
```

## Frontend Linting & Type Checking
- Run typecheck and bundle test:
  ```powershell
  cd frontend
  npm run build
  ```
- Run linter:
  ```powershell
  cd frontend
  npm run lint
  ```
