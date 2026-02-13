from __future__ import annotations

from typing import Any, Dict, List

import numpy as np


def get_local_lime_explanation(
    lime_explainer: Any,
    model_predict_fn,
    instance: np.ndarray,
    num_features: int = 10,
) -> Dict[str, Any]:
    """
    Generate a LIME explanation for a single instance.

    Returns a dict containing:
    - intercept
    - predicted_value
    - local_prediction (intercept + sum(weights))
    - contributions: list of {feature, weight, effect}
    """
    explanation = lime_explainer.explain_instance(
        data_row=instance,
        predict_fn=model_predict_fn,
        num_features=num_features,
    )

    # For robustness across LIME versions, avoid relying on internal
    # intercept attributes which may change type (scalar, array, dict).
    # Instead, compute the model prediction directly and infer an
    # effective intercept from the explanation weights.
    prediction = float(model_predict_fn(instance.reshape(1, -1))[0])

    pairs = explanation.as_list()
    contributions: List[Dict[str, Any]] = []
    total_weight = 0.0

    for feature_desc, weight in pairs:
        w = float(weight)
        total_weight += w
        contributions.append(
            {
                "feature": feature_desc,
                "weight": w,
                "effect": "positive" if w >= 0 else "negative",
            }
        )

    # Effective local prediction and intercept consistent with the weights
    local_pred = prediction
    intercept = float(local_pred - total_weight)

    return {
        "intercept": intercept,
        "predicted_value": prediction,
        "local_prediction": float(local_pred),
        "contributions": contributions,
    }

