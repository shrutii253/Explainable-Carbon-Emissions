from __future__ import annotations

from typing import Any, Dict, List

import numpy as np
import pandas as pd


def get_global_shap_feature_importance(global_explain: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Convert stored global SHAP summary into a sorted list of feature importances.

    The training pipeline stores:
    - feature_names: list[str]
    - mean_abs_shap: np.ndarray (n_features,)
    - rf_feature_importances: np.ndarray (n_features,)
    """
    feature_names = global_explain["feature_names"]
    mean_abs_shap = np.asarray(global_explain["mean_abs_shap"])
    rf_importances = np.asarray(global_explain["rf_feature_importances"])

    items: List[Dict[str, Any]] = []
    for name, shap_val, rf_val in zip(feature_names, mean_abs_shap, rf_importances):
        items.append(
            {
                "feature": name,
                "mean_abs_shap": float(shap_val),
                "rf_importance": float(rf_val),
            }
        )

    # Sort descending by SHAP importance
    items.sort(key=lambda x: x["mean_abs_shap"], reverse=True)
    return items


def get_local_shap_explanation(
    shap_explainer: Any, instance_df: pd.DataFrame
) -> Dict[str, Any]:
    """
    Compute local SHAP values for a single instance.

    Returns a dict with the base value and per-feature contribution values.
    """
    shap_values = shap_explainer.shap_values(instance_df)
    shap_values = np.array(shap_values)[0]  # (n_features,)

    base_value = float(np.array(shap_explainer.expected_value))

    per_feature = []
    for feature, value in zip(instance_df.columns, shap_values):
        per_feature.append(
            {
                "feature": feature,
                "value": float(value),
            }
        )

    return {
        "base_value": base_value,
        "per_feature": per_feature,
    }

