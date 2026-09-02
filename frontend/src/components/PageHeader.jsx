export default function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-8">
      <p className="font-mono text-[11px] tracking-[0.2em] text-forest-600/70 uppercase mb-2">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl text-slate-ink">{title}</h2>
      {description && (
        <p className="text-sm text-slate-500 mt-2 max-w-xl">{description}</p>
      )}
    </div>
  );
}
