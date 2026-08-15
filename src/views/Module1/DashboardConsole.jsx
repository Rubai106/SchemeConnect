import { useEffect, useState } from 'react';
import ConsoleLayout from './ConsoleLayout';
import { api } from './api';

function Tile({ label, value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-[#E9E9E7] rounded-md p-5 text-left hover:bg-[#DCEBE2] transition-colors"
    >
      <p className="text-sm text-[#24282C] mb-3">{label}</p>
      <p className="text-2xl text-[#24282C] font-medium">{value}</p>
    </button>
  );
}

export default function DashboardConsole({ onNavigate }) {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getOverview()
      .then((res) => !cancelled && setOverview(res))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ConsoleLayout active="dashboard" onNavigate={onNavigate}>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-8 h-8 rounded-full bg-[#6E9686] flex-shrink-0" />
          <h1 className="text-base font-medium text-[#24282C]">Welcome back</h1>
        </div>

        {error && (
          <div className="bg-[#B23B3B]/10 border border-[#B23B3B]/30 text-[#B23B3B] rounded-md p-3 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Tile label="Total Applications" value={overview ? overview.totalApplications : '—'} />
          <Tile label="Approval Rate" value={overview ? `${overview.approvalRate}%` : '—'} />
          <Tile label="Rejection Rate" value={overview ? `${overview.rejectionRate}%` : '—'} />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('beneficiaries')}
            className="bg-[#6E9686] text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            Go to Beneficiary Records
          </button>
          <button
            onClick={() => onNavigate('analytics')}
            className="bg-[#6E9686] text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            Go to Performance Intelligence
          </button>
        </div>
      </div>
    </ConsoleLayout>
  );
}
