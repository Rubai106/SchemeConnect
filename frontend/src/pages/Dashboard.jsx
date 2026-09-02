import { useEffect, useState } from "react";
import { api } from "../lib/api";
import PageHeader from "../components/PageHeader";
import ErrorState from "../components/ErrorState";

function StatCard({ label, value, tone = "forest" }) {
  const toneClasses = {
    forest: "text-forest-600",
    amber: "text-amber",
    clay: "text-clay"
  };
  return (
    <div className="card px-5 py-5">
      <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">
        {label}
      </p>
      <p className={`font-display text-4xl ${toneClasses[tone]}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDashboardSummary(), api.getOfficerPerformance()])
      .then(([s, o]) => {
        setSummary(s);
        setOfficers(o);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Module 3 — Feature 2"
        title="Verification Operations Dashboard"
        description="A live read on pending cases, overdue field inspections, and how each officer's workload is tracking."
      />

      {error && <ErrorState message={error} />}
      {loading && !error && (
        <p className="text-sm text-slate-500">Loading dashboard…</p>
      )}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Pending Cases" value={summary.pendingCases} />
          <StatCard
            label="Overdue Inspections"
            value={summary.overdueInspections}
            tone="clay"
          />
          <StatCard label="Total Inspections" value={summary.totalInspections} />
          <StatCard
            label="Completed Inspections"
            value={summary.completedInspections}
            tone="amber"
          />
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-forest-100 bg-forest-50/50">
          <h3 className="font-display text-lg text-forest-700">
            Officer performance
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-mono">
              <th className="px-5 py-3 font-medium">Officer</th>
              <th className="px-5 py-3 font-medium">Assigned</th>
              <th className="px-5 py-3 font-medium">Completed</th>
              <th className="px-5 py-3 font-medium">Overdue</th>
              <th className="px-5 py-3 font-medium">Completion Rate</th>
            </tr>
          </thead>
          <tbody>
            {officers.map((o) => (
              <tr key={o.officer} className="ledger-row">
                <td className="px-5 py-3 font-medium">{o.officer}</td>
                <td className="px-5 py-3 font-mono">{o.totalAssigned}</td>
                <td className="px-5 py-3 font-mono text-forest-600">
                  {o.completed}
                </td>
                <td className="px-5 py-3 font-mono text-clay">{o.overdue}</td>
                <td className="px-5 py-3 font-mono">{o.completionRate}%</td>
              </tr>
            ))}
            {officers.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                  No officer data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
