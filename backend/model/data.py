import numpy as np
import pandas as pd


def generate_synthetic_emission_data(
    n_samples: int = 1000, random_state: int = 42
) -> pd.DataFrame:
    """
    Generate a synthetic dataset for CO2 emission forecasting.

    The dataset contains socioeconomic, energy/technical, and engineered features
    designed to roughly mimic realistic relationships. A ground-truth CO2 emission
    target is constructed from these features with added noise.
    """
    rng = np.random.default_rng(random_state)

    # Socioeconomic features
    gdp_per_capita = rng.uniform(5_000, 80_000, n_samples)
    industrial_output = rng.uniform(10_000, 300_000, n_samples)
    population = rng.uniform(100_000, 100_000_000, n_samples)
    vehicle_count = rng.uniform(10_000, 5_000_000, n_samples)

    # Energy & technical features
    # Energy consumption is correlated with industrial output and population
    base_energy = (
        0.02 * industrial_output
        + 0.0005 * population
        + rng.normal(0, 5_000, n_samples)
    )
    energy_consumption = np.clip(base_energy, 20_000, None)

    renewable_share = rng.uniform(5, 70, n_samples)  # percentage of renewables
    engine_size = rng.uniform(1.0, 5.0, n_samples)  # liters
    fuel_consumption = rng.uniform(3.0, 15.0, n_samples)  # L / 100km
    cylinders = rng.choice([3, 4, 6, 8, 10, 12], size=n_samples, p=[0.05, 0.45, 0.25, 0.2, 0.03, 0.02])

    # Engineered features
    energy_intensity = energy_consumption / industrial_output  # energy per unit output
    gdp_energy_interaction = gdp_per_capita * energy_consumption

    # Construct synthetic CO2 emissions target.
    # Positive contributors
    emission = (
        0.000015 * energy_consumption
        + 0.0000004 * industrial_output
        + 0.00000008 * population
        + 0.35 * fuel_consumption
        + 0.000001 * vehicle_count
        + 0.6 * engine_size
        + 0.08 * cylinders
        + 8.0 * energy_intensity
        + 1e-10 * gdp_energy_interaction
    )

    # Negative effect of renewable share (more renewables, less emissions)
    emission -= 0.4 * renewable_share

    # Non-linear saturation for very high industrial output (diminishing returns)
    high_industrial_mask = industrial_output > 200_000
    emission[high_industrial_mask] += 0.0000002 * (industrial_output[high_industrial_mask] - 200_000) ** 0.7

    # Add random noise
    noise = rng.normal(0, 15.0, n_samples)
    emission = np.clip(emission + noise, a_min=0, a_max=None)

    data = pd.DataFrame(
        {
            "gdp_per_capita": gdp_per_capita,
            "industrial_output": industrial_output,
            "population": population,
            "vehicle_count": vehicle_count,
            "energy_consumption": energy_consumption,
            "renewable_share": renewable_share,
            "engine_size": engine_size,
            "fuel_consumption": fuel_consumption,
            "cylinders": cylinders,
            "energy_intensity": energy_intensity,
            "gdp_energy_interaction": gdp_energy_interaction,
            "co2_emissions": emission,
        }
    )

    return data

