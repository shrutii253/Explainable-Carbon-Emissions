from __future__ import annotations

from typing import Any, Dict, List

import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .model.registry import load_artifacts, load_baseline_model, FEATURE_COLUMNS
from .explainability.lime_service import get_local_lime_explanation
from .explainability.shap_service import (
    get_global_shap_feature_importance,
    get_local_shap_explanation,
)
from .utils.policy import generate_policy_insights
from .utils.schemas import (
    EmissionFeatures,
    FeatureImportanceResponse,
    MetricsResponse,
    PolicyInsightsResponse,
    PredictionResponse,
    PredictionTrendResponse,
    TrendPoint,
    BaselinePredictionResponse,
)


app = FastAPI(
    title="Explainable Carbon Emission Forecasting API",
    description=(
        "Random Forest-based CO₂ emission forecasting with SHAP and LIME "
        "explanations, designed for sustainable decision-making scenarios."
    ),
    version="1.0.0",
)

# Allow local frontend development by default (Vite, etc.)
import os

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add production frontend URL from environment
if frontend_url := os.getenv("FRONTEND_URL"):
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _load_model_on_startup() -> None:
    # Trigger lazy loading and training if needed
    load_artifacts()


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/metrics", response_model=MetricsResponse)
def get_metrics() -> MetricsResponse:
    model, X_train, y_train, metrics, global_explain, shap_explainer, lime_explainer = (
        load_artifacts()
    )

    return MetricsResponse(
        r2=metrics["r2"],
        rmse=metrics["rmse"],
        mae=metrics["mae"],
        cv_mae_mean=metrics["cv_mae_mean"],
        cv_mae_std=metrics["cv_mae_std"],
    )


@app.get("/metrics/baseline", response_model=MetricsResponse)
def get_baseline_metrics() -> MetricsResponse:
    """
    Metrics for the Linear Regression baseline model, trained on the same split
    as the Random Forest model. CV fields are left as NaN.
    """
    lr_model, lr_metrics = load_baseline_model()
    return MetricsResponse(
        r2=lr_metrics["r2"],
        rmse=lr_metrics["rmse"],
        mae=lr_metrics["mae"],
        cv_mae_mean=lr_metrics["cv_mae_mean"],
        cv_mae_std=lr_metrics["cv_mae_std"],
    )


@app.get("/feature-importance", response_model=FeatureImportanceResponse)
def feature_importance() -> FeatureImportanceResponse:
    model, X_train, y_train, metrics, global_explain, shap_explainer, lime_explainer = (
        load_artifacts()
    )
    items = get_global_shap_feature_importance(global_explain)
    return FeatureImportanceResponse(items=items)


@app.get("/prediction-trend", response_model=PredictionTrendResponse)
def prediction_trend(limit: int = 100) -> PredictionTrendResponse:
    """
    Return a small slice of (true, predicted) pairs for visualization.
    """
    model, X_train, y_train, metrics, global_explain, shap_explainer, lime_explainer = (
        load_artifacts()
    )

    # Use a held-out slice from the end of training data for a simple trend
    n = min(limit, len(X_train))
    X_slice = X_train.tail(n)
    y_slice = y_train.tail(n)
    y_pred = model.predict(X_slice)

    points: List[TrendPoint] = []
    for idx, true_val, pred_val in zip(
        X_slice.index, y_slice.values, y_pred
    ):
        points.append(
            TrendPoint(
                index=int(idx),
                true_value=float(true_val),
                predicted_value=float(pred_val),
            )
        )

    return PredictionTrendResponse(points=points)


@app.get("/policy-insights", response_model=PolicyInsightsResponse)
def policy_insights() -> PolicyInsightsResponse:
    model, X_train, y_train, metrics, global_explain, shap_explainer, lime_explainer = (
        load_artifacts()
    )
    insights_raw = generate_policy_insights(global_explain, X_train, y_train)
    return PolicyInsightsResponse(insights=insights_raw)


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: EmissionFeatures) -> PredictionResponse:
    model, X_train, y_train, metrics, global_explain, shap_explainer, lime_explainer = (
        load_artifacts()
    )

    # Construct full feature vector including engineered features
    base_features = {
        "gdp_per_capita": payload.gdp_per_capita,
        "industrial_output": payload.industrial_output,
        "population": payload.population,
        "vehicle_count": payload.vehicle_count,
        "energy_consumption": payload.energy_consumption,
        "renewable_share": payload.renewable_share,
        "engine_size": payload.engine_size,
        "fuel_consumption": payload.fuel_consumption,
        "cylinders": payload.cylinders,
    }

    df = pd.DataFrame([base_features])
    # Engineered features consistent with training pipeline
    df["energy_intensity"] = df["energy_consumption"] / df["industrial_output"]
    df["gdp_energy_interaction"] = (
        df["gdp_per_capita"] * df["energy_consumption"]
    )

    # Ensure column order
    df = df[FEATURE_COLUMNS]

    # Raw prediction
    prediction = float(model.predict(df)[0])

    # LIME local explanation
    lime_exp = get_local_lime_explanation(
        lime_explainer=lime_explainer,
        model_predict_fn=model.predict,
        instance=df.values[0],
        num_features=min(10, df.shape[1]),
    )

    # SHAP local explanation
    shap_exp = get_local_shap_explanation(shap_explainer, df)

    return PredictionResponse(
        prediction=prediction,
        lime_explanation=lime_exp,
        shap_values=shap_exp,
    )


@app.post("/predict/baseline", response_model=BaselinePredictionResponse)
def predict_baseline(payload: EmissionFeatures) -> BaselinePredictionResponse:
    """
    Linear Regression baseline prediction. This endpoint is intentionally
    model-only and does not return SHAP/LIME explanations.
    """
    lr_model, lr_metrics = load_baseline_model()

    base_features = {
      "gdp_per_capita": payload.gdp_per_capita,
      "industrial_output": payload.industrial_output,
      "population": payload.population,
      "vehicle_count": payload.vehicle_count,
      "energy_consumption": payload.energy_consumption,
      "renewable_share": payload.renewable_share,
      "engine_size": payload.engine_size,
      "fuel_consumption": payload.fuel_consumption,
      "cylinders": payload.cylinders,
    }

    df = pd.DataFrame([base_features])
    df["energy_intensity"] = df["energy_consumption"] / df["industrial_output"]
    df["gdp_energy_interaction"] = (
        df["gdp_per_capita"] * df["energy_consumption"]
    )
    df = df[FEATURE_COLUMNS]

    prediction = float(lr_model.predict(df)[0])
    return BaselinePredictionResponse(prediction=prediction)

