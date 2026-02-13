## Explainable Carbon Emission Forecasting Web Application

This project implements full‑stack application based on the paper
**“Explainable Carbon Emission Forecasting for Sustainable Decision‑Making”**.

It combines a **Random Forest Regressor** with **SHAP** and **LIME** for explainability and exposes
an interactive React dashboard for exploring scenarios and policy‑relevant insights.

---

### Features

- **RandomForestRegressor** (200 estimators, 80/20 split, 5‑fold CV)
- Synthetic dataset capturing:
  - Socioeconomic: GDP per capita, industrial output, population, vehicle count
  - Energy & technical: energy consumption, renewable share, engine size, fuel consumption, cylinders
  - Engineered: energy intensity, GDP–energy interaction
- **Explainability layer**
  - Global: SHAP mean |value| feature importance
  - Local: SHAP per‑instance contributions
  - Local: LIME per‑instance contributions (positive vs negative)
- **FastAPI backend**
  - `POST /predict` – prediction + SHAP + LIME for a scenario
  - `GET /metrics` – R², RMSE, MAE, CV MAE
  - `GET /feature-importance` – global SHAP + RF importances
  - `GET /prediction-trend` – predicted vs true sample trend
  - `GET /policy-insights` – narrative policy insights
- **React (Vite) frontend**
  - Dashboard: metrics, feature importance, prediction trend
  - Prediction: interactive form + SHAP & LIME local explanations
  - Policy insights: auto‑generated narratives derived from model behavior
  - TailwindCSS environmental dark theme, card layout, responsive design

---

### Project Structure

```text
backend/
  main.py                 # FastAPI app & routes
  model/
    data.py               # Synthetic data generator
    train_model.py        # RF training, metrics, global SHAP
    registry.py           # Lazy artifact loader + SHAP/LIME initialisation
  explainability/
    shap_service.py       # SHAP global & local helpers
    lime_service.py       # LIME local helper
  utils/
    schemas.py            # Pydantic API schemas
    policy.py             # Policy insight generation

frontend/
  index.html
  vite.config.ts
  tailwind.config.cjs
  postcss.config.cjs
  tsconfig.json
  src/
    main.tsx              # React/Vite entry
    App.tsx               # Routing
    index.css             # Tailwind + global styles
    services/api.ts       # Axios client + typed DTOs
    components/
      Layout.tsx          # Shell + navigation
      MetricCard.tsx
      charts/
        FeatureImportanceChart.tsx
        LimeExplanationChart.tsx
        ShapLocalChart.tsx
        PredictionTrendChart.tsx
    pages/
      Dashboard.tsx
      Prediction.tsx
      PolicyInsights.tsx
```

---

### Backend Setup

1. **Create and activate a virtual environment (recommended)**

```bash
cd backend/..
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Run the FastAPI server (training happens on first startup)**

```bash
uvicorn backend.main:app --reload
```

The app will:

- Generate a synthetic dataset
- Train the RandomForestRegressor (200 trees, 5‑fold CV)
- Persist the model and explainability artifacts under `backend/model/artifacts/`

The API will be available at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`.

---

### Frontend Setup

1. **Install Node dependencies**

```bash
cd frontend
npm install
```

2. **(Optional) Set a custom API URL**

Create a `.env` file in `frontend` if you are not using the default:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

3. **Run the dev server**

```bash
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

---

### Using the Application

- **Dashboard**
  - Inspect R², RMSE, and MAE on the held‑out test split.
  - Explore global SHAP feature importance to see which drivers most affect emissions.
  - Compare predicted vs true emissions on a sample of training scenarios.

- **Prediction**
  - Enter a hypothetical scenario (GDP per capita, energy mix, fleet characteristics, etc.).
  - Get a point forecast of CO₂ emissions from the Random Forest model.
  - View **LIME** contributions (positive vs negative bars) and **SHAP** per‑feature impacts.

- **Policy Insights**
  - Read narrative bullet insights such as:
    - High energy consumption → increases emissions
    - Higher renewable share → decreases emissions
    - Threshold effects at very high industrial output

---

### Notes & Extensibility

- The dataset is generated synthetically in `backend/model/data.py` but structured to resemble
  realistic socioeconomic and energy drivers.
- Engineered features (energy intensity, GDP–energy interaction) are computed consistently in both
  training and inference to avoid leakage or schema mismatch.
- The codebase is modular:
  - ML training is isolated under `backend/model/`
  - Explainability utilities live under `backend/explainability/`
  - API schemas and policy logic live under `backend/utils/`
  - Frontend concerns are split into `pages/`, `components/`, and `services/`

Potential extensions (not implemented by default):

- Batch CSV upload for scenario scoring
- Downloadable PDF reports
- Toggle between baseline models (e.g., Linear Regression vs Random Forest)
- Richer SHAP visualizations (force plots, dependence plots) exported as images

