import { useEffect, useState } from "react";
import { api } from "../lib/api";
import PageHeader from "../components/PageHeader";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";

const OUTCOMES = ["Verified", "Discrepancy Found", "Unable to Locate"];

function isOverdue(inspection) {
  return (
    new Date(inspection.inspectionDeadline) < new Date() &&
    inspection.status !== "Completed"
  );
}

export default function FieldInspections() {
  const [inspections, setInspections] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  function load() {
    setLoading(true);
    api
      .getInspections()
      .then(setInspections)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function recordOutcome(id, outcome) {
    try {
      await api.recordOutcome(id, outcome);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const visible = inspections.filter((i) => {
    if (filter === "overdue") return isOverdue(i);
    if (filter === "completed") return i.status === "Completed";
    return true;
  });

  return (
    <div>
      <PageHeader
        eyebrow="Module 3 — Feature 1"
        title="Field Inspection Assignment Center"
        description="Applications requiring physical verification, assigned to officers with a tracked deadline and outcome."
      />

      {error && <ErrorState message={error} />}

      <div className="flex gap-2 mb-5">
        {[
          { key: "all", label: "All" },
          { key: "overdue", label: "Overdue" },
          { key: "completed", label: "Completed" }
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs rounded-sm px-3 py-1.5 border transition-colors ${
              filter === f.key
                ? "bg-forest-600 text-parchment border-forest-600"
                : "border-forest-200 hover:bg-forest-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && !error && (
        <p className="text-sm text-slate-500">Loading inspections…</p>
      )}
      {!loading && visible.length === 0 && !error && (
        <EmptyState message="No inspections match this filter." />
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {visible.map((insp) => (
          <div key={insp._id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-slate-500">{insp.caseId}</p>
                <p className="font-display text-lg">{insp.applicantName}</p>
                <p className="text-sm text-slate-500">{insp.scheme}</p>
              </div>
              <StatusBadge value={isOverdue(insp) ? "Overdue" : insp.status} />
            </div>

            <dl className="mt-3 text-sm space-y-1">
              <div className="flex justify-between">
                <dt className="text-slate-500">Officer</dt>
                <dd>{insp.assignedOfficer}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Deadline</dt>
                <dd className="font-mono">
                  {new Date(insp.inspectionDeadline).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Visit outcome</dt>
                <dd>{insp.visitOutcome}</dd>
              </div>
            </dl>

            {insp.status !== "Completed" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {OUTCOMES.map((o) => (
                  <button
                    key={o}
                    onClick={() => recordOutcome(insp._id, o)}
                    className="text-xs rounded-sm border border-forest-300 px-3 py-1.5 hover:bg-forest-100 transition-colors"
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
