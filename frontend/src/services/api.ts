import axios from 'axios';
import type {
  User, Dataset, DatasetProfile, ExploreQueryResponse, RecommendedChart,
  AIInsightsResponse, CorrelationResponse, HypothesisTestResponse,
  MLTrainResponse, MLPredictResponse, ClusteringResponse, ForecastResponse, AnomalyResponse
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
  const token = localStorage.getItem('datasense_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const customAiKey = localStorage.getItem('datasense_ai_key');
  if (customAiKey) {
    config.headers['X-AI-Key'] = customAiKey;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth APIs
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post('/auth/register', data).then(r => r.data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data).then(r => r.data),
  demoLogin: () =>
    apiClient.post('/auth/demo').then(r => r.data),
  getMe: () =>
    apiClient.get<User>('/auth/me').then(r => r.data),
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
  loadSample: (sample_key: string) =>
    apiClient.post<Dataset>('/datasets/sample', { sample_key }).then(r => r.data),
  delete: (id: number) =>
    apiClient.delete(`/datasets/${id}`).then(r => r.data),
};

// Analytics & Profiling APIs
export const analyticsApi = {
  getProfile: (datasetId: number) =>
    apiClient.get<DatasetProfile>(`/analytics/profile/${datasetId}`).then(r => r.data),
  clean: (datasetId: number, data: any) =>
    apiClient.post(`/analytics/clean/${datasetId}`, data).then(r => r.data),
  explore: (datasetId: number, query: any) =>
    apiClient.post<ExploreQueryResponse>(`/analytics/explore/${datasetId}`, query).then(r => r.data),
  getCorrelation: (datasetId: number, method = 'pearson') =>
    apiClient.get<CorrelationResponse>(`/analytics/correlation/${datasetId}?method=${method}`).then(r => r.data),
  runHypothesisTest: (datasetId: number, testData: any) =>
    apiClient.post<HypothesisTestResponse>(`/analytics/hypothesis-test/${datasetId}`, testData).then(r => r.data),
};

// Visualization APIs
export const visApi = {
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
