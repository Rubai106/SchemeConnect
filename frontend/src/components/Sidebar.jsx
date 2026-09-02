import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", eyebrow: "01" },
  { to: "/fraud", label: "Fraud & Duplicates", eyebrow: "02" },
  { to: "/cases", label: "Verification Cases", eyebrow: "03" },
  { to: "/inspections", label: "Field Inspections", eyebrow: "04" }
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-forest-100 bg-forest-600 text-parchment min-h-screen flex flex-col">
      <div className="px-6 pt-8 pb-6 border-b border-forest-500/40">
        <p className="font-mono text-[11px] tracking-[0.2em] text-forest-100/70 uppercase">
          SchemeConnect
        </p>
        <h1 className="font-display text-2xl mt-1 leading-tight">
          Verification<br />Operations
        </h1>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-parchment text-forest-700 font-medium"
                  : "text-forest-50/85 hover:bg-forest-500/40"
              }`
            }
          >
            <span className="font-mono text-[10px] opacity-60">{l.eyebrow}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-5 border-t border-forest-500/40 text-[11px] text-forest-100/60 font-mono">
        Officer console
      </div>
    </aside>
  );
}
