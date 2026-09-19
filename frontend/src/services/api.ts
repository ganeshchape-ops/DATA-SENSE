import axios from 'axios';
import type {
  User, Dataset, DatasetProfile, ExploreQueryResponse, RecommendedChart,
  DashboardOverviewResponse, AIInsightsResponse, CorrelationResponse, HypothesisTestResponse,
  MLTrainResponse, MLPredictResponse, ClusteringResponse, ForecastResponse, AnomalyResponse,
  AIChatMessage, AIChatResponse, AdminOverview, ActivityLog, DomainAnalyticsResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Bearer token & optional custom AI key
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ai_insight_token') || localStorage.getItem('datasense_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const customAiKey = localStorage.getItem('ai_insight_api_key');
  if (customAiKey) {
    config.headers['X-AI-Key'] = customAiKey;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth & Security APIs
export const authApi = {
  register: (data: { name: string; email: string; password: string; mobile_number?: string; company?: string; role?: string }) =>
    apiClient.post('/auth/register', data).then(r => r.data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data).then(r => r.data),
  demoLogin: () =>
    apiClient.post('/auth/demo').then(r => r.data),
  sendOtp: (data: { target: string; purpose?: string }) =>
    apiClient.post('/auth/send-otp', data).then(r => r.data),
  verifyOtp: (data: { target: string; otp_code: string; purpose?: string }) =>
    apiClient.post('/auth/verify-otp', data).then(r => r.data),
  forgotPassword: (data: { target: string }) =>
    apiClient.post('/auth/forgot-password', data).then(r => r.data),
  resetPassword: (data: { target: string; otp_code: string; new_password: string }) =>
    apiClient.post('/auth/reset-password', data).then(r => r.data),
  getMe: () =>
    apiClient.get<User>('/auth/me').then(r => r.data),
  updateProfile: (data: Partial<User>) =>
    apiClient.put<User>('/auth/profile', data).then(r => r.data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    apiClient.post('/auth/change-password', data).then(r => r.data),
};

// Dataset APIs
export const datasetApi = {
  list: () =>
    apiClient.get<Dataset[]>('/datasets').then(r => r.data),
  get: (id: number) =>
    apiClient.get<Dataset>(`/datasets/${id}`).then(r => r.data),
  upload: (formData: FormData) =>
    apiClient.post<Dataset>('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
  loadSample: (sample_key: string = 'sales_data') =>
    apiClient.post<Dataset>('/datasets/sample', { sample_key }).then(r => r.data),
  overrideDomain: (id: number, domain: string) =>
    apiClient.post<Dataset>(`/datasets/${id}/domain-override`, { domain }).then(r => r.data),
  updateColumnMapping: (id: number, column_mapping: Record<string, any>) =>
    apiClient.post<Dataset>(`/datasets/${id}/column-mapping`, { column_mapping }).then(r => r.data),
  getDomainAnalysis: (id: number) =>
    apiClient.get<DomainAnalyticsResponse>(`/datasets/${id}/domain-analysis`).then(r => r.data),
  delete: (id: number) =>
    apiClient.delete(`/datasets/${id}`).then(r => r.data),
};

// Analytics & Profiling APIs
export const analyticsApi = {
  getProfile: (datasetId: number) =>
    apiClient.get<DatasetProfile>(`/profiling/profile/${datasetId}`).then(r => r.data),
  clean: (datasetId: number, data: any) =>
    apiClient.post(`/cleaning/clean/${datasetId}`, data).then(r => r.data),
  explore: (datasetId: number, query: any) =>
    apiClient.post<ExploreQueryResponse>(`/explorer/explore/${datasetId}`, query).then(r => r.data),
  getCorrelation: (datasetId: number, method = 'pearson') =>
    apiClient.get<CorrelationResponse>(`/correlation/matrix/${datasetId}?method=${method}`).then(r => r.data),
  runHypothesisTest: (datasetId: number, testData: any) =>
    apiClient.post<HypothesisTestResponse>(`/statistics/hypothesis-test/${datasetId}`, testData).then(r => r.data),
};

// Visualization & Dashboard APIs
export const visApi = {
  getOverview: (datasetId?: number) =>
    apiClient.get<DashboardOverviewResponse>(datasetId ? `/visualization/overview/${datasetId}` : '/visualization/overview').then(r => r.data),
  getRecommendations: (datasetId: number) =>
    apiClient.get<RecommendedChart[]>(`/visualization/recommend/${datasetId}`).then(r => r.data),
  queryChart: (datasetId: number, chartReq: any) =>
    apiClient.post(`/visualization/query/${datasetId}`, chartReq).then(r => r.data),
};

// AI Insights API
export const aiApi = {
  getInsights: (datasetId: number) =>
    apiClient.post<AIInsightsResponse>(`/ai/insights/${datasetId}`).then(r => r.data),
};

// AI Data Chat APIs
export const chatApi = {
  sendMessage: (data: { message: string; dataset_id?: number; session_id?: number }) =>
    apiClient.post<AIChatResponse>('/chat/message', data).then(r => r.data),
  getHistory: (datasetId: number) =>
    apiClient.get<AIChatMessage[]>(`/chat/history/${datasetId}`).then(r => r.data),
  clearHistory: (datasetId: number) =>
    apiClient.delete(`/chat/clear/${datasetId}`).then(r => r.data),
};

// Machine Learning APIs
export const mlApi = {
  detectTask: (datasetId: number) =>
    apiClient.get(`/ml/detect-task/${datasetId}`).then(r => r.data),
  train: (datasetId: number, trainReq: any) =>
    apiClient.post<MLTrainResponse>(`/ml/train/${datasetId}`, trainReq).then(r => r.data),
  predict: (predictReq: any) =>
    apiClient.post<MLPredictResponse>('/ml/predict', predictReq).then(r => r.data),
  clustering: (datasetId: number, clusterReq: any) =>
    apiClient.post<ClusteringResponse>(`/ml/clustering/${datasetId}`, clusterReq).then(r => r.data),
};

// Forecasting API
export const forecastApi = {
  generate: (datasetId: number, req: any) =>
    apiClient.post<ForecastResponse>(`/forecasting/forecast/${datasetId}`, req).then(r => r.data),
};

// Anomaly Detection API
export const anomalyApi = {
  detect: (datasetId: number, req: any) =>
    apiClient.post<AnomalyResponse>(`/anomaly/detect/${datasetId}`, req).then(r => r.data),
};

// Reports API
export const reportsApi = {
  generate: (datasetId: number, req: any) =>
    apiClient.post(`/reports/generate/${datasetId}`, req).then(r => r.data),
  downloadUrl: (reportId: number) =>
    `${API_BASE_URL}/reports/download/${reportId}`,
};

// Admin APIs
export const adminApi = {
  getOverview: () =>
    apiClient.get<AdminOverview>('/admin/overview').then(r => r.data),
  getUsers: () =>
    apiClient.get<User[]>('/admin/users').then(r => r.data),
  toggleUserStatus: (userId: number) =>
    apiClient.put(`/admin/users/${userId}/status`).then(r => r.data),
  getLogs: () =>
    apiClient.get<ActivityLog[]>('/admin/logs').then(r => r.data),
};
