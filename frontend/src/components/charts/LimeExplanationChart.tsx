import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { LimeContribution } from "../../services/api";

interface Props {
  contributions: LimeContribution[];
}

export function LimeExplanationChart({ contributions }: Props) {
  const data = contributions.map((c) => ({
    feature: c.feature,
    weight: c.weight,
    color: c.effect === "positive" ? "#22c55e" : "#f97316"
  }));

  return (
    <section className="glass-card p-5">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-slate-100">
          LIME Local Explanation
        </h2>
        <p className="text-xs text-slate-400">
          Positive (green) and negative (orange) contributions for this scenario.
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
            <Bar dataKey="weight" radius={[6, 6, 6, 6]}>
              {data.map((entry, index) => (
                <React.Fragment key={`cell-${index}`}>
                  {/* Recharts Cell element is typed but imported via Bar children */}
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-ignore */}
                  <Cell fill={entry.color} />
                </React.Fragment>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

