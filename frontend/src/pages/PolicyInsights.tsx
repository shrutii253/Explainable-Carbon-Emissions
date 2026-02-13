import { useEffect, useState } from "react";
import { fetchPolicyInsights, PolicyInsight } from "../services/api";

export function PolicyInsightsPage() {
  const [insights, setInsights] = useState<PolicyInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchPolicyInsights();
        if (!mounted) return;
        setInsights(data);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Unable to load policy insights.");
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
            Policy-Oriented Insights
          </h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Translate model behavior into interpretable narratives for sustainable decision-making.
          </p>
        </div>
      </section>

      {loading && (
        <div className="glass-card flex items-center justify-center p-10 text-sm text-slate-400">
          Deriving policy narratives from global feature behavior…
        </div>
      )}

      {error && !loading && (
        <div className="glass-card border border-rose-500/40 bg-rose-950/50 p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      {!loading && !error && (
        <section className="grid gap-4 md:grid-cols-2">
          {insights.map((insight, idx) => (
            <article key={idx} className="glass-card relative overflow-hidden p-5">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-sky-500/5" />
              <div className="relative space-y-2">
                <h3 className="text-sm font-semibold text-slate-50">
                  {insight.title}
                </h3>
                <p className="text-xs text-slate-300">{insight.description}</p>
                <p className="text-[0.7rem] text-slate-400">
                  <span className="font-semibold text-emerald-300">Model rationale: </span>
                  {insight.rationale}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

