import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { usePredictionHistory } from "../../context/PredictionHistoryContext";

export function UserPredictionTrendChart() {
  const { predictions } = usePredictionHistory();

  if (!predictions.length) {
    return (
      <section className="glass-card p-5">
        <header className="mb-2">
          <h2 className="text-sm font-semibold text-slate-100">
            Recent Scenario Predictions
          </h2>
          <p className="text-xs text-slate-400">
            Run predictions on the Scenario Explorer page to see them tracked over time.
          </p>
        </header>
        <div className="flex h-32 items-center justify-center text-xs text-slate-500">
          No scenario predictions yet.
        </div>
      </section>
    );
  }

  const data = predictions.map((p, idx) => ({
    index: idx + 1,
    explainable: p.mode === "explainable" ? p.value : null,
    baseline: p.mode === "baseline" ? p.value : null
  }));

  return (
    <section className="glass-card p-5">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-slate-100">
          Recent Scenario Predictions
        </h2>
        <p className="text-xs text-slate-400">
          Comparison of your latest explainable and baseline forecasts in the order they were run.
        </p>
      </header>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="index"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickLine={false}
              label={{ value: "Prediction index", position: "insideBottomRight", offset: -4, fill: "#64748b", fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderRadius: 10,
                border: "1px solid #1f2937",
                color: "#e5e7eb"
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="explainable"
              name="Explainable (RF)"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="baseline"
              name="Baseline (Linear Reg.)"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

