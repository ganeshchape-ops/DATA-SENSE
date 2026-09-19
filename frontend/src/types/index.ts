export interface User {
  id: number;
  name: string;
  email: string;
  mobile_number?: string;
  company?: string;
  role?: string;
  avatar_url?: string;
  is_verified?: boolean;
  is_active?: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Dataset {
  id: number;
  user_id: number;
  name: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  rows: number;
  columns: number;
  column_names: string[];
  column_types: Record<string, string>;
  domain?: string;
  domain_confidence?: number;
  domain_reason?: string;
  domain_override?: string;
  column_mapping?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NumericColumnStats {
  name: string;
  dtype: string;
  count: number;
  missing: number;
  missing_pct: number;
  mean: number | null;
  std: number | null;
  variance: number | null;
  min: number | null;
  q25: number | null;
  median: number | null;
  q75: number | null;
  max: number | null;
  iqr: number | null;
  skewness: number | null;
  kurtosis: number | null;
  zeros_count: number;
  negative_count: number;
}

export interface CategoricalCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface CategoricalColumnStats {
  name: string;
  dtype: string;
  count: number;
  missing: number;
  missing_pct: number;
  unique_count: number;
  top_value: string | null;
  top_frequency: number | null;
  top_categories: CategoricalCategory[];
}

export interface DatasetProfile {
  dataset_id: number;
  dataset_name: string;
  rows: number;
  columns: number;
  memory_usage_kb: number;
  total_missing_cells: number;
  missing_cells_pct: number;
  duplicate_rows_count: number;
  duplicate_rows_pct: number;
  numeric_columns_count: number;
  categorical_columns_count: number;
  datetime_columns_count: number;
  numeric_stats: NumericColumnStats[];
  categorical_stats: CategoricalColumnStats[];
  missing_per_column: Record<string, number>;
  column_types: Record<string, string>;
  data_quality_score: number;
}

export interface FilterCondition {
  column: string;
  operator: string;
  value: any;
}

export interface ExploreQueryResponse {
  total_rows: number;
  filtered_rows: number;
  page: number;
  page_size: number;
  total_pages: number;
  columns: string[];
  column_types: Record<string, string>;
  data: Record<string, any>[];
}

export interface RecommendedChart {
  chart_type: string;
  x_axis: string;
  y_axis: string | null;
  title: string;
  reason: string;
  score: number;
}

export interface KPICardData {
  key: string;
  title: string;
  value: string;
  numeric_value: number;
  prefix?: string;
  suffix?: string;
  change_pct: number;
  change_type: 'increase' | 'decrease' | 'neutral';
  trend_description: string;
  icon: string;
}

export interface DynamicChartData {
  id: string;
  title: string;
  subtitle?: string;
  chart_type: 'bar' | 'line' | 'area' | 'donut' | 'pie' | 'scatter' | 'horizontal_bar';
  x_axis?: string;
  x_label?: string;
  y_label?: string;
  series?: string[];
  data: any[];
}

export interface DomainAnalyticsResponse {
  dataset_id: number;
  domain: string;
  domain_display_name: string;
  confidence: number;
  reason: string;
  is_overridden: boolean;
  detected_fields: Record<string, any>;
  kpis: KPICardData[];
  charts: DynamicChartData[];
  domain_insights: AIInsightSection[];
  metrics: Record<string, any>;
  recommendations: string[];
}

export interface DashboardOverviewResponse {
  domain: string;
  domain_display_name: string;
  domain_confidence: number;
  domain_reason: string;
  domain_override?: string;
  detected_fields: Record<string, any>;
  kpis: KPICardData[];
  dynamic_charts?: DynamicChartData[];
  summary_metrics?: Record<string, any>;
  ai_summary?: string;
  // Legacy / fallback fields
  sales_trend?: { month: string; sales: number; orders: number }[];
  revenue_analysis?: { month: string; revenue: number; cost: number }[];
  profit_trend?: { month: string; profit: number; margin: number }[];
  target_vs_actual?: { period: string; actual: number; target: number; achievement: number }[];
  customer_distribution?: { segment: string; count: number; percentage: number; color: string }[];
  product_performance?: { product: string; revenue: number; share: number }[];
  regional_performance?: { region: string; sales: number; growth: number; share: number }[];
  monthly_growth?: { month: string; growth_rate: number }[];
}

export interface AIInsightSection {
  title: string;
  summary: string;
  bullet_points: string[];
  badge?: string;
  sentiment?: 'positive' | 'warning' | 'alert' | 'neutral';
}

export interface AIInsightsResponse {
  dataset_id: number;
  dataset_name: string;
  executive_summary: string;
  data_health_evaluation: string;
  key_findings: AIInsightSection[];
  identified_trends: AIInsightSection[];
  anomalies_and_risks: AIInsightSection[];
  correlations_and_drivers: AIInsightSection[];
  strategic_recommendations: AIInsightSection[];
  swot_analysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  generated_by: string;
}

export interface AIChatMessage {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  created_at: string;
  metadata_json?: {
    suggested_queries?: string[];
    related_metrics?: Record<string, any>;
  };
}

export interface AIChatResponse {
  session_id: number;
  message: string;
  sender: string;
  suggested_queries: string[];
  related_metrics?: Record<string, any>;
}

export interface CorrelationPair {
  var1: string;
  var2: string;
  correlation: number;
  abs_correlation: number;
  strength: string;
  description: string;
}

export interface CorrelationResponse {
  method: string;
  columns: string[];
  matrix: number[][];
  top_positive_pairs: CorrelationPair[];
  top_negative_pairs: CorrelationPair[];
  high_multicollinearity_alerts: { var1: string; var2: string; correlation: number; warning: string }[];
}

export interface HypothesisTestResponse {
  test_name: string;
  statistic: number;
  p_value: number;
  is_significant: boolean;
  alpha: number;
  interpretation: string;
  details: Record<string, any>;
}

export interface MLModelResult {
  model_name: string;
  task_type: string;
  metrics: Record<string, any>;
  feature_importances?: Record<string, number>;
  confusion_matrix?: number[][];
  class_labels?: string[];
  actual_vs_predicted?: { index: number; actual: number; predicted: number }[];
  is_best: boolean;
  ai_explanation: string;
}

export interface MLTrainResponse {
  dataset_id: number;
  task_type: string;
  target_col: string | null;
  features_used: string[];
  trained_models: MLModelResult[];
  best_model_name: string;
  recommendation: string;
}

export interface MLPredictResponse {
  prediction: any;
  probabilities?: Record<string, number>;
  ai_explanation: string;
  confidence_level?: string;
  contributing_factors: { feature: string; value: any; impact: string }[];
}

export interface ClusterProfile {
  cluster_id: number;
  cluster_name: string;
  size: number;
  percentage: number;
  feature_means: Record<string, number>;
  ai_description: string;
}

export interface ClusteringResponse {
  n_clusters: number;
  features_used: string[];
  elbow_data?: { k: number; inertia: number }[];
  clusters: ClusterProfile[];
  pca_coordinates: { x: number; y: number; cluster: number }[];
}

export interface ForecastResponse {
  date_col: string;
  target_col: string;
  frequency: string;
  historical: { date: string; actual: number; trend: number }[];
  forecast: { date: string; forecast: number; lower_bound: number; upper_bound: number }[];
  trend_summary: string;
  metrics: Record<string, number>;
  ai_insights: string[];
}

export interface AnomalyResponse {
  total_records: number;
  anomaly_count: number;
  anomaly_percentage: number;
  anomalous_records: {
    row_index: number;
    anomaly_score: number;
    primary_driver: string;
    deviating_features: Record<string, number>;
    data: Record<string, any>;
  }[];
  pca_scatter: { x: number; y: number; is_anomaly: boolean; anomaly_score: number }[];
  top_reasons: string[];
  ai_summary: string;
}

export interface AdminOverview {
  total_users: number;
  active_users: number;
  datasets_uploaded: number;
  total_analyses: number;
  ml_models_trained: number;
  reports_generated: number;
  system_health: string;
  cpu_usage_pct: number;
  memory_usage_pct: number;
  disk_free_gb: number;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  user_name?: string;
  action: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

