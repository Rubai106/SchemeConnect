import { useEffect, useState } from 'react';
import { api } from './api';

// Design tokens for this module (kept local so the module can be dropped
// into any layout without fighting a global theme):
//   primary   #045C43  (deep green, referencing the national flag)
//   accent    #D6373C  (muted red, used only for negative/alert states)
//   surface   #F7F5F0  (warm off-white background)
//   ink       #20242A  (primary text)
//   muted     #6B7280  (secondary text)

function StatCard({ label, value, tone = 'default' }) {
  const toneClass =
    tone === 'positive'
      ? 'text-[#045C43]'
      : tone === 'negative'
      ? 'text-[#D6373C]'
      : 'text-[#20242A]';
  return (
    <div className="bg-white border border-black/5 rounded-lg p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-[#6B7280] mb-2">{label}</p>
      <p className={`text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function Bar({ label, value, max, formatValue }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#20242A]">{label}</span>
        <span className="text-[#6B7280]">{formatValue ? formatValue(value) : value}</span>
      </div>
      <div className="h-2 bg-black/5 rounded-full overflow-hidden">
        <div className="h-full bg-[#045C43] rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState(null);
  const [regions, setRegions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [popularity, setPopularity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [ov, dist, bud, pop] = await Promise.all([
          api.getOverview(),
          api.getRegionDistribution(),
          api.getBudgetUtilization(),
          api.getSchemePopularity()
        ]);
        if (cancelled) return;
        setOverview(ov);
        setRegions(dist);
        setBudgets(bud);
        setPopularity(pop);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="p-8 text-[#6B7280]">Loading analytics…</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-[#D6373C]/10 border border-[#D6373C]/30 text-[#D6373C] rounded-md p-4 text-sm">
          Couldn't load the dashboard: {error}
        </div>
      </div>
    );
  }

  const maxRegion = Math.max(1, ...regions.map((d) => d.totalBeneficiaries));
  const maxPopularity = Math.max(1, ...popularity.map((p) => p.applicationCount));

  return (
    <div className="min-h-screen bg-[#F7F5F0] p-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wide text-[#045C43] font-medium mb-1">
          Welfare Performance Intelligence
        </p>
        <h1 className="text-2xl font-semibold text-[#20242A]">Scheme Performance Overview</h1>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Applications" value={overview.totalApplications} />
        <StatCard label="Approved" value={overview.approved} tone="positive" />
        <StatCard label="Rejected" value={overview.rejected} tone="negative" />
        <StatCard label="Pending" value={overview.pending} />
        <StatCard label="Approval Rate" value={overview.approvalRate} tone="positive" />
        <StatCard label="Rejection Rate" value={overview.rejectionRate} tone="negative" />
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-black/5 rounded-lg p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#20242A] mb-4">
            Region-wise Beneficiary Distribution
          </h2>
          {regions.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No beneficiary data yet.</p>
          ) : (
            regions
              .slice(0, 10)
              .map((d) => (
                <Bar key={d.region} label={d.region} value={d.totalBeneficiaries} max={maxRegion} />
              ))
          )}
        </div>

        <div className="bg-white border border-black/5 rounded-lg p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#20242A] mb-4">Scheme Popularity</h2>
          {popularity.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No applications yet.</p>
          ) : (
            popularity
              .slice(0, 10)
              .map((p) => (
                <Bar
                  key={p.schemeName}
                  label={p.schemeName}
                  value={p.applicationCount}
                  max={maxPopularity}
                />
              ))
          )}
        </div>

        <div className="bg-white border border-black/5 rounded-lg p-6 shadow-sm md:col-span-2">
          <h2 className="text-sm font-semibold text-[#20242A] mb-4">Budget Utilization by Scheme</h2>
          {budgets.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No schemes configured yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#6B7280] border-b border-black/5">
                  <th className="py-2 font-medium">Scheme</th>
                  <th className="py-2 font-medium">Allocated</th>
                  <th className="py-2 font-medium">Utilized</th>
                  <th className="py-2 font-medium">Remaining</th>
                  <th className="py-2 font-medium">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => {
                  const low = b.remaining / b.budgetAllocated < 0.15;
                  return (
                    <tr key={b.scheme} className="border-b border-black/5 last:border-0">
                      <td className="py-2 text-[#20242A]">{b.scheme}</td>
                      <td className="py-2 text-[#20242A]">৳{b.budgetAllocated.toLocaleString()}</td>
                      <td className="py-2 text-[#20242A]">৳{b.budgetUtilized.toLocaleString()}</td>
                      <td className={`py-2 ${low ? 'text-[#D6373C] font-medium' : 'text-[#20242A]'}`}>
                        ৳{b.remaining.toLocaleString()}
                        {low ? ' · low' : ''}
                      </td>
                      <td className="py-2 text-[#20242A]">{b.utilizationRate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
