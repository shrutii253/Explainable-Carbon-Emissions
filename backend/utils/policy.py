from __future__ import annotations

from typing import Any, Dict, List

import numpy as np
import pandas as pd


def generate_policy_insights(
    global_explain: Dict[str, Any],
    X_train: pd.DataFrame,
    y_train: pd.Series,
) -> List[Dict[str, str]]:
    """
    Generate human-readable policy insights based on model behavior.

    This function combines domain heuristics with simple statistics from
    the training data to produce text suitable for the Policy Insights page.
    """
    feature_names = global_explain["feature_names"]
    mean_abs_shap = np.asarray(global_explain["mean_abs_shap"])

    importance_map = dict(zip(feature_names, mean_abs_shap))

    insights: List[Dict[str, str]] = []

    # 1. High energy consumption → increases emissions
    if importance_map.get("energy_consumption", 0) > 0:
        q75 = float(X_train["energy_consumption"].quantile(0.75))
        insights.append(
            {
                "title": "High energy consumption strongly drives emissions",
                "description": (
                    "Scenarios with higher total energy consumption lead to "
                    "significantly higher predicted CO₂ emissions in the model."
                ),
                "rationale": (
                    f"The model assigns high importance to energy consumption, and values "
                    f"above roughly {q75:,.0f} units mark a regime where emissions grow rapidly."
                ),
            }
        )

    # 2. High renewable share → decreases emissions
    if importance_map.get("renewable_share", 0) > 0:
        q25 = float(X_train["renewable_share"].quantile(0.25))
        q75 = float(X_train["renewable_share"].quantile(0.75))
        insights.append(
            {
                "title": "Increasing renewable share reduces emissions",
                "description": (
                    "Higher shares of renewable energy are associated with lower CO₂ "
                    "emissions in the model's forecasts."
                ),
                "rationale": (
                    "Renewable share is an important protective feature. Moving from low "
                    f"levels (~{q25:.1f}%) to higher levels (~{q75:.1f}%) meaningfully "
                    "reduces predicted emissions for otherwise similar scenarios."
                ),
            }
        )

    # 3. Industrial output threshold effects
    if importance_map.get("industrial_output", 0) > 0:
        q50 = float(X_train["industrial_output"].median())
        q90 = float(X_train["industrial_output"].quantile(0.9))
        insights.append(
            {
                "title": "Industrial output exhibits threshold emission effects",
                "description": (
                    "The model suggests that emissions start accelerating once "
                    "industrial output passes certain thresholds."
                ),
                "rationale": (
                    f"Predicted emissions at very high industrial output (above ~{q90:,.0f}) "
                    f"grow faster than around median levels (~{q50:,.0f}), indicating "
                    "non-linear escalation at the upper end of industrial activity."
                ),
            }
        )

    # 4. Transportation intensity
    if importance_map.get("vehicle_count", 0) > 0 or importance_map.get("fuel_consumption", 0) > 0:
        insights.append(
            {
                "title": "Transport intensity is a major emissions lever",
                "description": (
                    "Higher vehicle fleets and worse fuel efficiency significantly "
                    "increase projected CO₂ emissions."
                ),
                "rationale": (
                    "Vehicle count and fuel consumption receive substantial importance scores, "
                    "highlighting that policies targeting fleet efficiency and modal shifts "
                    "can have outsized impact."
                ),
            }
        )

    # 5. Energy intensity and efficiency
    if importance_map.get("energy_intensity", 0) > 0:
        insights.append(
            {
                "title": "Reducing energy intensity improves industrial efficiency",
                "description": (
                    "Lower energy used per unit of industrial output is associated with "
                    "lower emissions for the same economic activity."
                ),
                "rationale": (
                    "Energy intensity emerges as a key engineered feature. Improving process "
                    "efficiency means more output per unit of energy, dampening emission growth."
                ),
            }
        )

    return insights

