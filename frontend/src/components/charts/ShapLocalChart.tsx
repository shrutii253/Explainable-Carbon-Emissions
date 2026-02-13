import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { ShapFeatureContribution } from "../../services/api";

interface Props {
  contributions: ShapFeatureContribution[];
}

export function ShapLocalChart({ contributions }: Props) {
  const data = contributions.map((c) => ({
    feature: c.feature.replace(/_/g, " "),
    value: c.value
  }));

  return (
    <section className="glass-card p-5">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-slate-100">
          SHAP Local Contributions
        </h2>
        <p className="text-xs text-slate-400">
          Per-feature impact on this prediction relative to the model baseline.
        </p>
      </header>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 120, right: 16, top: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis type="number" tick={{ fill: "#cbd5f5", fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="feature"
              width={140}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderRadius: 10,
                border: "1px solid #1f2937",
                color: "#e5e7eb"
              }}
            />
            <Bar
              dataKey="value"
              radius={[6, 6, 6, 6]}
              fill="url(#shapLocalGradient)"
            />
            <defs>
              <linearGradient id="shapLocalGradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

