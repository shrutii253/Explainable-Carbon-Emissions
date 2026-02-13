import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { FeatureImportanceItem } from "../../services/api";

interface Props {
  data: FeatureImportanceItem[];
  title?: string;
}

export function FeatureImportanceChart({ data, title }: Props) {
  const chartData = data.map((d) => ({
    feature: d.feature.replace(/_/g, " "),
    mean_abs_shap: d.mean_abs_shap
  }));

  return (
    <section className="glass-card p-5">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            {title ?? "Global Feature Importance (SHAP)"}
          </h2>
          <p className="text-xs text-slate-400">
            Features ranked by mean absolute SHAP value.
          </p>
        </div>
      </header>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 80, top: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis type="number" tick={{ fill: "#cbd5f5", fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="feature"
              width={110}
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
              dataKey="mean_abs_shap"
              fill="url(#shapGradient)"
              radius={[6, 6, 6, 6]}
            />
            <defs>
              <linearGradient id="shapGradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

