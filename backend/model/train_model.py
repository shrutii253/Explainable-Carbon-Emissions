from __future__ import annotations

from pathlib import Path
from typing import Dict, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, train_test_split

import shap

from .data import generate_synthetic_emission_data


ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = ARTIFACTS_DIR / "rf_model.joblib"
TRAIN_DATA_PATH = ARTIFACTS_DIR / "train_data.joblib"
METRICS_PATH = ARTIFACTS_DIR / "metrics.joblib"
GLOBAL_SHAP_PATH = ARTIFACTS_DIR / "global_shap.joblib"

# Linear Regression baseline artifacts
LR_MODEL_PATH = ARTIFACTS_DIR / "lr_model.joblib"
LR_METRICS_PATH = ARTIFACTS_DIR / "lr_metrics.joblib"


FEATURE_COLUMNS = [
    "gdp_per_capita",
    "industrial_output",
    "population",
    "vehicle_count",
    "energy_consumption",
    "renewable_share",
    "engine_size",
    "fuel_consumption",
    "cylinders",
    "energy_intensity",
    "gdp_energy_interaction",
]

TARGET_COLUMN = "co2_emissions"


def train_random_forest_with_explainability(
    n_estimators: int = 200,
    random_state: int = 42,
) -> Tuple[
    RandomForestRegressor,
    Dict,
    pd.DataFrame,
    pd.Series,
    Dict,
    pd.DataFrame,
    pd.Series,
]:
    """
    Train a RandomForestRegressor on the synthetic dataset and compute:

    - Train/test metrics (MAE, RMSE, R^2)
    - 5-fold cross validation MAE
    - Global SHAP feature importance (mean |shap| per feature)

    Returns the trained model, metrics dict, X_train, y_train, global explainability dict,
    and the held-out X_test, y_test used for evaluation (for baseline comparison).
    """
    df = generate_synthetic_emission_data()

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=random_state
    )

    model = RandomForestRegressor(
        n_estimators=n_estimators, random_state=random_state, n_jobs=-1
    )

    # 5-fold cross validation on training set (MAE)
    kf = KFold(n_splits=5, shuffle=True, random_state=random_state)
    cv_mae_scores = []
    for train_idx, val_idx in kf.split(X_train):
        X_tr, X_val = X_train.iloc[train_idx], X_train.iloc[val_idx]
        y_tr, y_val = y_train.iloc[train_idx], y_train.iloc[val_idx]
        model_cv = RandomForestRegressor(
            n_estimators=n_estimators, random_state=random_state, n_jobs=-1
        )
        model_cv.fit(X_tr, y_tr)
        preds_val = model_cv.predict(X_val)
        cv_mae_scores.append(mean_absolute_error(y_val, preds_val))

    # Fit final model on full training data
    model.fit(X_train, y_train)

    # Evaluate on test set
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    # Use explicit sqrt of MSE instead of squared=False for
    # compatibility with older scikit-learn versions.
    mse = mean_squared_error(y_test, y_pred)
    rmse = float(np.sqrt(mse))
    r2 = r2_score(y_test, y_pred)

    metrics = {
        "mae": float(mae),
        "rmse": float(rmse),
        "r2": float(r2),
        "cv_mae_mean": float(np.mean(cv_mae_scores)),
        "cv_mae_std": float(np.std(cv_mae_scores)),
    }

    # Global SHAP explainability (TreeExplainer for Random Forest)
    # Use a background subset of training data for efficiency.
    background = X_train.sample(
        min(300, len(X_train)), random_state=random_state
    )
    explainer = shap.TreeExplainer(model, background)
    shap_values = explainer.shap_values(background)
    # For regression, shap_values is (n_samples, n_features)
    shap_values = np.array(shap_values)
    mean_abs_shap = np.abs(shap_values).mean(axis=0)

    global_explain = {
        "feature_names": FEATURE_COLUMNS,
        "mean_abs_shap": mean_abs_shap,
        "rf_feature_importances": model.feature_importances_,
    }

    return model, metrics, X_train, y_train, global_explain, X_test, y_test


def train_linear_regression_baseline(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
) -> Tuple[LinearRegression, Dict]:
    """
    Train a simple Linear Regression baseline on the same train/test split
    used by the Random Forest model, and compute MAE, RMSE, and R^2.
    """
    lr = LinearRegression()
    lr.fit(X_train, y_train)

    y_pred = lr.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = float(np.sqrt(mse))
    r2 = r2_score(y_test, y_pred)

    metrics = {
        "mae": float(mae),
        "rmse": float(rmse),
        "r2": float(r2),
        # Baseline does not use CV here, keep fields for a symmetric schema.
        "cv_mae_mean": float("nan"),
        "cv_mae_std": float("nan"),
    }

    return lr, metrics


def train_and_persist_artifacts() -> None:
    """
    Train the model and persist all artifacts needed by the API layer:

    - Trained RandomForestRegressor
    - Training data (for SHAP/LIME background)
    - Metrics
    - Global SHAP summary
    - Linear Regression baseline model + metrics
    """
    (
        model,
        metrics,
        X_train,
        y_train,
        global_explain,
        X_test,
        y_test,
    ) = train_random_forest_with_explainability()

    # Train Linear Regression baseline on the same split for fair comparison.
    lr_model, lr_metrics = train_linear_regression_baseline(
        X_train=X_train,
        y_train=y_train,
        X_test=X_test,
        y_test=y_test,
    )

    # Persist artifacts
    joblib.dump(model, MODEL_PATH)
    joblib.dump({"X_train": X_train, "y_train": y_train}, TRAIN_DATA_PATH)
    joblib.dump(metrics, METRICS_PATH)
    joblib.dump(global_explain, GLOBAL_SHAP_PATH)
    joblib.dump(lr_model, LR_MODEL_PATH)
    joblib.dump(lr_metrics, LR_METRICS_PATH)


if __name__ == "__main__":
    # Allow manual training: `python -m backend.model.train_model`
    train_and_persist_artifacts()

