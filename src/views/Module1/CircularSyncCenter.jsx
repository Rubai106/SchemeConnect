import { useEffect, useState } from 'react';
import ConsoleLayout from './ConsoleLayout';
import { api } from './api';

const EMPTY_FORM = { title: '', description: '', fileUrl: '', publishedDate: '' };

export default function CircularSyncCenter({ onNavigate }) {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setCirculars(await api.getCirculars());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSync(e) {
    e.preventDefault();
    if (!form.title || !form.fileUrl || !form.publishedDate) return;
    setSyncing(true);
    setError(null);
    try {
      await api.syncCirculars([form]);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <ConsoleLayout active="circulars" onNavigate={onNavigate}>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 rounded-full bg-[#6E9686] flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#24282C] leading-tight">
              Official Circular Synchronization
            </p>
            <p className="text-sm text-[#6B7280] leading-tight">
              Synced circulars update eligibility rules across all schemes automatically.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSync}
          className="bg-[#F3F3F1] border border-black/5 rounded-lg p-5 my-6 grid gap-3 md:grid-cols-2"
        >
          <input
            type="text"
            placeholder="Circular title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="border border-black/10 rounded-md px-3 py-2 text-sm md:col-span-2 bg-white"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="border border-black/10 rounded-md px-3 py-2 text-sm md:col-span-2 bg-white"
          />
          <input
            type="url"
            placeholder="Google Drive file URL"
            value={form.fileUrl}
            onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
            className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white"
            required
          />
          <input
            type="date"
            value={form.publishedDate}
            onChange={(e) => setForm((f) => ({ ...f, publishedDate: e.target.value }))}
            className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white"
            required
          />
          <button
            type="submit"
            disabled={syncing}
            className="md:col-span-2 justify-self-start bg-[#6E9686] text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50"
          >
            {syncing ? 'Syncing…' : 'Sync from Google Drive'}
          </button>
        </form>

        {error && (
          <div className="bg-[#B23B3B]/10 border border-[#B23B3B]/30 text-[#B23B3B] rounded-md p-3 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-3">
          {loading ? (
            <p className="text-sm text-[#6B7280]">Loading circulars…</p>
          ) : circulars.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No circulars synced yet.</p>
          ) : (
            circulars.map((c) => {
              const content = (
                <>
                  <div>
                    <p className="text-sm font-medium text-[#24282C]">{c.title}</p>
                    {c.description && <p className="text-sm text-[#6B7280] mt-1">{c.description}</p>}
                  </div>
                  {c.publishedDate && (
                    <p className="text-xs text-[#6B7280] whitespace-nowrap ml-4">
                      {new Date(c.publishedDate).toLocaleDateString()}
                    </p>
                  )}
                </>
              );
              return c.fileUrl ? (
                <a
                  key={c._id}
                  href={c.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white border border-black/5 hover:border-[#6E9686]/40 rounded-lg shadow-sm p-4 flex justify-between items-start transition-colors"
                >
                  {content}
                </a>
              ) : (
                <div
                  key={c._id}
                  className="bg-white border border-black/5 rounded-lg shadow-sm p-4 flex justify-between items-start"
                >
                  {content}
                </div>
              );
            })
          )}
        </div>
      </div>
    </ConsoleLayout>
  );
}
