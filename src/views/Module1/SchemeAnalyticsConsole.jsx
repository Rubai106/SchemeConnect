import { useEffect, useState } from 'react';
import ConsoleLayout from './ConsoleLayout';
import { api } from './api';

function StatBlock({ label, value, bold }) {
  return (
    <div className="bg-[#E9E9E7] rounded-md p-5 flex-1">
      <p className={`text-sm text-[#24282C] mb-3 ${bold ? 'font-bold' : ''}`}>{label}</p>
      <p className="text-2xl text-[#24282C] font-medium">{value}</p>
    </div>
  );
}

function downloadReport(data) {
  const lines = [
    `Total Beneficiaries: ${data.totalBeneficiaries}`,
    `Active Rate: ${data.activeRate}`,
    `Avg Verification Time: ${data.avgVerificationTimeDays} days`,
    `Compliance Score: ${data.complianceScore}`,
    '',
    'Scheme-wise Active Rate:',
    ...data.schemeWiseActiveRate.map((s) => `${s.schemeName}: ${s.activeRate}`)
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `scheme-analytics-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function SchemeAnalyticsConsole({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getSchemeAnalytics()
      .then((res) => !cancelled && setData(res))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ConsoleLayout active="analytics" onNavigate={onNavigate}>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-8 h-8 rounded-full bg-[#6E9686] flex-shrink-0" />
          <h1 className="text-base font-medium text-[#24282C]">Scheme Analytics</h1>
        </div>

        {loading ? (
          <p className="text-sm text-[#6B7280]">Loading analytics…</p>
        ) : error ? (
          <div className="bg-[#B23B3B]/10 border border-[#B23B3B]/30 text-[#B23B3B] rounded-md p-3 text-sm">
            {error}
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-10">
              <StatBlock label="Total Beneficiary" value={data.totalBeneficiaries} />
              <StatBlock label="Active Rate" value={data.activeRate} />
              <StatBlock label="Avg Verification Time" value={`${data.avgVerificationTimeDays} days`} />
              <StatBlock label="Compliance Score" value={data.complianceScore} bold />
            </div>

            <div className="bg-[#DCEBE2] rounded-md p-6 max-w-md mb-10">
              <h2 className="text-[#2F6B4F] font-medium mb-4">Scheme-wise Active Rate</h2>
              <div className="space-y-2">
                {data.schemeWiseActiveRate.length === 0 ? (
                  <p className="text-sm text-[#2F6B4F]/70">No schemes with beneficiaries yet.</p>
                ) : (
                  data.schemeWiseActiveRate.map((s) => (
                    <div key={s.schemeName} className="flex justify-between text-sm">
                      <span className="text-[#24282C]">{s.schemeName}</span>
                      <span className="text-[#24282C]">{s.activeRate}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onNavigate && onNavigate('dashboard')}
                className="bg-[#6E9686] text-white text-sm font-medium px-6 py-2 rounded-md"
              >
                Back
              </button>
              <button
                onClick={() => downloadReport(data)}
                className="bg-[#6E9686] text-white text-sm font-medium px-6 py-2 rounded-md"
              >
                Download Report
              </button>
            </div>
          </>
        )}
      </div>
    </ConsoleLayout>
  );
}
