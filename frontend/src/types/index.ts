// TypeScript domain interfaces for JobScope

export interface FilterParams {
  role?: string;
  location?: string;
  experience_level?: string;
  is_remote?: boolean;
  has_salary?: boolean;
}

export interface SkillItemSummary {
  skill: string;
  count: number;
  percentage: number;
}

export interface DashboardSummary {
  total_postings: number;
  total_roles: number;
  total_locations: number;
  top_demanded_skills: SkillItemSummary[];
  median_annual_salary: number | null;
  mean_annual_salary: number | null;
  salary_disclosure_percentage: number;
  total_valid_salary_records: number;
  currency: string;
}

export interface RoleMetric {
  role: string;
  posting_count: number;
  market_share_percentage: number;
  avg_annual_salary: number | null;
  median_annual_salary: number | null;
  salary_sample_size: number;
  is_statistically_reliable: boolean;
}

export interface LocationMetric {
  location: string;
  posting_count: number;
  percentage: number;
  avg_annual_salary: number | null;
  remote_percentage: number;
}

export interface SkillDemandItem {
  skill: string;
  count: number;
  percentage_of_postings: number;
  avg_salary_inr: number | null;
  salary_sample_size: number;
}

export interface SkillCooccurrenceItem {
  skill_a: string;
  skill_b: string;
  cooccurrence_count: number;
}

export interface SalaryDistributionBucket {
  bracket_label: string;
  min_val: number;
  max_val: number;
  job_count: number;
  percentage: number;
}

export interface ExperienceSalaryMetric {
  experience_level: string;
  avg_years: number;
  job_count: number;
  avg_annual_salary: number | null;
  median_annual_salary: number | null;
}

export interface RemoteComparisonMetric {
  work_mode: string;
  job_count: number;
  percentage: number;
  avg_annual_salary: number | null;
}

export interface SalaryAnalytics {
  distribution: SalaryDistributionBucket[];
  by_experience: ExperienceSalaryMetric[];
  remote_comparison: RemoteComparisonMetric[];
}

export interface TrendItem {
  month: string;
  postings: number;
  avg_salary: number | null;
}

export interface JobListItem {
  id: number;
  job_id: string;
  raw_title: string;
  normalized_title: string;
  company: string;
  raw_location: string | null;
  normalized_location: string;
  is_remote: boolean;
  experience_years: number;
  experience_level: string;
  employment_type: string;
  annual_salary_avg: number | null;
  annual_salary_min: number | null;
  annual_salary_max: number | null;
  standardized_currency: string;
  is_valid_salary: boolean;
  posting_date: string | null;
  skills: string[];
}

export interface JobDetail extends JobListItem {
  raw_salary_min: number | null;
  raw_salary_max: number | null;
  raw_currency: string | null;
  raw_period: string | null;
  salary_quality_note: string | null;
  source: string;
  created_at: string;
}

export interface PaginatedJobsResponse {
  items: JobListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SalaryPredictionRequest {
  role: string;
  experience_years: number;
  location: string;
  skills: string[];
  employment_type: string;
}

export interface SalaryPredictionResult {
  predicted_annual_salary: number;
  predicted_salary_lpa: string;
  estimated_range_min: number;
  estimated_range_max: number;
  estimated_range_lpa: string;
  currency: string;
  model_used: string;
  model_mae: number;
  model_r2: number;
  input_profile: Record<string, any>;
  limitations: string[];
  disclaimer: string;
}

export interface MissingSkillItem {
  skill: string;
  frequency_count: number;
  frequency_percentage: number;
  importance_tier: string;
  avg_salary_with_skill_inr: number | null;
}

export interface SkillGapRequest {
  target_role: string;
  user_skills: string[];
  location?: string;
}

export interface SkillGapResponse {
  target_role: string;
  matched_skills: string[];
  missing_skills: MissingSkillItem[];
  match_percentage: number;
  total_role_postings_evaluated: number;
  evidence_checklist: string[];
  disclaimer: string;
}

export interface ModelComparisonItem {
  model_name: string;
  test_mae: number;
  test_rmse: number;
  test_r2: number;
  cv_r2_mean: number;
  cv_r2_std: number;
  cv_mae_mean: number;
}

export interface ModelMetadataResponse {
  pipeline_version?: string;
  training_timestamp?: string;
  dataset_records_used?: number;
  selected_model: string;
  champion_metrics: {
    model_name: string;
    test_mae: number;
    test_rmse: number;
    test_r2: number;
    cv_r2_mean?: number;
    cv_mae_mean?: number;
  };
  model_comparison: ModelComparisonItem[];
  available_roles: string[];
  available_locations: string[];
  available_skills: string[];
  known_limitations: string[];
  estimated_interval_formula?: string;
}

export interface DatasetMetadataResponse {
  dataset_metadata: {
    dataset_name?: string;
    source?: string;
    license?: string;
    last_updated?: string;
    is_synthetic_labeled?: boolean;
    data_notice?: string;
    roles_covered?: string[];
    locations_covered?: string[];
  };
  quality_report: {
    total_raw_records?: number;
    clean_records_retained?: number;
    duplicate_records_removed?: number;
    records_with_salary_disclosed?: number;
    records_with_valid_annual_salary?: number;
    records_missing_salary?: number;
    unknown_or_missing_currency?: number;
    salary_outliers_flagged?: number;
    valid_salary_percentage?: number;
    unique_roles_count?: number;
    unique_locations_count?: number;
    unique_skills_count?: number;
    target_standardized_currency?: string;
    processed_timestamp?: string;
  };
  database_records_count: number;
  last_updated: string | null;
}
