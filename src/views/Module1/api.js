// Shared API helper for the Beneficiary Lifecycle Management module.
// vite.config.mjs should proxy /api -> http://localhost:1234 (the backend
// port from .env / server.js). Override with VITE_API_BASE if frontend/backend
// are ever deployed separately.
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.message || body.error || `Request failed with status ${res.status}`);
  }

  return body.data;
}

export const api = {
  // Analytics
  getOverview: () => request('/analytics/overview'),
  getRegionDistribution: () => request('/analytics/region-distribution'),
  getBudgetUtilization: () => request('/analytics/budget-utilization'),
  getProcessingTime: () => request('/analytics/processing-time'),
  getSchemePopularity: () => request('/analytics/scheme-popularity'),
  getDashboard: (query = '') => request(`/analytics/dashboard${query}`),
  getSchemeAnalytics: () => request('/analytics/scheme-analytics'),

  // Beneficiaries — no /filter sub-route in your routes file, so filters
  // are passed as a query string directly on the base '/' route.
  getBeneficiaries: (query = '') => request(`/beneficiaries${query}`),
  getBeneficiary: (id) => request(`/beneficiaries/${id}`),
  createBeneficiary: (body) => request('/beneficiaries', { method: 'POST', body: JSON.stringify(body) }),
  updateBeneficiary: (id, body) =>
    request(`/beneficiaries/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBeneficiary: (id) => request(`/beneficiaries/${id}`, { method: 'DELETE' }),

  // Audit logs — same story, query string on the base route
  getAuditLogs: (query = '') => request(`/audit-logs${query}`),

  // Circulars
  getCirculars: () => request('/circulars'),
  syncCirculars: (circulars) =>
    request('/circulars/sync', { method: 'POST', body: JSON.stringify({ circulars }) })
};
