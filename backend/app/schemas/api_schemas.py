from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# ----------------- AUTH & USER SCHEMAS -----------------
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    mobile_number: Optional[str] = Field(None, max_length=25)
    password: str = Field(..., min_length=6)
    company: Optional[str] = "Enterprise"
    role: Optional[str] = "Data Analyst"  # Student, Data Analyst, Business Analyst, Data Scientist, Manager, Admin

class UserLogin(BaseModel):
    email: Optional[str] = None  # Accepts email or mobile number
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    mobile_number: Optional[str] = None
    company: Optional[str] = "Enterprise"
    role: Optional[str] = "Data Analyst"
    avatar_url: Optional[str] = None
    is_verified: bool = True
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserUpdateProfile(BaseModel):
    name: Optional[str] = None
    mobile_number: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    avatar_url: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


# ----------------- OTP SCHEMAS -----------------
class SendOTPRequest(BaseModel):
    target: str  # mobile number or email
    purpose: str = "registration"  # registration, login, forgot_password

class VerifyOTPRequest(BaseModel):
    target: str
    otp_code: str = Field(..., min_length=6, max_length=6)
    purpose: str = "registration"

class OTPResponse(BaseModel):
    success: bool
    message: str
    target: str
    expires_in_seconds: int = 300
    demo_otp: Optional[str] = None  # Provided in dev/demo mode for zero-friction testing

class ForgotPasswordRequest(BaseModel):
    target: str  # email or mobile

class ResetPasswordWithOTPRequest(BaseModel):
    target: str
    otp_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6)


