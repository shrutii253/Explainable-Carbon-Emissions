interface MetricCardProps {
  label: string;
  value: number | string;
  formatter?: (value: number | string) => string;
  accent?: "green" | "blue" | "purple";
}

const accentMap = {
  green: "from-emerald-400/80 to-emerald-500/90",
  blue: "from-sky-400/80 to-sky-500/90",
  purple: "from-fuchsia-400/80 to-fuchsia-500/90"
};

export function MetricCard({ label, value, formatter, accent = "green" }: MetricCardProps) {
  const gradient = accentMap[accent];
  const display = typeof value === "number" ? (formatter ? formatter(value) : value.toFixed(3)) : value;

  return (
    <article className="glass-card smooth-transition group relative overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent opacity-40" />
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="text-2xl font-semibold text-slate-50">{display}</div>
        <div
          className={`h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br ${gradient} opacity-80 shadow-lg shadow-emerald-500/40 group-hover:opacity-100`}
        />
      </div>
    </article>
  );
}

