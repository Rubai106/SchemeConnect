import { useEffect, useState } from "react";
import { api } from "../lib/api";
import PageHeader from "../components/PageHeader";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";

const STATUSES = ["Assigned", "Under review", "Verified"];
const NOTE_TYPES = ["Finding", "Clarification Request", "Comment"];

const TYPE_STYLES = {
  "Status Change": "text-slate-400",
  Finding: "text-forest-600 font-medium",
  "Clarification Request": "text-amber font-medium",
  Comment: "text-slate-600"
};

export default function VerificationCases() {
  const [cases, setCases] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteType, setNoteType] = useState("Comment");

  function load() {
    setLoading(true);
    api
      .getCases()
      .then(setCases)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function updateStatus(id, status) {
    try {
      await api.updateCaseStatus(id, status);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitNote(id) {
    if (!noteDraft.trim()) return;
    try {
      await api.addCaseNote(id, noteType, noteDraft.trim());
      setNoteDraft("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Module 2 — Feature 2"
        title="Verification Case Workspace"
        description="Every submitted application assigned to a structured case. Officers record findings, request clarification, attach comments, and update status — all in one timeline."
      />

      {error && <ErrorState message={error} />}
      {loading && !error && <p className="text-sm text-slate-500">Loading cases…</p>}
      {!loading && cases.length === 0 && !error && (
        <EmptyState message="No verification cases yet." />
      )}

      <div className="card overflow-hidden">
        {cases.map((c) => (
          <div key={c._id} className="ledger-row">
            <button
              onClick={() => setOpenId(openId === c._id ? null : c._id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-forest-50/40 transition-colors"
            >
              <div>
                <p className="font-mono text-xs text-slate-500">{c.caseId}</p>
                <p className="font-medium">{c.applicantName}</p>
                <p className="text-sm text-slate-500">{c.scheme}</p>
              </div>
              <StatusBadge value={c.status} />
            </button>

            {openId === c._id && (
              <div className="px-5 pb-5 pt-1 bg-forest-50/30">
                <div className="mb-4">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Timeline
                  </p>
                  <ul className="space-y-2">
                    {(c.timeline || []).map((t, i) => (
                      <li key={i} className="text-sm pl-3 border-l-2 border-forest-200">
                        <span className={`text-[10px] font-mono uppercase tracking-wider mr-2 ${TYPE_STYLES[t.type] || "text-slate-500"}`}>
                          [{t.type}]
                        </span>
                        <span className="text-slate-700">{t.text}</span>
                      </li>
                    ))}
                    {(!c.timeline || c.timeline.length === 0) && (
                      <li className="text-sm text-slate-400">No activity yet.</li>
                    )}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(c._id, s)}
                      disabled={c.status === s}
                      className="text-xs rounded-sm border border-forest-300 px-3 py-1.5 hover:bg-forest-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Mark {s}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {NOTE_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setNoteType(t)}
                      className={`text-xs rounded-sm px-3 py-1.5 border transition-colors ${
                        noteType === t
                          ? "bg-forest-600 text-parchment border-forest-600"
                          : "border-forest-200 hover:bg-forest-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder={`Add a ${noteType.toLowerCase()}…`}
                    className="flex-1 rounded-sm border border-forest-200 px-3 py-2 text-sm bg-white focus:border-forest-500 outline-none"
                  />
                  <button
                    onClick={() => submitNote(c._id)}
                    className="rounded-sm bg-forest-600 text-parchment text-sm px-4 py-2 hover:bg-forest-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
