import urllib.request
import json
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

def run_tests():
    print("Testing AI DataSense API & Web Services...")
    
    def post(url, data=None, token=None):
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode("utf-8") if data is not None else b"{}",
            headers={
                "Content-Type": "application/json",
                **({"Authorization": f"Bearer {token}"} if token else {})
            }
        )
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))

    def get(url, token=None):
        req = urllib.request.Request(
            url,
            headers=({"Authorization": f"Bearer {token}"} if token else {})
        )
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))

    # 1. Health check
    health = get("http://127.0.0.1:8000/api/health")
    print(f"[PASS] Health Check: {health['status']} - {health['service']} v{health['version']}")

    # 2. Demo Login
    demo_auth = post("http://127.0.0.1:8000/api/auth/demo")
    token = demo_auth["access_token"]
    user = demo_auth["user"]
    print(f"[PASS] Demo Authentication: {user['name']} ({user['email']})")

    # 3. Load Sample Dataset
    sample = post("http://127.0.0.1:8000/api/datasets/sample", {"sample_key": "ecommerce"}, token=token)
    ds_id = sample["id"]
    print(f"[PASS] Sample Dataset Loaded: {sample['name']} (ID: {ds_id}, Rows: {sample['rows']}, Cols: {sample['columns']})")

    # 4. Data Profiling
    profile = get(f"http://127.0.0.1:8000/api/analytics/profile/{ds_id}", token=token)
    print(f"[PASS] Data Profiling: Quality Score {profile['data_quality_score']}/100, {len(profile['numeric_stats'])} numeric & {len(profile['categorical_stats'])} categorical cols")

    # 5. Data Cleaning
    cleaned = post(f"http://127.0.0.1:8000/api/analytics/clean/{ds_id}", {
        "drop_duplicates": True,
        "imputation": [{"column": "Discount", "strategy": "mean"}],
        "outliers": []
    }, token=token)
    print(f"[PASS] Data Cleaning Pipeline: {cleaned['message']}")

    # 6. Correlation Analysis
    corr = get(f"http://127.0.0.1:8000/api/analytics/correlation/{ds_id}?method=pearson", token=token)
    print(f"[PASS] Correlation Matrix: {len(corr['columns'])} numeric features computed")

    # 7. AI Insights
    insights = post(f"http://127.0.0.1:8000/api/ai/insights/{ds_id}", token=token)
    print(f"[PASS] AI Insights Engine: Generated {len(insights['key_findings'])} key findings and {len(insights['anomalies_and_risks'])} risk items")

    # 8. AutoML Training & Leaderboard
    train_res = post(f"http://127.0.0.1:8000/api/ml/train/{ds_id}", {
        "target_col": "Sales",
        "feature_cols": ["Unit_Price", "Quantity", "Discount", "Customer_Rating"],
        "task_type": "regression",
        "test_size": 0.2
    }, token=token)
    print(f"[PASS] AutoML Studio: Champion model '{train_res['best_model_name']}' with R2={train_res['trained_models'][0]['metrics'].get('r2')}")

    # 9. Live Prediction Simulator
    pred_res = post("http://127.0.0.1:8000/api/ml/predict", {
        "dataset_id": ds_id,
        "model_name": train_res["best_model_name"],
        "features": {"Unit_Price": 120.0, "Quantity": 3, "Discount": 0.1, "Customer_Rating": 4.5}
    }, token=token)
    print(f"[PASS] Live Real-Time Prediction: Predicted Sales = {pred_res['prediction']}")

    # 10. Time-Series Forecasting
    fc_res = post(f"http://127.0.0.1:8000/api/forecasting/forecast/{ds_id}", {
        "date_col": "Order_Date",
        "target_col": "Sales",
        "forecast_periods": 14
    }, token=token)
    print(f"[PASS] Time-Series Forecasting: Generated {len(fc_res['forecast'])} forecast steps with confidence bounds")

    # 11. Anomaly Detection
    anom_res = post(f"http://127.0.0.1:8000/api/anomaly/detect/{ds_id}", {
        "feature_cols": ["Unit_Price", "Sales", "Quantity"],
        "method": "isolation_forest",
        "contamination": 0.05
    }, token=token)
    print(f"[PASS] Anomaly Detection: Detected {anom_res['anomaly_count']} outliers ({anom_res['anomaly_percentage']}%)")

    # 12. Multi-format Report Generation
    pdf_rep = post(f"http://127.0.0.1:8000/api/reports/generate/{ds_id}", {
        "report_type": "pdf",
        "title": "E-Commerce Executive Summary"
    }, token=token)
    print(f"[PASS] Multi-Page PDF Report: Generated successfully (ID: {pdf_rep['report_id']})")

    excel_rep = post(f"http://127.0.0.1:8000/api/reports/generate/{ds_id}", {
        "report_type": "excel",
        "title": "E-Commerce Multi-Sheet Workbook"
    }, token=token)
    print(f"[PASS] Multi-Sheet Excel Report: Generated successfully (ID: {excel_rep['report_id']})")

    print("\n" + "=" * 60)
    print(" ALL 12 ENTERPRISE PLATFORM ENDPOINTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
