from __future__ import annotations

from typing import Any, Dict, List

from pydantic import BaseModel, Field


class EmissionFeatures(BaseModel):
    gdp_per_capita: float = Field(..., description="GDP per capita in USD")
    industrial_output: float = Field(..., description="Industrial output index or value")
    population: float = Field(..., description="Population size")
    vehicle_count: float = Field(..., description="Number of vehicles")
    energy_consumption: float = Field(..., description="Total energy consumption")
    renewable_share: float = Field(..., description="Share of renewables in %")
    engine_size: float = Field(..., description="Average engine size in liters")
    fuel_consumption: float = Field(..., description="Fuel consumption (e.g., L/100km)")
    cylinders: float = Field(..., description="Average number of cylinders")


class PredictionResponse(BaseModel):
    prediction: float
    lime_explanation: Dict[str, Any]
    shap_values: Dict[str, Any]


class MetricsResponse(BaseModel):
    r2: float
    rmse: float
    mae: float
    cv_mae_mean: float
    cv_mae_std: float


class FeatureImportanceItem(BaseModel):
    feature: str
    mean_abs_shap: float
    rf_importance: float


class FeatureImportanceResponse(BaseModel):
    items: List[FeatureImportanceItem]


class TrendPoint(BaseModel):
    index: int
    true_value: float
    predicted_value: float


class PredictionTrendResponse(BaseModel):
    points: List[TrendPoint]


class PolicyInsight(BaseModel):
    title: str
    description: str
    rationale: str


class PolicyInsightsResponse(BaseModel):
    insights: List[PolicyInsight]


class BaselinePredictionResponse(BaseModel):
    prediction: float

