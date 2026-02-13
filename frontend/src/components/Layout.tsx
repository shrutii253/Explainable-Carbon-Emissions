import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/predict", label: "Prediction" },
  { to: "/policy", label: "Policy Insights" }
];

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 smooth-transition">
      <header className="border-b border-slate-800/70 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/20 ring-1 ring-primary-400/40">
              <span className="text-lg font-semibold text-primary-300">CO₂</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
                Explainable Carbon Emissions
              </h1>
              <p className="text-xs text-slate-400">
                Random Forest · SHAP · LIME
              </p>
            </div>
          </div>
          <nav className="flex gap-2 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "rounded-full px-4 py-2 font-medium smooth-transition",
                    isActive
                      ? "bg-primary-500 text-slate-950 shadow-lg shadow-primary-500/40"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-slate-50"
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-10 pt-6">
        <Outlet />
      </main>
    </div>
  );
}

