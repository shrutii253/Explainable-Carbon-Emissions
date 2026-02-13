from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression

import shap
from lime.lime_tabular import LimeTabularExplainer

from .train_model import (
    ARTIFACTS_DIR,
    GLOBAL_SHAP_PATH,
    METRICS_PATH,
    MODEL_PATH,
    TRAIN_DATA_PATH,
    FEATURE_COLUMNS,
    LR_MODEL_PATH,
    LR_METRICS_PATH,
    train_and_persist_artifacts,
)


def _ensure_artifacts_exist() -> None:
    """
    Ensure that trained artifacts are available.

    If artifacts are missing (first run), this will train the model and
    persist everything. This makes the application self-contained and
    reproducible for new environments.
    """
    if (
        not MODEL_PATH.exists()
        or not TRAIN_DATA_PATH.exists()
        or not METRICS_PATH.exists()
        or not LR_MODEL_PATH.exists()
        or not LR_METRICS_PATH.exists()
    ):
        ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        train_and_persist_artifacts()


@lru_cache(maxsize=1)
def load_artifacts() -> Tuple[RandomForestRegressor, pd.DataFrame, pd.Series, Dict[str, Any], Dict[str, Any], Any, LimeTabularExplainer]:
    """
    Load all persisted artifacts and construct shared explainability objects.

    Returns:
        model: trained RandomForestRegressor
        X_train: training feature dataframe
        y_train: training target series
        metrics: dict of evaluation metrics
        global_explain: dict with global SHAP and RF importances
        shap_explainer: TreeExplainer built on a background subset
        lime_explainer: LimeTabularExplainer built on training data
    """
    _ensure_artifacts_exist()

    model: RandomForestRegressor = joblib.load(MODEL_PATH)
    train_data = joblib.load(TRAIN_DATA_PATH)
    X_train: pd.DataFrame = train_data["X_train"]
    y_train: pd.Series = train_data["y_train"]
    metrics: Dict[str, Any] = joblib.load(METRICS_PATH)
    global_explain: Dict[str, Any] = joblib.load(GLOBAL_SHAP_PATH)

    # Background subset for SHAP
    background = X_train.sample(
        min(300, len(X_train)), random_state=42
    )
    shap_explainer = shap.TreeExplainer(model, background)

    # LIME explainer
    lime_explainer = LimeTabularExplainer(
        training_data=X_train.values,
        feature_names=FEATURE_COLUMNS,
        mode="regression",
        discretize_continuous=True,
        random_state=42,
    )

    return model, X_train, y_train, metrics, global_explain, shap_explainer, lime_explainer


@lru_cache(maxsize=1)
def load_baseline_model() -> Tuple[LinearRegression, Dict[str, Any]]:
    """
    Load the Linear Regression baseline model and its evaluation metrics.
    """
    _ensure_artifacts_exist()

    lr_model: LinearRegression = joblib.load(LR_MODEL_PATH)
    lr_metrics: Dict[str, Any] = joblib.load(LR_METRICS_PATH)
    return lr_model, lr_metrics

