import { useEffect, useState } from 'react';
import ConsoleLayout from './ConsoleLayout';
import { api } from './api';

const ROLES = ['Citizen', 'Verification Officer', 'Finance Officer', 'Administrator', 'Auditor'];

export default function AuditLogCenter({ onNavigate }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ role: '', action: '', startDate: '', endDate: '' });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const query = params.toString() ? `?${params.toString()}` : '';
      setLogs(await api.getAuditLogs(query));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.role, filters.action, filters.startDate, filters.endDate]);

  return (
    <ConsoleLayout active="audit-log" onNavigate={onNavigate}>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-full bg-[#6E9686] flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#24282C] leading-tight">Governance Audit Center</p>
            <p className="text-sm text-[#6B7280] leading-tight">Compliance & activity trail</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filters.role}
            onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
            className="border border-black/10 rounded-md px-3 py-2 text-sm bg-[#F3F3F1] w-56"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filter by action (e.g. BENEFICIARY_UPDATED)"
            value={filters.action}
            onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
            className="border border-black/10 rounded-md px-3 py-2 text-sm bg-[#F3F3F1] w-72"
          />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            className="border border-black/10 rounded-md px-3 py-2 text-sm bg-[#F3F3F1]"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            className="border border-black/10 rounded-md px-3 py-2 text-sm bg-[#F3F3F1]"
          />
        </div>

        {error && (
          <div className="bg-[#B23B3B]/10 border border-[#B23B3B]/30 text-[#B23B3B] rounded-md p-3 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="border border-black/5 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#6E9686] text-white text-left">
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-4 font-medium">Action</th>
                <th className="py-3 px-4 font-medium">Performed By</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium">Target</th>
                <th className="py-3 px-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6B7280]">
                    Loading…
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6B7280]">
                    No audit log entries match these filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="border-b border-black/5 last:border-0 odd:bg-[#F7F7F6] align-top">
                    <td className="py-3 px-4 text-[#6B7280] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#2F6B4F]">{log.action}</td>
                    <td className="py-3 px-4 text-[#24282C]">{log.performedBy}</td>
                    <td className="py-3 px-4 text-[#24282C]">{log.role}</td>
                    <td className="py-3 px-4 text-[#6B7280]">
                      {log.targetType}
                      {log.targetId ? ` · ${log.targetId}` : ''}
                    </td>
                    <td className="py-3 px-4 text-[#6B7280]">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ConsoleLayout>
  );
}
