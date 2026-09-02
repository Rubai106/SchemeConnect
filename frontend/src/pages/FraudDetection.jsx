import { useEffect, useState } from "react";
import { api } from "../lib/api";
import PageHeader from "../components/PageHeader";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";

export default function FraudDetection() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [reopenedId, setReopenedId] = useState(null);

  function load() {
    setLoading(true);
    api
      .getFlaggedApplications()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function decide(id, decision) {
    setBusyId(id);
    try {
      await api.decideFlaggedApplication(id, decision);
      setReopenedId(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function analyze(id) {
    setBusyId(id);
    try {
      await api.analyzeFlaggedApplication(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Module 1 — Feature 2"
        title="AI Fraud & Duplicate Detection"
        description="Flagged applications with an AI-generated risk explanation. The decision is always made by a human officer."
      />

      {error && <ErrorState message={error} />}
      {loading && !error && (
        <p className="text-sm text-slate-500">Loading flagged applications…</p>
      )}

      {!loading && items.length === 0 && !error && (
        <EmptyState message="No applications are currently flagged." />
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item._id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg">{item.applicantName}</p>
                <p className="text-sm text-slate-500">{item.scheme}</p>
              </div>
              <StatusBadge value={item.riskLevel} />
            </div>

            <p className="mt-3 text-sm text-slate-600">
              <span className="font-medium text-slate-ink">Flag reason: </span>
              {item.reason}
            </p>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {item.aiExplanation}
            </p>
            <button
              disabled={busyId === item._id}
              onClick={() => analyze(item._id)}
              className="mt-2 text-xs text-forest-600 underline decoration-dotted hover:text-forest-700 disabled:opacity-50"
            >
              {busyId === item._id ? "Analyzing…" : "Re-analyze with AI"}
            </button>

            {item.comparison && (
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="rounded-sm border border-forest-100 bg-forest-50/50 px-3 py-2">
                  A — {item.comparison.applicationA}
                </div>
                <div className="rounded-sm border border-forest-100 bg-forest-50/50 px-3 py-2">
                  B — {item.comparison.applicationB}
                </div>
              </div>
            )}

            {item.decision && item.decision !== "Pending" && reopenedId !== item._id ? (
              <div className="mt-4 flex items-center gap-3">
                <StatusBadge value={item.decision} />
                <button
                  onClick={() => setReopenedId(item._id)}
                  className="text-xs text-forest-600 underline decoration-dotted hover:text-forest-700"
                >
                  Change decision
                </button>
              </div>
            ) : (
              <div className="mt-4 flex gap-2">
                <button
                  disabled={busyId === item._id}
                  onClick={() => decide(item._id, "Approved")}
                  className="rounded-sm bg-forest-600 text-parchment text-sm px-4 py-2 hover:bg-forest-700 disabled:opacity-50 transition-colors"
                >
                  Approve
                </button>
                <button
                  disabled={busyId === item._id}
                  onClick={() => decide(item._id, "Rejected")}
                  className="rounded-sm border border-clay text-clay text-sm px-4 py-2 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  Reject
                </button>
                <button
                  disabled={busyId === item._id}
                  onClick={() => decide(item._id, "Escalated")}
                  className="rounded-sm border border-amber text-amber text-sm px-4 py-2 hover:bg-amber-50 disabled:opacity-50 transition-colors"
                >
                  Escalate
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
