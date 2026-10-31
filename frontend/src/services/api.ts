import axios from 'axios';
import {
  DashboardSummary,
  RoleMetric,
  LocationMetric,
  SkillDemandItem,
  SkillCooccurrenceItem,
  SalaryAnalytics,
  TrendItem,
  PaginatedJobsResponse,
  JobDetail,
  SalaryPredictionRequest,
  SalaryPredictionResult,
  SkillGapRequest,
  SkillGapResponse,
  ModelMetadataResponse,
  DatasetMetadataResponse,
  FilterParams
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const api = {
  // Health
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Dashboard
  getDashboardSummary: async (filters?: FilterParams): Promise<DashboardSummary> => {
    const res = await apiClient.get<DashboardSummary>('/dashboard/summary', { params: filters });
    return res.data;
  },

  // Analytics
  getRoles: async (filters?: FilterParams): Promise<RoleMetric[]> => {
    const res = await apiClient.get<RoleMetric[]>('/analytics/roles', { params: filters });
    return res.data;
  },

  getLocations: async (filters?: FilterParams): Promise<LocationMetric[]> => {
    const res = await apiClient.get<LocationMetric[]>('/analytics/locations', { params: filters });
    return res.data;
  },

  getSkills: async (params?: { limit?: number; role?: string; location?: string }): Promise<SkillDemandItem[]> => {
    const res = await apiClient.get<SkillDemandItem[]>('/analytics/skills', { params });
    return res.data;
  },

  getSkillCooccurrences: async (params?: { limit?: number; role?: string }): Promise<SkillCooccurrenceItem[]> => {
    const res = await apiClient.get<SkillCooccurrenceItem[]>('/analytics/skills/cooccurrence', { params });
    return res.data;
  },

  getSalaries: async (filters?: FilterParams): Promise<SalaryAnalytics> => {
    const res = await apiClient.get<SalaryAnalytics>('/analytics/salaries', { params: filters });
    return res.data;
  },

  getTrends: async (params?: { role?: string }): Promise<TrendItem[]> => {
    const res = await apiClient.get<TrendItem[]>('/analytics/trends', { params });
    return res.data;
  },

  // Jobs
  getJobs: async (params: {
    page?: number;
    page_size?: number;
    search?: string;
    role?: string;
    location?: string;
    experience_level?: string;
    is_remote?: boolean;
    has_salary?: boolean;
    sort_by?: string;
    sort_order?: string;
  }): Promise<PaginatedJobsResponse> => {
    const res = await apiClient.get<PaginatedJobsResponse>('/jobs', { params });
    return res.data;
  },

  getJobById: async (jobId: string): Promise<JobDetail> => {
    const res = await apiClient.get<JobDetail>(`/jobs/${jobId}`);
    return res.data;
  },

  // Prediction & Models
  predictSalary: async (payload: SalaryPredictionRequest): Promise<SalaryPredictionResult> => {
    const res = await apiClient.post<SalaryPredictionResult>('/predict/salary', payload);
    return res.data;
  },

  getModelMetrics: async (): Promise<ModelMetadataResponse> => {
    const res = await apiClient.get<ModelMetadataResponse>('/model/metrics');
    return res.data;
  },

  // Skill Gap
  analyzeSkillGap: async (payload: SkillGapRequest): Promise<SkillGapResponse> => {
    const res = await apiClient.post<SkillGapResponse>('/analyze/skill-gap', payload);
    return res.data;
  },

  // Dataset
  getDatasetMetadata: async (): Promise<DatasetMetadataResponse> => {
    const res = await apiClient.get<DatasetMetadataResponse>('/dataset/metadata');
    return res.data;
  },

  triggerDatasetSync: async () => {
    const res = await apiClient.post('/dataset/import');
    return res.data;
  }
};

export default api;
