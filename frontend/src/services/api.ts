import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

export interface Metrics {
  r2: number;
  rmse: number;
  mae: number;
  cv_mae_mean: number;
  cv_mae_std: number;
}

export interface FeatureImportanceItem {
  feature: string;
  mean_abs_shap: number;
  rf_importance: number;
}

export interface TrendPoint {
  index: number;
  true_value: number;
  predicted_value: number;
}

export interface PolicyInsight {
  title: string;
  description: string;
  rationale: string;
}

export interface EmissionFeaturesPayload {
  gdp_per_capita: number;
  industrial_output: number;
  population: number;
  vehicle_count: number;
  energy_consumption: number;
  renewable_share: number;
  engine_size: number;
  fuel_consumption: number;
  cylinders: number;
}

export interface LimeContribution {
  feature: string;
  weight: number;
  effect: "positive" | "negative";
}

export interface LimeExplanation {
  intercept: number;
  predicted_value: number;
  local_prediction: number;
  contributions: LimeContribution[];
}

export interface ShapFeatureContribution {
  feature: string;
  value: number;
}

export interface ShapExplanation {
  base_value: number;
  per_feature: ShapFeatureContribution[];
}

export interface PredictResponse {
  prediction: number;
  lime_explanation: LimeExplanation;
  shap_values: ShapExplanation;
}

export interface BaselinePredictResponse {
  prediction: number;
}

export async function fetchMetrics() {
  const { data } = await apiClient.get<Metrics>("/metrics");
  return data;
}

export async function fetchBaselineMetrics() {
  const { data } = await apiClient.get<Metrics>("/metrics/baseline");
  return data;
}

export async function fetchFeatureImportance() {
  const { data } = await apiClient.get<{ items: FeatureImportanceItem[] }>("/feature-importance");
  return data.items;
}

export async function fetchPredictionTrend(limit = 100) {
  const { data } = await apiClient.get<{ points: TrendPoint[] }>("/prediction-trend", {
    params: { limit }
  });
  return data.points;
}

export async function fetchPolicyInsights() {
  const { data } = await apiClient.get<{ insights: PolicyInsight[] }>("/policy-insights");
  return data.insights;
}

export async function predictEmission(payload: EmissionFeaturesPayload) {
  const { data } = await apiClient.post<PredictResponse>("/predict", payload);
  return data;
}

export async function predictBaselineEmission(payload: EmissionFeaturesPayload) {
  const { data } = await apiClient.post<BaselinePredictResponse>("/predict/baseline", payload);
  return data;
}

