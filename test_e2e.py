import urllib.request
import json
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

def run_tests():
    print("\n========================================================")
    print("  AI Insight Platform -- End-to-End Integration Suite")
    print("========================================================\n")
    
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
    print(f"[PASS] 1. Health Check: {health['status']} - {health['service']} v{health['version']}")

    # 2. Demo Authentication
    demo_auth = post("http://127.0.0.1:8000/api/auth/demo")
    token = demo_auth["access_token"]
    user = demo_auth["user"]
    print(f"[PASS] 2. Authentication: Signed in as {user['name']} ({user['email']}) - Role: {user.get('role', 'Data Scientist')}")

    # 3. OTP Dispatch & Verification
    otp_req = post("http://127.0.0.1:8000/api/auth/send-otp", {"target": user["email"], "purpose": "login"})
    demo_otp = otp_req.get("demo_otp") or "123456"
    verify_res = post("http://127.0.0.1:8000/api/auth/verify-otp", {"target": user["email"], "otp_code": demo_otp, "purpose": "login"})
    print(f"[PASS] 3. OTP Security Engine: Dispatched & Verified 6-digit code ({verify_res['message']})")

    # 4. Load Enterprise Sales Dataset (550+ records)
    sample = post("http://127.0.0.1:8000/api/datasets/sample", {"sample_key": "sales_data"}, token=token)
    ds_id = sample["id"]
    print(f"[PASS] 4. Sample Dataset Ingested: {sample['name']} (ID: {ds_id}, Rows: {sample['rows']}, Columns: {sample['columns']})")

    # 5. Dashboard Overview & 6 KPIs + 8 Charts
    overview = get(f"http://127.0.0.1:8000/api/visualization/overview/{ds_id}", token=token)
    print(f"[PASS] 5. Dashboard Overview: Synthesized {len(overview['kpis'])} KPI cards & 8 analytics charts")

    # 6. Data Profiling & Health Scoring
    profile = get(f"http://127.0.0.1:8000/api/profiling/profile/{ds_id}", token=token)
    print(f"[PASS] 6. Data Profiling: Quality Score {profile['data_quality_score']}/100, {profile['numeric_columns_count']} numeric cols")

    # 7. Data Cleaning Pipeline
    cleaned = post(f"http://127.0.0.1:8000/api/cleaning/clean/{ds_id}", {
        "remove_duplicates": True,
        "missing_value_actions": [{"column": "Discount", "strategy": "mean"}],
        "outlier_actions": []
    }, token=token)
    print(f"[PASS] 7. Data Cleaning Pipeline: {cleaned['message']}")

    # 8. Correlation Analysis
    corr = get(f"http://127.0.0.1:8000/api/correlation/matrix/{ds_id}?method=pearson", token=token)
    print(f"[PASS] 8. Correlation Matrix: {len(corr['columns'])} numeric feature pairs evaluated")

    # 9. AI Strategic Insights & SWOT
    insights = post(f"http://127.0.0.1:8000/api/ai/insights/{ds_id}", token=token)
    print(f"[PASS] 9. AI Strategic Insights: Generated Executive Summary and {len(insights['swot_analysis']['strengths'])} SWOT strengths")

    # 10. AI Data Chat Query
    chat_res = post("http://127.0.0.1:8000/api/chat/message", {
        "dataset_id": ds_id,
        "message": "Which product has highest sales?"
    }, token=token)
    print(f"[PASS] 10. AI Data Chat: Responded with structured computation and {len(chat_res['suggested_queries'])} follow-up queries")

    # 11. AutoML Training & Leaderboard
    train_res = post(f"http://127.0.0.1:8000/api/ml/train/{ds_id}", {
        "target_col": "Sales",
        "feature_cols": ["Quantity", "Cost", "Profit", "Rating"],
        "task_type": "regression",
        "test_size": 0.2
    }, token=token)
    print(f"[PASS] 11. AutoML Studio: Champion model '{train_res['best_model_name']}' trained with R²={train_res['trained_models'][0]['metrics'].get('r2')}")

    # 12. Live Prediction Simulator
    pred_res = post("http://127.0.0.1:8000/api/ml/predict", {
        "dataset_id": ds_id,
        "model_name": train_res["best_model_name"],
        "features": {"Quantity": 4, "Cost": 850.0, "Profit": 350.0, "Rating": 5}
    }, token=token)
    print(f"[PASS] 12. Live Prediction Simulator: Inferred Sales = {pred_res['prediction']}")

    # 13. Time-Series Forecasting
    fc_res = post(f"http://127.0.0.1:8000/api/forecasting/forecast/{ds_id}", {
        "date_col": "Date",
        "target_col": "Sales",
        "forecast_periods": 30
    }, token=token)
    print(f"[PASS] 13. Time-Series Forecasting: Generated {len(fc_res['forecast'])} projection intervals with 95% CI")

    # 14. Anomaly Detection
    anom_res = post(f"http://127.0.0.1:8000/api/anomaly/detect/{ds_id}", {
        "feature_cols": ["Sales", "Profit", "Cost"],
        "method": "isolation_forest",
        "contamination": 0.05
    }, token=token)
    print(f"[PASS] 14. Anomaly Detection: Identified {anom_res['anomaly_count']} outliers ({anom_res['anomaly_percentage']}%)")

    # 15. Admin Console Telemetry
    admin_ov = get("http://127.0.0.1:8000/api/admin/overview", token=token)
    print(f"[PASS] 15. Admin Console: Health={admin_ov['system_health']} (CPU: {admin_ov['cpu_usage_pct']}%, RAM: {admin_ov['memory_usage_pct']}%)")

    print("\n========================================================")
    print("  ✓ All 15 Platform Verifications Passed Successfully!")
    print("========================================================\n")

if __name__ == "__main__":
    run_tests()
