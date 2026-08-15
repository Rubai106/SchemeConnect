import { useEffect, useMemo, useState } from 'react';
import ConsoleLayout from './ConsoleLayout';
import { api } from './api';

const STATUS_LABELS = {
  pending: 'Pending',
  under_review: 'Under Review',
  verified: 'Verified',
  flagged: 'Flagged'
};

const STATUS_STYLES = {
  pending: 'text-[#6B7280]',
  under_review: 'text-[#A6741E]',
  verified: 'text-[#2F6B4F]',
  flagged: 'text-[#B23B3B] font-medium'
};

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 14) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}

function downloadCsv(rows) {
  const header = ['Beneficiary', 'Scheme', 'Status', 'Region', 'Last Updated'];
  const lines = rows.map((b) => [
    b.name,
    b.schemeId?.name || '',
    STATUS_LABELS[b.status],
    b.region,
    new Date(b.updatedAt).toLocaleDateString()
  ]);
  const csv = [header, ...lines].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `beneficiary-records-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const EMPTY_FORM = { name: '', nationalId: '', contactNumber: '', region: '', schemeId: '' };

export default function BeneficiaryRecordsConsole({ onNavigate }) {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setBeneficiaries(await api.getBeneficiaries());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return beneficiaries;
    const q = search.trim().toLowerCase();
    return beneficiaries.filter(
      (b) => b.name.toLowerCase().includes(q) || b.nationalId.toLowerCase().includes(q)
    );
  }, [beneficiaries, search]);

  async function handleRegister(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.createBeneficiary(form);
      setForm(EMPTY_FORM);
      setShowRegisterForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ConsoleLayout active="beneficiaries" onNavigate={onNavigate}>
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#6E9686] flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#24282C] leading-tight">Beneficiary Lifecycle</p>
              <p className="text-sm text-[#6B7280] leading-tight">Management Console</p>
            </div>
          </div>
          <input
            type="text"
            placeholder="Search by name, ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-black/10 rounded-full px-4 py-2 text-sm w-72 bg-[#F3F3F1]"
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-wide text-[#24282C] uppercase">
            Beneficiary Records
          </h2>
          <button
            onClick={() => setShowRegisterForm((v) => !v)}
            className="bg-[#6E9686] text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            + Register Beneficiary
          </button>
        </div>

        {showRegisterForm && (
          <form
            onSubmit={handleRegister}
            className="bg-[#F3F3F1] border border-black/5 rounded-lg p-4 mb-4 grid gap-3 md:grid-cols-3"
          >
            <input
              required
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white"
            />
            <input
              required
              placeholder="National ID"
              value={form.nationalId}
              onChange={(e) => setForm((f) => ({ ...f, nationalId: e.target.value }))}
              className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white"
            />
            <input
              required
              placeholder="Contact number"
              value={form.contactNumber}
              onChange={(e) => setForm((f) => ({ ...f, contactNumber: e.target.value }))}
              className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white"
            />
            <input
              required
              placeholder="Region (e.g. Khulna)"
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white"
            />
            <input
              required
              placeholder="Scheme ID"
              value={form.schemeId}
              onChange={(e) => setForm((f) => ({ ...f, schemeId: e.target.value }))}
              className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#6E9686] text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50"
            >
              {submitting ? 'Registering…' : 'Save Beneficiary'}
            </button>
          </form>
        )}

        {error && (
          <div className="bg-[#B23B3B]/10 border border-[#B23B3B]/30 text-[#B23B3B] rounded-md p-3 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="border border-black/5 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#6E9686] text-white text-left">
                <th className="py-3 px-4 font-medium">Beneficiary</th>
                <th className="py-3 px-4 font-medium">Scheme</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Region</th>
                <th className="py-3 px-4 font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#6B7280]">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#6B7280]">
                    No beneficiary records found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b._id} className="border-b border-black/5 last:border-0 odd:bg-[#F7F7F6]">
                    <td className="py-3 px-4 text-[#24282C]">{b.name}</td>
                    <td className="py-3 px-4 text-[#24282C]">{b.schemeId?.name || '—'}</td>
                    <td className={`py-3 px-4 ${STATUS_STYLES[b.status]}`}>{STATUS_LABELS[b.status]}</td>
                    <td className="py-3 px-4 text-[#24282C]">{b.region}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{timeAgo(b.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => downloadCsv(filtered)}
            className="bg-[#6E9686] text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            Generate Report
          </button>
        </div>
      </div>
    </ConsoleLayout>
  );
}
