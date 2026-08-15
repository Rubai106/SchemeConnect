// Central place for talking to the SchemeConnect backend.
// Change this if your server runs on a different port.
const BASE_URL = "http://localhost:9141";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Fraud detection
  getFlaggedApplications: () => request("/flagged-applications"),
  getFlaggedApplication: (id) => request(`/flagged-applications/${id}`),
  decideFlaggedApplication: (id, decision) =>
    request(`/flagged-applications/${id}/decision`, {
      method: "PUT",
      body: JSON.stringify({ decision })
    }),
  analyzeFlaggedApplication: (id) =>
    request(`/flagged-applications/${id}/analyze`, { method: "POST" }),

  // Verification cases
  getCases: () => request("/verification-cases"),
  getCase: (id) => request(`/verification-cases/${id}`),
  updateCaseStatus: (id, status) =>
    request(`/verification-cases/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    }),
  addCaseNote: (id, event) =>
    request(`/verification-cases/${id}/notes`, {
      method: "POST",
      body: JSON.stringify({ event })
    }),

  // Field inspections
  getInspections: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/field-inspections${qs ? `?${qs}` : ""}`);
  },
  getOverdueInspections: () => request("/field-inspections/overdue"),
  createInspection: (payload) =>
    request("/field-inspections", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  recordOutcome: (id, visitOutcome) =>
    request(`/field-inspections/${id}/outcome`, {
      method: "PUT",
      body: JSON.stringify({ visitOutcome })
    }),
  addEvidence: (id, description, fileUrl) =>
    request(`/field-inspections/${id}/evidence`, {
      method: "POST",
      body: JSON.stringify({ description, fileUrl })
    }),

  // Dashboard
  getDashboardSummary: () => request("/dashboard/summary"),
  getOfficerPerformance: () => request("/dashboard/officer-performance"),
  getPendingCases: () => request("/dashboard/pending-cases"),
  getOverdueInspectionsList: () => request("/dashboard/overdue-inspections")
};
