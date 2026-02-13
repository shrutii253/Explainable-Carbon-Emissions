import { useEffect, useState } from "react";
import { FeatureImportanceChart } from "../components/charts/FeatureImportanceChart";
import { PredictionTrendChart } from "../components/charts/PredictionTrendChart";
import { UserPredictionTrendChart } from "../components/charts/UserPredictionTrendChart";
import { MetricCard } from "../components/MetricCard";
import {
  fetchFeatureImportance,
  fetchMetrics,
  fetchBaselineMetrics,
  fetchPredictionTrend,
  FeatureImportanceItem,
  Metrics,
  TrendPoint
} from "../services/api";

export function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [baselineMetrics, setBaselineMetrics] = useState<Metrics | null>(null);
  const [importance, setImportance] = useState<FeatureImportanceItem[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // Load core RF metrics + explainability first
        const [m, imp, tr] = await Promise.all([
          fetchMetrics(),
          fetchFeatureImportance(),
          fetchPredictionTrend(80)
        ]);
        if (!mounted) return;
        setMetrics(m);
        setImportance(imp);
        setTrend(tr);

        // Load baseline metrics best-effort; failures should not break the dashboard.
        try {
          const mBaseline = await fetchBaselineMetrics();
          if (mounted) {
            setBaselineMetrics(mBaseline);
          }
        } catch (baselineErr) {
          console.warn("Baseline metrics unavailable:", baselineErr);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load core dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">
            Model Overview
          </h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Evaluate Random Forest performance and understand which features most strongly drive
            forecasted CO₂ emissions.
          </p>
        </div>
        <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-medium text-emerald-300">
          Explainable Mode · SHAP + LIME
        </div>
      </section>

      {loading && (
        <div className="glass-card flex items-center justify-center p-10 text-sm text-slate-400">
          Computing model metrics and explainability summaries…
        </div>
      )}

      {error && !loading && !metrics && (
        <div className="glass-card border border-rose-500/40 bg-rose-950/50 p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      {!loading && metrics && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="R² · Random Forest"
              value={metrics.r2}
              accent="green"
              formatter={(v) => Number(v).toFixed(3)}
            />
            <MetricCard
              label="RMSE · Random Forest"
              value={metrics.rmse}
              accent="blue"
              formatter={(v) => Number(v).toFixed(2)}
            />
            <MetricCard
              label="MAE · Random Forest"
              value={metrics.mae}
              accent="purple"
              formatter={(v) => Number(v).toFixed(2)}
            />
          </section>

          {baselineMetrics && (
            <section className="grid gap-4 md:grid-cols-3">
              <MetricCard
                label="R² · Linear Regression"
                value={baselineMetrics.r2}
                accent="green"
                formatter={(v) => Number(v).toFixed(3)}
              />
              <MetricCard
                label="RMSE · Linear Regression"
                value={baselineMetrics.rmse}
                accent="blue"
                formatter={(v) => Number(v).toFixed(2)}
              />
              <MetricCard
                label="MAE · Linear Regression"
                value={baselineMetrics.mae}
                accent="purple"
                formatter={(v) => Number(v).toFixed(2)}
              />
            </section>
          )}

          <section className="grid gap-4 lg:grid-cols-2">
            <FeatureImportanceChart data={importance} />
            <PredictionTrendChart points={trend} />
          </section>

          <UserPredictionTrendChart />
        </>
      )}
    </div>
  );
}

