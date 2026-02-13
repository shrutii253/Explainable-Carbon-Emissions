import { FormEvent, useState } from "react";
import { LimeExplanationChart } from "../components/charts/LimeExplanationChart";
import { ShapLocalChart } from "../components/charts/ShapLocalChart";
import {
  EmissionFeaturesPayload,
  LimeExplanation,
  PredictResponse,
  ShapExplanation,
  predictEmission,
  BaselinePredictResponse,
  predictBaselineEmission
} from "../services/api";
import { usePredictionHistory } from "../context/PredictionHistoryContext";

const defaultValues: EmissionFeaturesPayload = {
  gdp_per_capita: 32000,
  industrial_output: 120000,
  population: 4_000_000,
  vehicle_count: 350_000,
  energy_consumption: 80_000,
  renewable_share: 25,
  engine_size: 2.0,
  fuel_consumption: 7.5,
  cylinders: 4
};

export function PredictionPage() {
  const [form, setForm] = useState<EmissionFeaturesPayload>(defaultValues);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [baselineResult, setBaselineResult] = useState<BaselinePredictResponse | null>(null);
  const [mode, setMode] = useState<"explainable" | "baseline">("explainable");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addPrediction } = usePredictionHistory();

  const handleChange = (key: keyof EmissionFeaturesPayload) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "explainable") {
        const res = await predictEmission(form);
        setResult(res);
        addPrediction("explainable", res.prediction);
      } else {
        const res = await predictBaselineEmission(form);
        setBaselineResult(res);
        addPrediction("baseline", res.prediction);
      }
    } catch (err) {
      console.error(err);
      setError("Prediction failed. Please check the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const lime: LimeExplanation | undefined = result?.lime_explanation;
  const shap: ShapExplanation | undefined = result?.shap_values;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">
            Scenario Explorer
          </h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Simulate socioeconomic and energy scenarios to forecast CO₂ emissions and understand
            the drivers behind each prediction.
          </p>
        </div>
        <div className="glass-card flex items-center gap-2 px-3 py-2 text-xs">
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-slate-400">
            Mode
          </span>
          <div className="inline-flex rounded-full bg-slate-900/70 p-1">
            <button
              type="button"
              onClick={() => setMode("explainable")}
              className={`rounded-full px-3 py-1 text-[0.7rem] font-medium ${
                mode === "explainable"
                  ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/50"
                  : "text-slate-300 hover:text-slate-50"
              }`}
            >
              Explainable (RF + SHAP/LIME)
            </button>
            <button
              type="button"
              onClick={() => setMode("baseline")}
              className={`rounded-full px-3 py-1 text-[0.7rem] font-medium ${
                mode === "baseline"
                  ? "bg-slate-700 text-slate-50"
                  : "text-slate-300 hover:text-slate-50"
              }`}
            >
              Model-only (Linear Reg.)
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1.8fr)]">
        <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4">
          <header className="mb-2">
            <h3 className="text-sm font-semibold text-slate-100">Input configuration</h3>
            <p className="text-xs text-slate-400">
              Adjust inputs to explore alternative futures and policy levers.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            {(
              [
                ["gdp_per_capita", "GDP per capita (USD)"],
                ["industrial_output", "Industrial output"],
                ["population", "Population"],
                ["vehicle_count", "Vehicle count"],
                ["energy_consumption", "Energy consumption"],
                ["renewable_share", "Renewable share (%)"],
                ["engine_size", "Engine size (L)"],
                ["fuel_consumption", "Fuel consumption (L/100km)"],
                ["cylinders", "Number of cylinders"]
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="space-y-1">
                <span className="block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-slate-400">
                  {label}
                </span>
                <input
                  type="number"
                  step="any"
                  value={form[key]}
                  onChange={handleChange(key)}
                  className="w-full rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-xs text-slate-50 outline-none ring-emerald-500/50 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2"
                />
              </label>
            ))}
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/50 bg-rose-950/60 px-3 py-2 text-xs text-rose-100">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-slate-200"
              onClick={() => setForm(defaultValues)}
            >
              Reset to baseline
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "Predicting…" : "Predict Emission"}
            </button>
          </div>

          {(mode === "explainable" && result) || (mode === "baseline" && baselineResult) ? (
            <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-3 text-xs">
              <div className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Predicted CO₂ emissions ·{" "}
                {mode === "explainable" ? "Random Forest (Explainable)" : "Linear Regression (Baseline)"}
              </div>
              <div className="mt-1 text-xl font-semibold text-emerald-200">
                {(mode === "explainable"
                  ? result?.prediction.toFixed(2)
                  : baselineResult?.prediction.toFixed(2)) ?? "--"}{" "}
                units
              </div>
              {mode === "explainable" && lime && (
                <p className="mt-1 text-[0.7rem] text-emerald-200/80">
                  Local LIME prediction:{" "}
                  <span className="font-semibold">
                    {lime.local_prediction.toFixed(2)}
                  </span>{" "}
                  (model output {lime.predicted_value.toFixed(2)}).
                </p>
              )}
              {mode === "baseline" && (
                <p className="mt-1 text-[0.7rem] text-emerald-200/80">
                  Linear Regression baseline is model-only in this demo; per-feature SHAP/LIME
                  explanations are available in Explainable mode.
                </p>
              )}
            </div>
          ) : null}
        </form>

        <div className="space-y-4">
          {mode === "baseline" && (
            <div className="glass-card flex h-full items-center justify-center p-6 text-sm text-slate-400">
              <p className="max-w-md text-center">
                Model-only baseline is currently active. Switch back to{" "}
                <button
                  type="button"
                  onClick={() => setMode("explainable")}
                  className="font-semibold text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
                >
                  Explainable
                </button>{" "}
                mode to visualize SHAP and LIME contributions for this scenario.
              </p>
            </div>
          )}
          {mode === "explainable" && !result && (
            <div className="glass-card flex h-full items-center justify-center p-6 text-sm text-slate-400">
              Run a prediction to see SHAP and LIME explanations for this specific scenario.
            </div>
          )}
          {mode === "explainable" && result && (
            <>
              {lime && <LimeExplanationChart contributions={lime.contributions} />}
              {shap && <ShapLocalChart contributions={shap.per_feature} />}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

