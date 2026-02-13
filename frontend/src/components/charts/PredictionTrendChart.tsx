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
import type { TrendPoint } from "../../services/api";

interface Props {
  points: TrendPoint[];
}

export function PredictionTrendChart({ points }: Props) {
  return (
    <section className="glass-card p-5">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-slate-100">
          Prediction vs Actual Trend
        </h2>
        <p className="text-xs text-slate-400">
          Comparison of model predictions against observed emissions on sample scenarios.
        </p>
      </header>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="index"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickLine={false}
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
              dataKey="true_value"
              name="Observed"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="predicted_value"
              name="Predicted"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