# ----------------- DATASET SCHEMAS -----------------
class DatasetSummary(BaseModel):
    id: int
    user_id: int
    name: str
    original_filename: str
    file_type: str
    file_size: int
    rows: int
    columns: int
    column_names: List[str]
    column_types: Dict[str, str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SampleDatasetRequest(BaseModel):
    sample_key: str  # sales_data, ecommerce, churn, housing, heart, traffic


# ----------------- PROFILING & HEALTH SCHEMAS -----------------
class NumericColumnStats(BaseModel):
    name: str
    dtype: str
    count: int
    missing: int
    missing_pct: float
    mean: Optional[float]
    std: Optional[float]
    variance: Optional[float]
    min: Optional[float]
    q25: Optional[float]
    median: Optional[float]
    q75: Optional[float]
    max: Optional[float]
    iqr: Optional[float]
    skewness: Optional[float]
    kurtosis: Optional[float]
    zeros_count: int
    negative_count: int

class CategoricalColumnStats(BaseModel):
    name: str
    dtype: str
    count: int
    missing: int
    missing_pct: float
    unique_count: int
    top_value: Optional[str]
    top_frequency: Optional[int]
    top_categories: List[Dict[str, Any]]

class DatasetProfileResponse(BaseModel):
    dataset_id: int
    dataset_name: str
    rows: int
    columns: int
    memory_usage_kb: float
    total_missing_cells: int
    missing_cells_pct: float
    duplicate_rows_count: int
    duplicate_rows_pct: float
    numeric_columns_count: int
    categorical_columns_count: int
    datetime_columns_count: int
    numeric_stats: List[NumericColumnStats]
    categorical_stats: List[CategoricalColumnStats]
    missing_per_column: Dict[str, int]
    column_types: Dict[str, str]
    data_quality_score: float  # 0 to 100


# ----------------- CLEANING SCHEMAS -----------------
class MissingValueStrategy(BaseModel):
    column: str
    strategy: str  # mean, median, mode, ffill, bfill, drop_rows, drop_column, constant
    constant_value: Optional[Any] = None

class OutlierStrategy(BaseModel):
    column: str
    method: str  # iqr, zscore
    threshold: float = 1.5  # 1.5 for IQR or 3.0 for zscore
    action: str = "remove"  # remove, cap

class CleanDatasetRequest(BaseModel):
    missing_value_actions: Optional[List[MissingValueStrategy]] = None
    remove_duplicates: bool = False
    duplicate_subset: Optional[List[str]] = None
    outlier_actions: Optional[List[OutlierStrategy]] = None
    new_dataset_name: Optional[str] = None
    preview_only: bool = False

class CleanDatasetResponse(BaseModel):
    original_rows: int
    original_columns: int
    cleaned_rows: int
    cleaned_columns: int
    removed_duplicates: int
    imputed_missing_cells: int
    treated_outliers: int
    new_dataset_id: Optional[int] = None
    preview_data: Optional[List[Dict[str, Any]]] = None
    message: str


# ----------------- EXPLORER SCHEMAS -----------------
class FilterCondition(BaseModel):
    column: str
    operator: str  # eq, neq, gt, gte, lt, lte, contains, startswith, in, is_null, not_null
    value: Any

class ExploreQueryRequest(BaseModel):
    page: int = 1
    page_size: int = 25
    search_query: Optional[str] = None
    sort_column: Optional[str] = None
    sort_direction: Optional[str] = "asc"  # asc, desc
    conditions: Optional[List[FilterCondition]] = None
    selected_columns: Optional[List[str]] = None

class ExploreQueryResponse(BaseModel):
    total_rows: int
    filtered_rows: int
    page: int
    page_size: int
    total_pages: int
    columns: List[str]
    column_types: Dict[str, str]
    data: List[Dict[str, Any]]


# ----------------- VISUALIZATION & KPI SCHEMAS -----------------
class ChartRequest(BaseModel):
    chart_type: str  # bar, line, area, pie, scatter, histogram, boxplot, heatmap
    x_axis: str
    y_axis: Optional[str] = None
    group_by: Optional[str] = None
    aggregation: Optional[str] = "sum"  # sum, avg, count, min, max, median
    limit: Optional[int] = 50

class RecommendedChart(BaseModel):
    chart_type: str
    x_axis: str
    y_axis: Optional[str]
    title: str
    reason: str
    score: float

class KPICard(BaseModel):
    key: str
    title: str
    value: str
    numeric_value: float
    prefix: str = ""
    suffix: str = ""
    change_pct: float
    change_type: str = "increase"  # increase, decrease, neutral
    trend_description: str
    icon: str

class DashboardOverviewResponse(BaseModel):
    kpis: List[KPICard]
    sales_trend: List[Dict[str, Any]]
    revenue_analysis: List[Dict[str, Any]]
    profit_trend: List[Dict[str, Any]]
    target_vs_actual: List[Dict[str, Any]]
    customer_distribution: List[Dict[str, Any]]
    product_performance: List[Dict[str, Any]]
    regional_performance: List[Dict[str, Any]]
    monthly_growth: List[Dict[str, Any]]


# ----------------- STATISTICAL & CORRELATION SCHEMAS -----------------
class HypothesisTestRequest(BaseModel):
    test_type: str  # t_test, anova, chi_square, normality
    col_a: str
    col_b: Optional[str] = None
    group_col: Optional[str] = None

class HypothesisTestResponse(BaseModel):
    test_name: str
    statistic: float
    p_value: float
    is_significant: bool
    alpha: float = 0.05
    interpretation: str
    details: Dict[str, Any]

class CorrelationResponse(BaseModel):
    method: str  # pearson, spearman
    columns: List[str]
    matrix: List[List[float]]
    top_positive_pairs: List[Dict[str, Any]]
    top_negative_pairs: List[Dict[str, Any]]
    high_multicollinearity_alerts: List[Dict[str, Any]]


# ----------------- AI INSIGHTS SCHEMAS -----------------
class AIInsightSection(BaseModel):
    title: str
    summary: str
    bullet_points: List[str]
    badge: Optional[str] = None
    sentiment: Optional[str] = "neutral"  # positive, warning, alert, neutral

class AIInsightsResponse(BaseModel):
    dataset_id: int
    dataset_name: str
    executive_summary: str
    data_health_evaluation: str
    key_findings: List[AIInsightSection]
    identified_trends: List[AIInsightSection]
    anomalies_and_risks: List[AIInsightSection]
    correlations_and_drivers: List[AIInsightSection]
    strategic_recommendations: List[AIInsightSection]
    swot_analysis: Dict[str, List[str]]
    generated_by: str  # heuristic_engine or llm_provider


# ----------------- AI DATA CHAT SCHEMAS -----------------
class AIChatRequest(BaseModel):
    dataset_id: Optional[int] = None
    message: str = Field(..., min_length=1)
    session_id: Optional[int] = None

class ChatMessageSchema(BaseModel):
    id: int
    sender: str
    content: str
    created_at: datetime
    metadata_json: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class AIChatResponse(BaseModel):
    session_id: int
    message: str
    sender: str = "ai"
    suggested_queries: List[str] = []
    related_metrics: Optional[Dict[str, Any]] = None


# ----------------- ML STUDIO SCHEMAS -----------------
class MLTaskDetectionResponse(BaseModel):
    suggested_task: str  # regression, classification, clustering, time_series
    target_column_candidates: List[Dict[str, Any]]
    feature_candidates: List[str]
    reason: str

class MLTrainRequest(BaseModel):
    task_type: str  # regression, classification, clustering
    target_col: Optional[str] = None
    feature_cols: List[str]
    model_types: Optional[List[str]] = None
    test_size: float = 0.2
    random_state: int = 42

class MLModelResult(BaseModel):
    model_name: str
    task_type: str
    metrics: Dict[str, Any]
    feature_importances: Optional[Dict[str, float]] = None
    confusion_matrix: Optional[List[List[int]]] = None
    class_labels: Optional[List[str]] = None
    actual_vs_predicted: Optional[List[Dict[str, Any]]] = None
    is_best: bool = False
    ai_explanation: str

class MLTrainResponse(BaseModel):
    dataset_id: int
    task_type: str
    target_col: Optional[str]
    features_used: List[str]
    trained_models: List[MLModelResult]
    best_model_name: str
    recommendation: str

class MLPredictRequest(BaseModel):
    dataset_id: int
    model_name: str
    features: Dict[str, Any]

class MLPredictResponse(BaseModel):
    prediction: Any
    probabilities: Optional[Dict[str, float]] = None
    ai_explanation: str
    confidence_level: Optional[str] = None
    contributing_factors: List[Dict[str, Any]]


# ----------------- CLUSTERING SCHEMAS -----------------
class ClusteringRequest(BaseModel):
    feature_cols: List[str]
    n_clusters: int = 3
    calculate_elbow: bool = True

class ClusterProfile(BaseModel):
    cluster_id: int
    cluster_name: str
    size: int
    percentage: float
    feature_means: Dict[str, float]
    ai_description: str

class ClusteringResponse(BaseModel):
    n_clusters: int
    features_used: List[str]
    elbow_data: Optional[List[Dict[str, Any]]] = None
    clusters: List[ClusterProfile]
    pca_coordinates: List[Dict[str, Any]]


# ----------------- FORECASTING SCHEMAS -----------------
class ForecastRequest(BaseModel):
    date_col: str
    target_col: str
    forecast_periods: int = 30
    frequency: Optional[str] = "D"

class ForecastResponse(BaseModel):
    date_col: str
    target_col: str
    frequency: str
    historical: List[Dict[str, Any]]
    forecast: List[Dict[str, Any]]
    trend_summary: str
    metrics: Dict[str, float]
    ai_insights: List[str]


# ----------------- ANOMALY SCHEMAS -----------------
class AnomalyRequest(BaseModel):
    feature_cols: Optional[List[str]] = None
    method: str = "isolation_forest"  # isolation_forest, zscore
    contamination: float = 0.05

class AnomalyResponse(BaseModel):
    total_records: int
    anomaly_count: int
    anomaly_percentage: float
    anomalous_records: List[Dict[str, Any]]
    pca_scatter: List[Dict[str, Any]]
    top_reasons: List[str]
    ai_summary: str


# ----------------- REPORT SCHEMAS -----------------
class GenerateReportRequest(BaseModel):
    report_type: str = "pdf"  # pdf, excel, csv
    title: Optional[str] = None
    include_profiling: bool = True
    include_stats: bool = True
    include_correlations: bool = True
    include_ai_insights: bool = True
    include_ml_results: bool = True


# ----------------- ADMIN SCHEMAS -----------------
class AdminOverviewResponse(BaseModel):
    total_users: int
    active_users: int
    datasets_uploaded: int
    total_analyses: int
    ml_models_trained: int
    reports_generated: int
    system_health: str = "Operational"
    cpu_usage_pct: float
    memory_usage_pct: float
    disk_free_gb: float

class ActivityLogSchema(BaseModel):
    id: int
    user_id: Optional[int]
    user_name: Optional[str]
    action: str
    details: Optional[str]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
